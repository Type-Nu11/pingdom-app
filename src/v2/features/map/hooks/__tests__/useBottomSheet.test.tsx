import { act, renderHook } from '@testing-library/react-native';

import { shouldClaimVerticalDrag, useBottomSheet } from '../useBottomSheet';

describe('useBottomSheet', () => {
  test('수직 이동만 바텀시트 드래그로 판정한다', () => {
    expect(shouldClaimVerticalDrag({ dx: 1, dy: -12 })).toBe(true);
    expect(shouldClaimVerticalDrag({ dx: 12, dy: -1 })).toBe(false);
    expect(shouldClaimVerticalDrag({ dx: 1, dy: -3 })).toBe(false);
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
