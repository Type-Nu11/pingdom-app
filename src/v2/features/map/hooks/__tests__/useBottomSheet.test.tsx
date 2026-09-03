import { act, renderHook } from '@testing-library/react-native';

import { useBottomSheet } from '../useBottomSheet';

describe('useBottomSheet', () => {
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
