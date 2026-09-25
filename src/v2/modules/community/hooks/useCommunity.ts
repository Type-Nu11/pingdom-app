import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  communityApi,
  type CommunityCommentPage,
  type CommunityLikeStatus,
  type CommunityPostDetail,
  type CommunityPostPage,
  type CommunityPostSummary,
  type CreateCommentBody,
  type CreatePostBody,
  type ListCommentsParams,
  type ListPostsByCategoryParams,
  type ReportBody,
} from '../api/communityApi';

export type { CommunityPostDetail, CommunityPostSummary };

type CommunityApi = typeof communityApi;

export const communityQueryKeys = {
  categories: ['v2', 'community', 'categories'] as const,
  comments: (postId: number, params: ListCommentsParams) => ['v2', 'community', 'posts', postId, 'comments', params] as const,
  commentsInfinite: (postId: number, params: ListCommentsParams) => ['v2', 'community', 'posts', postId, 'comments', 'infinite', params] as const,
  commentsRoot: (postId: number) => ['v2', 'community', 'posts', postId, 'comments'] as const,
  likeStatus: (postId: number) => ['v2', 'community', 'posts', postId, 'likes'] as const,
  post: (postId: number) => ['v2', 'community', 'posts', 'detail', postId] as const,
  posts: (categoryId: string, params: ListPostsByCategoryParams) => ['v2', 'community', 'categories', categoryId, 'posts', params] as const,
  postsInfinite: (categoryId: string, params: ListPostsByCategoryParams) => ['v2', 'community', 'categories', categoryId, 'posts', 'infinite', params] as const,
  postsRoot: (categoryId: string) => ['v2', 'community', 'categories', categoryId, 'posts'] as const,
};

export function createCategoriesQueryOptions(
  api: Pick<CommunityApi, 'listCategories'> = communityApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listCategories(signal),
    queryKey: communityQueryKeys.categories,
  };
}

export function useCategories() {
  return useQuery(createCategoriesQueryOptions());
}

export function createPostQueryOptions(
  postId: number,
  api: Pick<CommunityApi, 'getPost'> = communityApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPost(postId, signal),
    queryKey: communityQueryKeys.post(postId),
  };
}

export function usePost(postId: number, options: { enabled?: boolean } = {}) {
  return useQuery({ ...createPostQueryOptions(postId), ...options });
}

/**
 * Server-backed pagination for a category feed. `page` is owned by the query,
 * so it is stripped from `params` and only `limit` takes part in the cache key.
 */
export function createInfinitePostsByCategoryQueryOptions(
  categoryId: string,
  params: ListPostsByCategoryParams = {},
  api: Pick<CommunityApi, 'listPostsByCategory'> = communityApi,
) {
  const { page: _page, ...filters } = params;

  return {
    getNextPageParam: (lastPage: CommunityPostPage) => (
      lastPage.hasNext && (lastPage.page ?? 0) < (lastPage.totalPages ?? 0)
        ? (lastPage.page ?? 0) + 1
        : undefined
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }: { pageParam: number; signal?: AbortSignal }) =>
      api.listPostsByCategory(categoryId, { ...filters, page: pageParam }, signal),
    queryKey: communityQueryKeys.postsInfinite(categoryId, filters),
  };
}

export function useInfinitePostsByCategory(
  categoryId: string,
  params: ListPostsByCategoryParams = {},
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    ...createInfinitePostsByCategoryQueryOptions(categoryId, params),
    enabled: options.enabled ?? Boolean(categoryId),
  });
}

export function createInfiniteCommentsQueryOptions(
  postId: number,
  params: ListCommentsParams = {},
  api: Pick<CommunityApi, 'listComments'> = communityApi,
) {
  const { page: _page, ...filters } = params;

  return {
    getNextPageParam: (lastPage: CommunityCommentPage) => (
      lastPage.hasNext && (lastPage.page ?? 0) < (lastPage.totalPages ?? 0)
        ? (lastPage.page ?? 0) + 1
        : undefined
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }: { pageParam: number; signal?: AbortSignal }) =>
      api.listComments(postId, { ...filters, page: pageParam }, signal),
    queryKey: communityQueryKeys.commentsInfinite(postId, filters),
  };
}

export function useInfiniteComments(
  postId: number,
  params: ListCommentsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useInfiniteQuery({
    ...createInfiniteCommentsQueryOptions(postId, params),
    enabled: options.enabled ?? Number.isFinite(postId),
  });
}

export function useLikeStatus(postId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryFn: ({ signal }: { signal?: AbortSignal }) => communityApi.getLikeStatus(postId, signal),
    queryKey: communityQueryKeys.likeStatus(postId),
    ...options,
  });
}

export function useCreatePost(api: Pick<CommunityApi, 'createPost'> = communityApi) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostBody) => api.createPost(body),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['v2', 'community', 'categories'] }),
  });
}

export function useCreateComment(
  postId: number,
  api: Pick<CommunityApi, 'createComment'> = communityApi,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCommentBody) => api.createComment(postId, body),
    onSuccess: async () => queryClient.invalidateQueries({
      queryKey: communityQueryKeys.commentsRoot(postId),
    }),
  });
}

/**
 * Toggles the current user's like on one post. The like/unlike endpoints both
 * return the resulting `CommunityLikeStatus`, so a successful mutation writes
 * that response straight into the query cache instead of refetching.
 */
export function useToggleLike(
  postId: number,
  api: Pick<CommunityApi, 'likePost' | 'unlikePost'> = communityApi,
) {
  const queryClient = useQueryClient();
  const queryKey = communityQueryKeys.likeStatus(postId);

  return useMutation({
    mutationFn: (nextLiked: boolean): Promise<CommunityLikeStatus> => (
      nextLiked ? api.likePost(postId) : api.unlikePost(postId)
    ),
    // Non-idempotent toggle: retrying a timed-out request against a state the
    // client already flipped would undo the user's action.
    retry: false,
    onSuccess: (status) => {
      queryClient.setQueryData(queryKey, status);
    },
  });
}

export function useRecordPlaceView(api: Pick<CommunityApi, 'recordPlaceView'> = communityApi) {
  return useMutation({
    mutationFn: ({ placeId, postId }: { placeId: number; postId: number }) =>
      api.recordPlaceView(postId, placeId),
  });
}

export function useReportPost(
  postId: number,
  api: Pick<CommunityApi, 'reportPost'> = communityApi,
) {
  return useMutation({
    mutationFn: (body: ReportBody) => api.reportPost(postId, body),
  });
}

export function useReportComment(
  postId: number,
  commentId: number,
  api: Pick<CommunityApi, 'reportComment'> = communityApi,
) {
  return useMutation({
    mutationFn: (body: ReportBody) => api.reportComment(postId, commentId, body),
  });
}
