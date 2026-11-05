import { act, renderHook } from '@testing-library/react-native';
import type { GestureResponderEvent, View } from 'react-native';
import { useCalendarDragSelection } from '../useCalendarDragSelection';

const touch = (pageX: number, pageY = 10) => ({ nativeEvent: { pageX, pageY } } as GestureResponderEvent);
async function setup() {
  const onCommit = jest.fn();
  const onPress = jest.fn();
  const hook = await renderHook(() => useCalendarDragSelection({ onCommit, onPress }));
  ['2026-10-20', '2026-10-21', '2026-10-22'].forEach((date, index) => {
    hook.result.current.dayProps(date, index === 1).ref({
      measure: (callback: (left: number, top: number, width: number, height: number, pageX: number, pageY: number) => void) => callback(0, 0, 40, 40, index * 40, 0),
    } as View);
  });
  return { ...hook, onCommit, onPress };
}

test('짧은 탭은 원래 선택 동작을 유지하고 드래그를 시작하지 않는다', async () => {
  const { result, onPress, onCommit } = await setup();
  await act(async () => result.current.dayProps('2026-10-20').onPress());
  expect(onPress).toHaveBeenCalledWith('2026-10-20');
  expect(result.current.gridHandlers.onMoveShouldSetResponderCapture()).toBe(false);
  expect(onCommit).not.toHaveBeenCalled();
});

test.each([['2026-10-20', 90, '2026-10-22'], ['2026-10-22', 10, '2026-10-20']])(
  '길게 누른 %s에서 좌우 이동 시 미리 표시하고 손을 뗄 때 한 번 확정한다', async (anchor, x, endpoint) => {
    const { result, onCommit, onPress } = await setup();
    await act(async () => result.current.dayProps(anchor).onLongPress());
    expect(result.current.gridHandlers.onMoveShouldSetResponderCapture()).toBe(true);
    await act(async () => result.current.gridHandlers.onTouchMove(touch(Number(x))));
    expect(result.current.preview).toEqual({ startDate: '2026-10-20', endDate: '2026-10-22' });
    expect(result.current.endpoint).toBe(endpoint);
    expect(onCommit).not.toHaveBeenCalled();
    await act(async () => result.current.gridHandlers.onTouchEnd(touch(Number(x))));
    await act(async () => result.current.gridHandlers.onResponderRelease(touch(Number(x))));
    await act(async () => result.current.dayProps(anchor).onPress());
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith({ startDate: '2026-10-20', endDate: '2026-10-22' }, endpoint);
    expect(onPress).not.toHaveBeenCalled();
    expect(result.current.preview).toBeNull();
  },
);

test('선택 불가 날짜와 달력 밖으로 이동해도 마지막 유효 날짜를 유지한다', async () => {
  const { result, onCommit } = await setup();
  await act(async () => result.current.dayProps('2026-10-20').onLongPress());
  await act(async () => result.current.gridHandlers.onTouchMove(touch(50)));
  await act(async () => result.current.gridHandlers.onTouchMove(touch(999)));
  await act(async () => result.current.gridHandlers.onTouchEnd(touch(999)));
  expect(onCommit).toHaveBeenCalledWith({ startDate: '2026-10-20', endDate: '2026-10-20' }, '2026-10-20');
});

test.each(['onResponderTerminate', 'onTouchCancel'] as const)('%s로 취소된 제스처는 저장하지 않으며 다음 탭은 정상 처리한다', async (cancel) => {
  const { result, onCommit, onPress } = await setup();
  await act(async () => result.current.dayProps('2026-10-20').onLongPress());
  await act(async () => result.current.gridHandlers[cancel]());
  await act(async () => result.current.gridHandlers.onTouchEnd(touch(90)));
  expect(onCommit).not.toHaveBeenCalled();
  await act(async () => result.current.gridHandlers.onTouchStart());
  await act(async () => result.current.dayProps('2026-10-22').onPress());
  expect(onPress).toHaveBeenCalledWith('2026-10-22');
});

test('토요일 24일에서 다음 행 일요일 25일로 이동해도 날짜 선택을 유지한다', async () => {
  const onCommit = jest.fn();
  const { result } = await renderHook(() => useCalendarDragSelection({ onCommit, onPress: jest.fn() }));
  for (const [date, x, y] of [['2026-10-24', 240, 0], ['2026-10-25', 0, 40]] as const) {
    result.current.dayProps(date).ref({ measure: (cb: (...values: number[]) => void) => cb(0, 0, 40, 40, x, y) } as View);
  }
  await act(async () => result.current.dayProps('2026-10-24').onLongPress());
  await act(async () => result.current.gridHandlers.onTouchMove(touch(10, 50)));
  expect(result.current.preview).toEqual({ startDate: '2026-10-24', endDate: '2026-10-25' });
  expect(result.current.gridHandlers.onResponderTerminationRequest()).toBe(false);
  await act(async () => result.current.gridHandlers.onTouchEnd(touch(10, 50)));
  expect(onCommit).toHaveBeenCalledWith({ startDate: '2026-10-24', endDate: '2026-10-25' }, '2026-10-25');
});
