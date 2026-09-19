import { Animated } from 'react-native';
import { useState } from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { shouldClaimVerticalDrag, useBottomSheet } from '../useBottomSheet';

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
