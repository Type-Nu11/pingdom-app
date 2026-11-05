import { act, renderHook } from '@testing-library/react-native';
import type { GestureResponderEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useSheetScrollHandoff } from '../useSheetScrollHandoff';
import { useBottomSheet } from '../useBottomSheet';

const touch = (x: number, y: number, count = 1) => ({
  nativeEvent: { pageX: x, pageY: y, touches: Array.from({ length: count }, () => ({})) },
} as GestureResponderEvent);
const scroll = (y: number) => ({
  nativeEvent: { contentOffset: { x: 0, y } },
} as NativeSyntheticEvent<NativeScrollEvent>);

describe('상세 스크롤에서 시트로 아래 드래그 전달', () => {
  const setup = async () => {
    const handlers = {
      onStartShouldSetResponderCapture: jest.fn(() => false),
      onMoveShouldSetResponderCapture: jest.fn(() => true),
      onMoveShouldSetResponder: jest.fn(() => true),
      onResponderGrant: jest.fn(),
      onResponderMove: jest.fn(),
      onResponderRelease: jest.fn(),
      onResponderTerminate: jest.fn(),
      onResponderTerminationRequest: jest.fn(() => false),
    };
    const { result } = await renderHook(() => useSheetScrollHandoff(handlers));
    return { handlers, ...result.current };
  };

  test('맨 위에서 아래로 당기면 기존 시트 드래그와 놓기 동작에 연결한다', async () => {
    const { handlers, panHandlers, onScroll } = await setup();
    onScroll(scroll(0));
    const start = touch(100, 150);
    expect(panHandlers.onStartShouldSetResponderCapture?.(start)).toBe(false);
    expect(handlers.onStartShouldSetResponderCapture).toHaveBeenCalledWith(start);
    const move = touch(102, 180);
    expect(panHandlers.onMoveShouldSetResponderCapture?.(move)).toBe(true);
    expect(handlers.onMoveShouldSetResponderCapture).toHaveBeenCalledWith(move);
    panHandlers.onResponderGrant?.(move);
    panHandlers.onResponderMove?.(touch(103, 260));
    panHandlers.onResponderRelease?.(touch(103, 260, 0));
    expect(handlers.onResponderGrant).toHaveBeenCalledTimes(1);
    expect(handlers.onResponderMove).toHaveBeenCalledTimes(1);
    expect(handlers.onResponderRelease).toHaveBeenCalledTimes(1);
    expect(panHandlers.onResponderTerminationRequest?.(move)).toBe(false);
  });

  test('중간에서 시작한 스크롤은 맨 위에 도달해도 같은 터치로 시트를 내리지 않는다', async () => {
    const { handlers, panHandlers, onScroll } = await setup();
    onScroll(scroll(240));
    panHandlers.onStartShouldSetResponderCapture?.(touch(100, 150));
    onScroll(scroll(0));
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(100, 420))).toBe(false);
    expect(panHandlers.onMoveShouldSetResponder?.(touch(100, 420))).toBe(false);
    expect(handlers.onMoveShouldSetResponderCapture).not.toHaveBeenCalled();
    // 손을 뗀 뒤 맨 위에서 새로 당기면 시트를 내릴 수 있다.
    panHandlers.onStartShouldSetResponderCapture?.(touch(100, 150));
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(100, 180))).toBe(true);
  });

  test.each([
    ['버튼의 미세 움직임', 1, 8],
    ['본문을 올리는 스크롤', 1, -30],
    ['사진을 넘기는 가로 스크롤', 40, 5],
    ['대각선 이동', 20, 20],
  ])('%s을 가로채지 않는다', async (_, dx, dy) => {
    const { handlers, panHandlers } = await setup();
    panHandlers.onStartShouldSetResponderCapture?.(touch(100, 150));
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(100 + dx, 150 + dy))).toBe(false);
    expect(panHandlers.onMoveShouldSetResponder?.(touch(100 + dx, 150 + dy))).toBe(false);
    expect(handlers.onMoveShouldSetResponderCapture).not.toHaveBeenCalled();
    expect(handlers.onMoveShouldSetResponder).not.toHaveBeenCalled();
  });

  test('가로 스와이프를 시작한 뒤 아래로 꺾어도 사진 스크롤을 빼앗지 않는다', async () => {
    const { panHandlers } = await setup();
    panHandlers.onStartShouldSetResponderCapture?.(touch(100, 150));
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(140, 155))).toBe(false);
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(140, 250))).toBe(false);
  });

  test('여러 손가락으로 시작한 제스처는 시트에 전달하지 않는다', async () => {
    const { panHandlers } = await setup();
    panHandlers.onStartShouldSetResponderCapture?.(touch(100, 150, 2));
    expect(panHandlers.onMoveShouldSetResponderCapture?.(touch(100, 200, 2))).toBe(false);
  });

  test('실제 시트 PanResponder를 통해 펼침에서 미리보기 높이로 내려간다', async () => {
    const { result } = await renderHook(() => {
      const sheet = useBottomSheet({
        collapsedTranslateY: 600, mediumTranslateY: 300, initialSnapPoint: 'expanded',
      });
      return { sheet, handoff: useSheetScrollHandoff(sheet.panHandlers) };
    });
    const event = (y: number, previousY: number, time: number) => ({
      ...touch(100, y),
      touchHistory: {
        numberActiveTouches: 1, indexOfSingleActiveTouch: 0, mostRecentTimeStamp: time,
        touchBank: [{
          touchActive: true, startPageX: 100, startPageY: 150, startTimeStamp: 1,
          currentPageX: 100, currentPageY: y, currentTimeStamp: time,
          previousPageX: 100, previousPageY: previousY, previousTimeStamp: time - 16,
        }],
      },
    });
    const pan = result.current.handoff.panHandlers;
    expect(pan.onStartShouldSetResponderCapture?.(event(150, 150, 1))).toBe(false);
    expect(pan.onMoveShouldSetResponderCapture?.(event(180, 150, 17))).toBe(true);
    await act(() => pan.onResponderGrant?.(event(180, 150, 17)));
    await act(() => pan.onResponderMove?.(event(280, 180, 33)));
    expect((result.current.sheet.sheetTranslateY as unknown as { __getValue: () => number }).__getValue()).toBe(100);
    await act(() => pan.onResponderRelease?.(event(280, 280, 49)));
    expect(result.current.sheet.snapPoint).toBe('medium');
    expect(result.current.sheet.presentedSnapPoint).toBe('medium');
  });
});
