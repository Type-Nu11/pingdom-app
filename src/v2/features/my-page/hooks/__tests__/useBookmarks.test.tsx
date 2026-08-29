import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../shared/testing/testProviders';
import { bookmarkApi, type BookmarkedPlacesPage } from '../../api/bookmarkApi';
import { useBookmarkedPlaceIds, useToggleBookmark } from '../useBookmarks';



function page(overrides: Partial<BookmarkedPlacesPage> = {}): BookmarkedPlacesPage {
  return {
    hasNext: false,
    limit: 100,
    page: 1,
    places: [],
    totalCount: 0,
    totalPages: 1,
    ...overrides,
  };
}

function places(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => ({
    address: '주소',
    id: from + index,
    latitude: 0,
    longitude: 0,
    name: '장소',
  }));
}

describe('useBookmarkedPlaceIds', () => {
  test('첫 페이지에서 끝나면 요청을 한 번만 보낸다', async () => {
    const listBookmarks = jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue(
      page({ places: places(1, 3), totalCount: 3 }),
    );
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useBookmarkedPlaceIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listBookmarks).toHaveBeenCalledTimes(1);
    expect(listBookmarks).toHaveBeenCalledWith({ limit: 100, page: 1 });
    expect([...result.current.bookmarkedPlaceIds]).toEqual([1, 2, 3]);
  });

  test('서버가 페이지 크기를 깎아도 요청 수 상한을 넘지 않는다', async () => {
    // 서버가 limit을 20으로 깎고 페이지가 계속 남아 있는 상황.
    const listBookmarks = jest.spyOn(bookmarkApi, 'listBookmarks').mockImplementation(
      async ({ page: requested = 1 } = {}) => page({
        hasNext: true,
        limit: 20,
        page: requested,
        places: places(requested * 100, requested * 100 + 19),
        totalCount: 1_000,
        totalPages: 50,
      }),
    );
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useBookmarkedPlaceIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listBookmarks).toHaveBeenCalledTimes(5);
  });

  test('id 상한에 닿으면 남은 페이지가 있어도 멈춘다', async () => {
    const listBookmarks = jest.spyOn(bookmarkApi, 'listBookmarks').mockImplementation(
      async ({ page: requested = 1 } = {}) => page({
        hasNext: true,
        page: requested,
        // 한 페이지에 상한(500)을 넘는 id가 들어오는 경우.
        places: places(requested * 1_000, requested * 1_000 + 599),
        totalCount: 5_000,
        totalPages: 50,
      }),
    );
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useBookmarkedPlaceIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listBookmarks).toHaveBeenCalledTimes(1);
  });
});

describe('useToggleBookmark', () => {
  test('요청이 끝나기 전에 별표 상태를 먼저 바꾼다', async () => {
    jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue(
      page({ places: places(1, 1), totalCount: 1 }),
    );
    let releaseAdd: (() => void) = () => {};
    jest.spyOn(bookmarkApi, 'addBookmark').mockImplementation(
      () => new Promise<void>((resolve) => { releaseAdd = () => resolve(); }),
    );
    const { queryClient, wrapper } = await createTestWrapper();

    const { result, unmount } = await renderHook(
      () => ({ ids: useBookmarkedPlaceIds(), toggle: useToggleBookmark() }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.ids.isLoading).toBe(false));

    act(() => {
      result.current.toggle.mutate({ nextBookmarked: true, placeId: 42 });
    });

    // 응답이 아직 오지 않았는데도 별이 차 있어야 한다.
    await waitFor(() => expect(result.current.ids.bookmarkedPlaceIds.has(42)).toBe(true));
    expect(bookmarkApi.addBookmark).toHaveBeenCalledTimes(1);

    // 매달린 요청과 그 뒤의 무효화 리페치를 남기면 다음 테스트의 렌더까지
    // 깨진다. 끝까지 흘려보낸 뒤 캐시를 비운다.
    await act(async () => { releaseAdd(); });
    await waitFor(() => expect(result.current.toggle.isSuccess).toBe(true));
    unmount();
    queryClient.clear();
  });
});
