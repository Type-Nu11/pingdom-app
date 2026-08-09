import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBookmarkedPosts } from '../../record/hooks/usePostBookmark';
import { placeApi } from '../api/placeApi';

const BOOKMARKED_PLACES_PAGE_SIZE = 100;

export const bookmarkedPlaceQueryKeys = {
  all: ['bookmarkedPlaces'] as const,
  list: () => [...bookmarkedPlaceQueryKeys.all, 'list'] as const,
};

export const useBookmarkedPlaces = (enabled = true) => {
  const placesQuery = useQuery({
    enabled,
    queryFn: () => placeApi.getBookmarkedPlaces({ limit: BOOKMARKED_PLACES_PAGE_SIZE }),
    queryKey: bookmarkedPlaceQueryKeys.list(),
  });
  const postsQuery = useBookmarkedPosts({ enabled });
  const imageUrlsByPlaceId = useMemo(() => (
    postsQuery.posts.reduce<Record<string, string[]>>((acc, post) => {
      const imageUrl = post.imageUrl?.trim();
      // Server-provided image values are treated as remote URLs only. This prevents
      // file/content URI schemes from being handed to the native image loader.
      if (!imageUrl || !/^https:\/\//i.test(imageUrl)) return acc;

      const key = String(post.placeId);
      const current = acc[key] ?? [];
      if (!current.includes(imageUrl)) current.push(imageUrl);
      acc[key] = current;
      return acc;
    }, {})
  ), [postsQuery.posts]);

  const refetch = async () => {
    await Promise.all([placesQuery.refetch(), postsQuery.refetch()]);
  };

  return {
    bookmarkedPlaceIds: postsQuery.bookmarkedPlaceIds,
    imageUrlsByPlaceId,
    isError: placesQuery.isError || postsQuery.isError,
    isLoading: placesQuery.isLoading || postsQuery.isLoading,
    places: placesQuery.data?.places ?? [],
    refetch,
  };
};

export default useBookmarkedPlaces;
