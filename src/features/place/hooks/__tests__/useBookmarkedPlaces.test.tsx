import type { PropsWithChildren } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { placeApi } from '../../api/placeApi';
import type { Place, PlacesPage } from '../../model/place.types';
import {
  bookmarkedPlaceQueryKeys,
  useBookmarkedPlaces,
} from '../useBookmarkedPlaces';

const places: Place[] = [
  {
    address: '서울 성동구 연무장길 1',
    category: 'CAFE',
    id: 11,
    latitude: 37.54,
    longitude: 127.05,
    name: '첫 장소',
  },
  {
    address: '서울 성동구 연무장길 2',
    category: 'FASHION',
    id: 12,
    latitude: 37.55,
    longitude: 127.06,
    name: '둘째 장소',
  },
];

function page(pageNumber: number, pagePlaces: Place[], hasNext = false): PlacesPage {
  return {
    hasNext,
    limit: 20,
    page: pageNumber,
    places: pagePlaces,
    totalCount: places.length,
    totalPages: hasNext ? 2 : pageNumber,
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useBookmarkedPlaces', () => {
  test('장소 북마크 전용 query key로 서버 목록을 복원한다', async () => {
    jest.spyOn(placeApi, 'getBookmarkedPlaces').mockResolvedValue(page(1, places));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useBookmarkedPlaces(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(bookmarkedPlaceQueryKeys.list()[0]).toBe('placeBookmarks');
    expect(result.current.places).toEqual(places);
    expect(result.current.bookmarkedPlaceIds).toEqual({ '11': true, '12': true });
    expect(placeApi.getBookmarkedPlaces).toHaveBeenCalledWith({ limit: 20, page: 1 });
  });

  test('hasNext 응답에 따라 다음 페이지를 중복 없이 이어 붙인다', async () => {
    jest.spyOn(placeApi, 'getBookmarkedPlaces').mockImplementation(async (params) => (
      params?.page === 1 ? page(1, [places[0]], true) : page(2, [places[1]])
    ));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useBookmarkedPlaces(), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(async () => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.places).toHaveLength(2));

    expect(result.current.places.map((placeItem) => placeItem.id)).toEqual([11, 12]);
    expect(placeApi.getBookmarkedPlaces).toHaveBeenCalledTimes(2);
    expect(result.current.hasNextPage).toBe(false);
  });

  test('빈 응답을 mock 없이 빈 목록으로 노출한다', async () => {
    jest.spyOn(placeApi, 'getBookmarkedPlaces').mockResolvedValue(page(1, []));
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useBookmarkedPlaces(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.places).toEqual([]);
    expect(result.current.bookmarkedPlaceIds).toEqual({});
    expect(result.current.isError).toBe(false);
  });

  test.each([
    ['네트워크 오류', Object.assign(new Error('offline'), { isAxiosError: true }), false],
    ['401 인증 만료', { isAxiosError: true, response: { status: 401 } }, true],
  ])('%s 상태를 구분한다', async (_label, error, unauthorized) => {
    jest.spyOn(placeApi, 'getBookmarkedPlaces').mockRejectedValue(error);
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useBookmarkedPlaces(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 3000 });

    expect(result.current.isUnauthorized).toBe(unauthorized);
    expect(result.current.places).toEqual([]);
  });
});
