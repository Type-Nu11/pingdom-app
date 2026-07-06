import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import type { PostsPage } from '../../record/model/record.types';
import { HOT_PLACE_MIN_POST_LIKE_COUNT } from '../constants/hotPlace';

const HOT_PLACE_POST_PARAMS = {
  limit: 100,
  page: 1,
};

const HOT_PLACE_QUERY_KEY = [
  ...postQueryKeys.hotPlaces(),
  HOT_PLACE_POST_PARAMS,
] as const;

async function getPostsForHotPlaceDetection(): Promise<PostsPage> {
  const firstPage = await recordApi.getPosts(HOT_PLACE_POST_PARAMS);

  if (!firstPage.hasNext || firstPage.totalPages <= 1) {
    return firstPage;
  }

  // TODO: 서버에서 isHot 또는 hotPlaceIds 제공 시 해당 API로 교체
  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => (
      recordApi.getPosts({
        ...HOT_PLACE_POST_PARAMS,
        page: index + 2,
      })
    ))
  );

  return {
    ...firstPage,
    hasNext: false,
    posts: [
      ...firstPage.posts,
      ...remainingPages.flatMap((page) => page.posts),
    ],
  };
}

export const useHotPlaceIds = () => {
  const postsQuery = useQuery({
    queryKey: HOT_PLACE_QUERY_KEY,
    queryFn: getPostsForHotPlaceDetection,
  });

  const hotPlaceIds = useMemo(() => new Set(
    (postsQuery.data?.posts ?? [])
      .filter((post) => post.likeCount >= HOT_PLACE_MIN_POST_LIKE_COUNT)
      .map((post) => String(post.placeId))
  ), [postsQuery.data?.posts]);

  return {
    error: postsQuery.error,
    hotPlaceIds,
    isError: postsQuery.isError,
    isLoading: postsQuery.isLoading,
    refetch: postsQuery.refetch,
  };
};

export default useHotPlaceIds;
