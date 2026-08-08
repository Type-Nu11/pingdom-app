import { useQuery } from '@tanstack/react-query';
import { placeApi } from '../api/placeApi';

const BOOKMARKED_PLACES_PAGE_SIZE = 100;

export const bookmarkedPlaceQueryKeys = {
  all: ['bookmarkedPlaces'] as const,
  list: () => [...bookmarkedPlaceQueryKeys.all, 'list'] as const,
};

export const useBookmarkedPlaces = (enabled = true) => {
  const query = useQuery({
    enabled,
    queryFn: () => placeApi.getBookmarkedPlaces({ limit: BOOKMARKED_PLACES_PAGE_SIZE }),
    queryKey: bookmarkedPlaceQueryKeys.list(),
  });

  return {
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    places: query.data?.places ?? [],
    refetch: query.refetch,
  };
};

export default useBookmarkedPlaces;
