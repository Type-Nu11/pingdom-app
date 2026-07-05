import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordApi, type GetPostsRequest } from '../api/recordApi';
import { postQueryKeys } from './usePlacePosts';

const MY_POSTS_PAGE_SIZE = 100;

export const useMyPosts = (
  userId: number | null,
  options?: {
    enabled?: boolean;
  },
) => {
  const params: GetPostsRequest = {
    limit: MY_POSTS_PAGE_SIZE,
    page: 1,
  };

  const myPostsQuery = useQuery({
    enabled: Boolean(options?.enabled && userId),
    queryKey: [...postQueryKeys.all, 'mine', userId, params] as const,
    queryFn: () => recordApi.getPosts(params),
  });

  const posts = useMemo(() => {
    if (!userId) {
      return [];
    }

    return (myPostsQuery.data?.posts ?? []).filter((post) => post.userId === userId);
  }, [myPostsQuery.data?.posts, userId]);

  return {
    error: myPostsQuery.error,
    isError: myPostsQuery.isError,
    isLoading: myPostsQuery.isLoading,
    posts,
    refetch: myPostsQuery.refetch,
  };
};

export default useMyPosts;
