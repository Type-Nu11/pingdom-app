import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReducedMotion } from '../useReducedMotion';

describe('useReducedMotion', () => {
  test('초기 설정과 변경 event를 반영하고 listener를 정리한다', async () => {
    let onChange: ((enabled: boolean) => void) | undefined;
    const remove = jest.fn();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const addEventListener = jest.spyOn(
      AccessibilityInfo,
      'addEventListener',
    ) as unknown as jest.SpyInstance;
    addEventListener.mockImplementation((event: string, listener: (enabled: boolean) => void) => {
      expect(event).toBe('reduceMotionChanged');
      onChange = listener;
      return { remove };
    });

    const result = await renderHook(() => useReducedMotion());
    await waitFor(() => expect(result.result.current).toBe(true));

    await act(() => onChange?.(false));
    expect(result.result.current).toBe(false);

    await result.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
