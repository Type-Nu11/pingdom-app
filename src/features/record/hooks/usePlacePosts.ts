import { useQuery } from '@tanstack/react-query';
import { recordApi, type GetPostsRequest } from '../api/recordApi';

export const postQueryKeys = {
  all: ['posts'] as const,
  list: (params: GetPostsRequest) => [...postQueryKeys.all, 'list', params] as const,
  place: (placeId: number | null, params: GetPostsRequest) => [
    ...postQueryKeys.list(params),
    'place',
    placeId,
  ] as const,
};

export const usePlacePosts = (placeId: number | null, params: GetPostsRequest = {}) => {
  const queryParams = {
    limit: params.limit ?? 100,
    page: params.page ?? 1,
    placeId: placeId ?? undefined,
  };
  const postsQuery = useQuery({
    enabled: placeId !== null,
    queryKey: postQueryKeys.place(placeId, queryParams),
    queryFn: () => recordApi.getPosts(queryParams),
  });

  return {
    error: postsQuery.error,
    isError: postsQuery.isError,
    isLoading: postsQuery.isLoading,
    posts: postsQuery.data?.posts ?? [],
    refetch: postsQuery.refetch,
  };
};

export default usePlacePosts;
