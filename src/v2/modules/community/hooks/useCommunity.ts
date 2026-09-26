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

/**
 * Post creation is non-idempotent: no AbortSignal is attached (a torn-down
 * screen must not leave the server unaware a create actually went through)
 * and retry is explicitly disabled so a transient failure never becomes a
 * silent duplicate post.
 */
export function useCreatePost(api: Pick<CommunityApi, 'createPost'> = communityApi) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostBody) => api.createPost(body),
    retry: false,
    // Only the category the post was created in is invalidated — other
    // categories' cached pages, and the category list itself, are untouched.
    onSuccess: async (_data, variables) => queryClient.invalidateQueries({
      queryKey: communityQueryKeys.postsRoot(variables.categoryId),
    }),
  });
}

/**
 * Comment creation is non-idempotent: no AbortSignal is attached (a torn-down
 * screen must not leave the server unaware a create actually went through)
 * and retry is explicitly disabled so a transient failure never becomes a
 * silent duplicate comment. Only this post's comment caches are invalidated;
 * other posts' cached comment pages are untouched.
 */
export function useCreateComment(
  postId: number,
  api: Pick<CommunityApi, 'createComment'> = communityApi,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCommentBody) => api.createComment(postId, body),
    retry: false,
    onSuccess: async () => queryClient.invalidateQueries({
      queryKey: communityQueryKeys.commentsRoot(postId),
    }),
  });
}

/**
 * Applies an optimistic `{ liked, likeCount }` patch ahead of the server
 * response. `likeCount` never drops below 0, and toggling to the state the
 * cache already reflects (e.g. a stale snapshot) leaves the count untouched
 * instead of double-counting.
 */
export function applyOptimisticLike(
  current: CommunityLikeStatus | undefined,
  postId: number,
  nextLiked: boolean,
): CommunityLikeStatus {
  const base = current ?? { likeCount: 0, liked: !nextLiked, postId };
  const likeCount = base.liked === nextLiked
    ? (base.likeCount ?? 0)
    : Math.max(0, (base.likeCount ?? 0) + (nextLiked ? 1 : -1));
  return { ...base, likeCount, liked: nextLiked };
}

/**
 * Toggles the current user's like on one post with an optimistic update:
 * `onMutate` flips this post's cached like status immediately, `onError`
 * rolls back to the pre-mutation snapshot, and a successful response
 * overwrites the optimistic value with the server's `{ likeCount, liked }`
 * (the source of truth) instead of refetching. Only this post's like cache
 * is touched — no other postId and no list query is invalidated.
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
    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CommunityLikeStatus>(queryKey);
      queryClient.setQueryData<CommunityLikeStatus>(
        queryKey,
        (data) => applyOptimisticLike(data, postId, nextLiked),
      );
      return { previous };
    },
    onError: (_error, _nextLiked, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
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
