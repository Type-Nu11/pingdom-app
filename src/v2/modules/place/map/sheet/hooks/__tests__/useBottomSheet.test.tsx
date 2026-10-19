import { Animated, PanResponder, type PanResponderCallbacks, type PanResponderGestureState, type GestureResponderEvent } from 'react-native';
import { useState } from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { resolveReleaseSnapPoint, shouldClaimVerticalDrag, useBottomSheet } from '../useBottomSheet';

describe('useBottomSheet', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  test('수직 이동만 바텀시트 드래그로 판정한다', () => {
    expect(shouldClaimVerticalDrag({ dx: 1, dy: -12 })).toBe(true);
    expect(shouldClaimVerticalDrag({ dx: 12, dy: -1 })).toBe(false);
    expect(shouldClaimVerticalDrag({ dx: 1, dy: -3 })).toBe(false);
  });

  test.each([4, 6, 8, -4, -6, -8])('버튼 탭 중 %sdp 미세 이동은 부모 시트가 가로채지 않는다', (dy) => {
    expect(shouldClaimVerticalDrag({ dx: 1, dy })).toBe(false);
  });

  test('명확한 수직 드래그는 유지하고 가로·대각선 이동은 가로채지 않는다', () => {
    expect(shouldClaimVerticalDrag({ dx: 2, dy: 9 })).toBe(true);
    expect(shouldClaimVerticalDrag({ dx: 2, dy: -9 })).toBe(true);
    expect(shouldClaimVerticalDrag({ dx: 20, dy: 12 })).toBe(false);
    expect(shouldClaimVerticalDrag({ dx: 12, dy: 12 })).toBe(false);
  });

  test('대각선에 가까운 이동은 가로 스크롤에 양보하도록 수직 우세(1.2배)일 때만 가로챈다', () => {
    expect(shouldClaimVerticalDrag({ dx: 10, dy: 11 })).toBe(false);
    expect(shouldClaimVerticalDrag({ dx: 10, dy: 13 })).toBe(true);
  });

  describe('놓았을 때 스냅 판정', () => {
    const values = { collapsed: 780, expanded: 130, medium: 480 } as const;

    test.each([
      ['중간에서 짧고 빠른 위 스와이프는 펼친다', 'medium', -20, -0.5, 'expanded'],
      ['중간에서 간격의 20% 이상 천천히 올리면 펼친다', 'medium', -75, -0.05, 'expanded'],
      ['중간에서 20% 미만으로 천천히 올리면 제자리로 돌아온다', 'medium', -60, -0.05, 'medium'],
      ['펼친 상태에서 짧고 빠른 아래 스와이프는 중간으로 내린다', 'expanded', 20, 0.5, 'medium'],
      ['접힌 상태에서 짧고 빠른 위 스와이프는 중간으로 올린다', 'collapsed', -20, -0.5, 'medium'],
      ['중간에서 짧고 빠른 아래 스와이프는 접히지 않는다', 'medium', 40, 0.8, 'medium'],
      ['중간에서 48dp 이상 빠르게 내리면 접는다', 'medium', 50, 0.8, 'collapsed'],
      ['접힌 상태에서 중간을 지나 끝까지 끌어 올리면 가장 가까운 펼침으로 간다', 'collapsed', -600, -0.2, 'expanded'],
    ] as const)('%s', (_name, from, dy, vy, expected) => {
      expect(resolveReleaseSnapPoint(from, values, values[from], { dy, vy })).toBe(expected);
    });
  });

  test.each([12, 24, 40])('중간 높이에서 짧은 %sdp 드래그는 속도가 빨라도 화면 밖으로 접히지 않는다', async (dy) => {
    const create = jest.spyOn(PanResponder, 'create');
    const { result } = await renderHook(() => useBottomSheet({ collapsedTranslateY: 680, mediumTranslateY: 400 }));
    const callbacks: PanResponderCallbacks = create.mock.calls[0][0];
    await act(() => callbacks.onPanResponderRelease?.({} as GestureResponderEvent, { dy, vy: 0.8 } as PanResponderGestureState));
    expect(result.current.snapPoint).toBe('medium');
  });

  test('충분히 길게 내리면 접히고 스프링은 하단 경계를 넘지 않는다', async () => {
    const create = jest.spyOn(PanResponder, 'create');
    const spring = jest.spyOn(Animated, 'spring');
    const { result } = await renderHook(() => useBottomSheet({ collapsedTranslateY: 680, mediumTranslateY: 400 }));
    const callbacks: PanResponderCallbacks = create.mock.calls[0][0];
    await act(() => callbacks.onPanResponderRelease?.({} as GestureResponderEvent, { dy: 100, vy: 0.8 } as PanResponderGestureState));
    expect(result.current.snapPoint).toBe('collapsed');
    expect(spring.mock.calls).toHaveLength(2);
    spring.mock.calls.forEach(([, config]) => expect(config.overshootClamping).toBe(true));
  });

  test('홈에서 상세로 높이를 바꾸며 열 때 새 좌표로만 애니메이션한다', async () => {
    const spring = jest.spyOn(Animated, 'spring');
    const { result } = await renderHook(() => {
      const [mediumTranslateY, setMediumTranslateY] = useState(574);
      const sheet = useBottomSheet({ collapsedTranslateY: 840, mediumTranslateY });
      return { sheet, setMediumTranslateY };
    });

    await act(() => {
      result.current.setMediumTranslateY(524);
      result.current.sheet.snapTo('medium');
    });

    expect(spring).toHaveBeenCalledTimes(2);
    for (const [, config] of spring.mock.calls) {
      expect(config.toValue).toBe(524);
    }
    expect(result.current.sheet.snapPoint).toBe('medium');
    await act(() => jest.runAllTimers());
  });

  test('상세 전환으로 테두리 애니메이션이 취소되어도 시트 이동은 끝까지 진행한다', async () => {
    // Use RN's real cancellation semantics; AnimatedMock ignores stopTogether.
    const implementation = jest.requireActual('react-native/Libraries/Animated/AnimatedImplementation').default;
    jest.spyOn(Animated, 'parallel').mockImplementation(implementation.parallel);
    const animations: Array<{
      finish: (finished: boolean) => void;
      stop: jest.Mock;
    }> = [];
    jest.spyOn(Animated, 'spring').mockImplementation((value, config) => {
      let onEnd: ((result: { finished: boolean }) => void) | undefined;
      const finish = (finished: boolean) => {
        if (finished) (value as Animated.Value).setValue(config.toValue as number);
        onEnd?.({ finished });
      };
      const stop = jest.fn(() => finish(false));
      animations.push({ finish, stop });
      return {
        start: (callback) => { onEnd = callback; },
        stop,
        reset: jest.fn(),
      };
    });
    const { result } = await renderHook(() => useBottomSheet({
      collapsedTranslateY: 680, mediumTranslateY: 524,
    }));

    await act(() => result.current.snapTo('expanded'));
    await act(() => animations[1].stop());

    expect(animations[0].stop).not.toHaveBeenCalled();
    await act(() => animations[0].finish(true));
    expect((result.current.sheetTranslateY as unknown as { __getValue: () => number }).__getValue()).toBe(0);
  });

  test('즉시 전환은 대기 중인 스냅을 취소하고 변경된 높이에 정착한다', async () => {
    const spring = jest.spyOn(Animated, 'spring');
    const { result } = await renderHook(() => {
      const [mediumTranslateY, setMediumTranslateY] = useState(574);
      const sheet = useBottomSheet({ collapsedTranslateY: 840, mediumTranslateY });
      return { sheet, setMediumTranslateY };
    });

    await act(() => {
      result.current.sheet.snapTo('expanded');
      result.current.setMediumTranslateY(524);
      result.current.sheet.jumpTo('medium');
    });

    expect(spring).not.toHaveBeenCalled();
    expect(result.current.sheet.snapPoint).toBe('medium');
    for (const value of [result.current.sheet.sheetTranslateY, result.current.sheet.sheetChromeBottom]) {
      expect((value as unknown as { __getValue: () => number }).__getValue()).toBe(524);
    }
  });

  test('jumpTo는 탭 전환 시 애니메이션 없이 목적 snap point로 이동한다', async () => {
    const { result } = await renderHook(() => useBottomSheet({
      collapsedTranslateY: 640,
      initialSnapPoint: 'expanded',
      mediumTranslateY: 320,
    }));

    await act(() => result.current.jumpTo('medium'));

    expect(result.current.snapPoint).toBe('medium');
    expect((result.current.sheetTranslateY as unknown as { __getValue: () => number }).__getValue())
      .toBe(320);
    expect((result.current.sheetChromeBottom as unknown as { __getValue: () => number }).__getValue())
      .toBe(320);
  });
});
