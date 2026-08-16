import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { placeApi } from '../api/placeApi';

export const BOOKMARKED_PLACES_PAGE_SIZE = 20;

export const bookmarkedPlaceQueryKeys = {
  all: ['placeBookmarks'] as const,
  list: () => [...bookmarkedPlaceQueryKeys.all, 'list'] as const,
  membership: () => [...bookmarkedPlaceQueryKeys.all, 'membership'] as const,
};

export function isBookmarkAuthenticationError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export async function getBookmarkedPlaceMembership() {
  const bookmarkedPlaceIds: Record<string, boolean> = {};
  let page = 1;

  while (true) {
    const response = await placeApi.getBookmarkedPlaces({
      limit: BOOKMARKED_PLACES_PAGE_SIZE,
      page,
    });

    response.places.forEach((place) => {
      bookmarkedPlaceIds[String(place.id)] = true;
    });

    if (!response.hasNext || page >= response.totalPages) break;
    page += 1;
  }

  return bookmarkedPlaceIds;
}

export const useBookmarkedPlaceMembership = (enabled = true) => {
  const membershipQuery = useQuery({
    enabled,
    queryFn: getBookmarkedPlaceMembership,
    queryKey: bookmarkedPlaceQueryKeys.membership(),
    retry: (failureCount, error) => (
      !isBookmarkAuthenticationError(error) && failureCount < 1
    ),
  });

  return {
    bookmarkedPlaceIds: membershipQuery.data ?? {},
    error: membershipQuery.error,
    isError: membershipQuery.isError,
    isLoading: membershipQuery.isLoading,
    isUnauthorized: isBookmarkAuthenticationError(membershipQuery.error),
    refetch: membershipQuery.refetch,
  };
};

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
  return {
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
