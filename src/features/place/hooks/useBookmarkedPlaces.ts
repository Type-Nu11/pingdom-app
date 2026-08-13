import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { placeApi } from '../api/placeApi';

export const BOOKMARKED_PLACES_PAGE_SIZE = 20;

export const bookmarkedPlaceQueryKeys = {
  all: ['placeBookmarks'] as const,
  list: () => [...bookmarkedPlaceQueryKeys.all, 'list'] as const,
};

export function isBookmarkAuthenticationError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export const useBookmarkedPlaces = (enabled = true) => {
  const placesQuery = useInfiniteQuery({
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => placeApi.getBookmarkedPlaces({
      limit: BOOKMARKED_PLACES_PAGE_SIZE,
      page: pageParam,
    }),
    queryKey: bookmarkedPlaceQueryKeys.list(),
    retry: (failureCount, error) => (
      !isBookmarkAuthenticationError(error) && failureCount < 1
    ),
    getNextPageParam: (lastPage) => (
      lastPage.hasNext && lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined
    ),
  });
  const places = useMemo(
    () => placesQuery.data?.pages.flatMap((page) => page.places) ?? [],
    [placesQuery.data?.pages],
  );
  const bookmarkedPlaceIds = useMemo(() => places.reduce<Record<string, boolean>>((acc, place) => {
    acc[String(place.id)] = true;
    return acc;
  }, {}), [places]);

  return {
    bookmarkedPlaceIds,
    error: placesQuery.error,
    fetchNextPage: placesQuery.fetchNextPage,
    hasNextPage: placesQuery.hasNextPage,
    isError: placesQuery.isError,
    isFetchNextPageError: placesQuery.isFetchNextPageError,
    isFetchingNextPage: placesQuery.isFetchingNextPage,
    isLoading: placesQuery.isLoading,
    isUnauthorized: isBookmarkAuthenticationError(placesQuery.error),
    places,
    refetch: placesQuery.refetch,
  };
};

export default useBookmarkedPlaces;
