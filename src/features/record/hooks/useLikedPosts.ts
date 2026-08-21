import { useQuery } from '@tanstack/react-query';
import { recordApi, type GetLikedPostsRequest } from '../api/recordApi';

const LIKED_POSTS_PAGE_SIZE = 100;
const DEFAULT_LIKED_POSTS_PARAMS = { limit: LIKED_POSTS_PAGE_SIZE } as const;

export const likedPostQueryKeys = {
  all: ['posts', 'liked'] as const,
  list: (params: GetLikedPostsRequest = {}) => [
    ...likedPostQueryKeys.all,
    'list',
    params,
  ] as const,
};

export const createLikedPostsQueryOptions = (
  params: GetLikedPostsRequest = DEFAULT_LIKED_POSTS_PARAMS,
) => ({
  queryFn: () => recordApi.getLikedPosts(params),
  queryKey: likedPostQueryKeys.list(params),
});

export const useLikedPosts = (options?: { enabled?: boolean }) => {
  const likedPostsQuery = useQuery({
    ...createLikedPostsQueryOptions(),
    enabled: options?.enabled,
  });

  return {
    error: likedPostsQuery.error,
    isError: likedPostsQuery.isError,
    isLoading: likedPostsQuery.isLoading,
    posts: likedPostsQuery.data?.posts ?? [],
    refetch: likedPostsQuery.refetch,
  };
};

export default useLikedPosts;
