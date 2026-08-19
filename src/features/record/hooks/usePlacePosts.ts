import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recordApi, type GetPostsRequest } from '../api/recordApi';

export type PostLikeState = Record<string, boolean>;

export const postQueryKeys = {
  all: ['posts'] as const,
  likes: () => ['postLikes'] as const,
  list: (params: GetPostsRequest) => [...postQueryKeys.all, 'list', params] as const,
  place: (placeId: number | null, params: GetPostsRequest) => [
    ...postQueryKeys.list(params),
    'place',
    placeId,
  ] as const,
};

export const usePlacePosts = (placeId: number | null, params: GetPostsRequest = {}) => {
  const queryClient = useQueryClient();
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
  const localLikedByPostId = queryClient.getQueryData<PostLikeState>(postQueryKeys.likes()) ?? {};
  const posts = useMemo(() => {
    const fetchedPosts = postsQuery.data?.posts ?? [];

    if (placeId === null) {
      return [];
    }

    return fetchedPosts
      .filter((post) => Number(post.placeId) === placeId)
      .map((post) => {
        const localLiked = localLikedByPostId[String(post.id)];

        if (localLiked === undefined) {
          return post;
        }

        return {
          ...post,
          isLiked: localLiked,
          liked: localLiked,
          likedByMe: localLiked,
        };
      });
  }, [localLikedByPostId, placeId, postsQuery.data?.posts]);

  return {
    error: postsQuery.error,
    isError: postsQuery.isError,
    isLoading: postsQuery.isLoading,
    posts,
    refetch: postsQuery.refetch,
  };
};

export default usePlacePosts;
