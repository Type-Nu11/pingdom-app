import { useQuery } from '@tanstack/react-query';
import { recordApi } from '../api/recordApi';

const LIKED_POSTS_PAGE_SIZE = 100;

export const likedPostQueryKeys = {
  all: ['likedPosts'] as const,
  list: () => [...likedPostQueryKeys.all, 'list'] as const,
};

export const useLikedPosts = (options?: { enabled?: boolean }) => {
  const likedPostsQuery = useQuery({
    queryKey: likedPostQueryKeys.list(),
    queryFn: () => recordApi.getLikedPosts({ limit: LIKED_POSTS_PAGE_SIZE }),
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
