import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../shared/testing/testProviders';
import { bookmarkApi } from '../../api/bookmarkApi';
import { bookmarkQueryKeys, useToggleBookmark } from '../useBookmarks';

const BOOKMARK_MEMBERSHIP_KEY = bookmarkQueryKeys.membership();

// Kept in its own file: a mutation that rejects leaves an invalidation refetch
// behind, and sharing a file with the optimistic-update test made whichever ran
// second render with a null hook result.
describe('useToggleBookmark 실패 롤백', () => {
  test('추가 요청이 실패하면 낙관적으로 켠 별을 되돌린다', async () => {
    jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue({
      hasNext: false, limit: 100, page: 1, places: [], totalCount: 0, totalPages: 1,
    });
    jest.spyOn(bookmarkApi, 'addBookmark').mockRejectedValue(new Error('추가 실패'));

    const { queryClient, wrapper } = await createTestWrapper();
    queryClient.setQueryData(BOOKMARK_MEMBERSHIP_KEY, new Set<number>([7]));

    const { result } = await renderHook(() => useToggleBookmark(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nextBookmarked: true, placeId: 99 })
        .catch(() => undefined);
    });

    const membership = queryClient.getQueryData<ReadonlySet<number>>(BOOKMARK_MEMBERSHIP_KEY);
    expect(membership?.has(99)).toBe(false);
    expect(membership?.has(7)).toBe(true);
  });

  test('해제 요청이 실패하면 꺼둔 별을 되돌린다', async () => {
    jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue({
      hasNext: false, limit: 100, page: 1, places: [], totalCount: 0, totalPages: 1,
    });
    jest.spyOn(bookmarkApi, 'removeBookmark').mockRejectedValue(new Error('해제 실패'));

    const { queryClient, wrapper } = await createTestWrapper();
    queryClient.setQueryData(BOOKMARK_MEMBERSHIP_KEY, new Set<number>([7]));

    const { result } = await renderHook(() => useToggleBookmark(), { wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({ nextBookmarked: false, placeId: 7 })
        .catch(() => undefined);
    });

    const membership = queryClient.getQueryData<ReadonlySet<number>>(BOOKMARK_MEMBERSHIP_KEY);
    expect(membership?.has(7)).toBe(true);
  });
});
