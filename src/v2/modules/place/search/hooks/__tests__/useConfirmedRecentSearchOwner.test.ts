import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Profile } from '../../../../user/profile';
import { useConfirmedRecentSearchOwner } from '../useConfirmedRecentSearchOwner';

const profile = (id: number) => ({ id } as Profile);

describe('useConfirmedRecentSearchOwner', () => {
  test('cached profile을 사용하지 않고 현재 세션의 refetch 결과로만 owner를 확정한다', async () => {
    let finishRefetch: ((value: { data: Profile; isSuccess: boolean }) => void) | undefined;
    const refetchProfile = jest.fn(
      () => new Promise<{ data: Profile; isSuccess: boolean }>((resolve) => {
        finishRefetch = resolve;
      }),
    );

    const { result } = await renderHook(() => useConfirmedRecentSearchOwner(refetchProfile));
    expect(result.current).toBeUndefined();

    await act(async () => {
      finishRefetch?.({ data: profile(202), isSuccess: true });
    });

    await waitFor(() => expect(result.current).toEqual({ kind: 'user', userId: 202 }));
    expect(refetchProfile).toHaveBeenCalledTimes(1);
  });

  test('프로필 재검증 실패가 cached profile을 반환해도 owner를 노출하지 않는다', async () => {
    const refetchProfile = jest.fn().mockResolvedValue({
      data: profile(101),
      isSuccess: false,
    });
    const { result } = await renderHook(() => useConfirmedRecentSearchOwner(refetchProfile));

    await waitFor(() => expect(refetchProfile).toHaveBeenCalledTimes(1));
    expect(result.current).toBeUndefined();
  });

  test('유효하지 않은 사용자 ID에서는 owner를 노출하지 않는다', async () => {
    const refetchProfile = jest.fn().mockResolvedValue({ data: profile(0), isSuccess: true });
    const { result } = await renderHook(() => useConfirmedRecentSearchOwner(refetchProfile));

    await waitFor(() => expect(refetchProfile).toHaveBeenCalledTimes(1));
    expect(result.current).toBeUndefined();
  });
});
