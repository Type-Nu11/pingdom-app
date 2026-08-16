import React, { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { placeApi } from '../../api/placeApi';
import type { Place, PlacesPage } from '../../model/place.types';
import { bookmarkedPlaceQueryKeys } from '../useBookmarkedPlaces';
import {
  updateBookmarkedPlaceMembership,
  updateBookmarkedPlaces,
  usePlaceBookmark,
} from '../usePlaceBookmark';

const firstPlace: Place = {
  address: '서울 성동구',
  id: 1,
  latitude: 37.5,
  longitude: 127,
  name: '첫 장소',
};
const secondPlace: Place = {
  address: '서울 마포구',
  id: 2,
  latitude: 37.6,
  longitude: 126.9,
  name: '둘째 장소',
};
const data: InfiniteData<PlacesPage> = {
  pageParams: [1],
  pages: [{
    hasNext: false,
    limit: 20,
    page: 1,
    places: [firstPlace],
    totalCount: 1,
    totalPages: 1,
  }],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children,
  );
  return { queryClient, wrapper };
}

describe('updateBookmarkedPlaces', () => {
  test('저장 시 목록과 marker의 공통 원본 캐시에 장소를 즉시 추가한다', () => {
    const updated = updateBookmarkedPlaces(data, secondPlace, true);

    expect(updated?.pages[0].places.map((place) => place.id)).toEqual([2, 1]);
    expect(updated?.pages[0].totalCount).toBe(2);
  });

  test('해제 시 모든 페이지에서 장소를 제거한다', () => {
    const updated = updateBookmarkedPlaces(data, firstPlace, false);

    expect(updated?.pages[0].places).toEqual([]);
    expect(updated?.pages[0].totalCount).toBe(0);
  });

  test('같은 저장 상태를 재적용해도 중복 항목이나 count를 만들지 않는다', () => {
    const updated = updateBookmarkedPlaces(data, firstPlace, true);

    expect(updated).toEqual(data);
  });
});

describe('updateBookmarkedPlaceMembership', () => {
  test('목록 pagination과 무관하게 장소 ID 상태를 갱신한다', () => {
    expect(updateBookmarkedPlaceMembership({ '1': true }, 2, true)).toEqual({
      '1': true,
      '2': true,
    });
    expect(updateBookmarkedPlaceMembership({ '1': true, '2': true }, 1, false)).toEqual({
      '2': true,
    });
  });
});

describe('usePlaceBookmark', () => {
  test('POST 성공을 장소 북마크 캐시에 반영한다', async () => {
    const createBookmark = jest.spyOn(placeApi, 'createBookmark').mockResolvedValue({
      id: 10,
      message: 'created',
      placeId: secondPlace.id,
    });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.list(), data);
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.membership(), { '1': true });
    const { result } = await renderHook(() => usePlaceBookmark(), { wrapper });

    await act(async () => result.current.togglePlaceBookmark(secondPlace, true));

    expect(createBookmark).toHaveBeenCalledWith({ placeId: secondPlace.id });
    const cached = queryClient.getQueryData<InfiniteData<PlacesPage>>(
      bookmarkedPlaceQueryKeys.list(),
    );
    expect(cached?.pages[0].places.map((place) => place.id)).toEqual([2, 1]);
    expect(queryClient.getQueryData(bookmarkedPlaceQueryKeys.membership())).toEqual({
      '1': true,
      '2': true,
    });
  });

  test('BOOKMARK_ALREADY_EXISTS 응답도 membership을 저장 상태로 수렴시킨다', async () => {
    jest.spyOn(placeApi, 'createBookmark').mockRejectedValue({
      isAxiosError: true,
      response: { data: { code: 'BOOKMARK_ALREADY_EXISTS' } },
    });
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.list(), data);
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.membership(), { '1': true });
    const { result } = await renderHook(() => usePlaceBookmark(), { wrapper });

    await act(async () => result.current.togglePlaceBookmark(secondPlace, true));

    expect(queryClient.getQueryData(bookmarkedPlaceQueryKeys.membership())).toEqual({
      '1': true,
      '2': true,
    });
  });

  test('DELETE 실패 시 낙관적으로 제거한 장소를 복원한다', async () => {
    const networkError = new Error('offline');
    const removeBookmark = jest.spyOn(placeApi, 'removeBookmark').mockRejectedValue(networkError);
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.list(), data);
    queryClient.setQueryData(bookmarkedPlaceQueryKeys.membership(), { '1': true });
    const { result } = await renderHook(() => usePlaceBookmark(), { wrapper });

    await act(async () => {
      await expect(result.current.togglePlaceBookmark(firstPlace, false)).rejects.toBe(networkError);
    });

    expect(removeBookmark).toHaveBeenCalledWith(firstPlace.id);
    expect(queryClient.getQueryData(bookmarkedPlaceQueryKeys.list())).toEqual(data);
    expect(queryClient.getQueryData(bookmarkedPlaceQueryKeys.membership())).toEqual({ '1': true });
  });
});
