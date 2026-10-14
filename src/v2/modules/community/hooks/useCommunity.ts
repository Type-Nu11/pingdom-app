import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  communityApi,
  type CommunityComment,
  type CommunityCommentLikeStatus,
  type CommunityCommentPage,
  type CommunityLikeStatus,
  type CommunityPostDetail,
  type CommunityPostPage,
  type CommunityPostSummary,
  type CreateCommentBody,
  type CreatePostBody,
  type ListCommentsParams,
  type ListPostsByCategoryParams,
  type ListPostsParams,
  type ReportBody,
} from '../api/communityApi';

import { applyOptimisticCommentLike } from '../model/commentThread';

export type { CommunityPostDetail, CommunityPostSummary };

type CommunityApi = typeof communityApi;

export const communityQueryKeys = {
  allPostsInfinite: (params: ListPostsParams) => ['v2', 'community', 'posts', 'all', 'infinite', params] as const,
  allPostsRoot: ['v2', 'community', 'posts', 'all'] as const,
  categories: ['v2', 'community', 'categories'] as const,
  countries: ['v2', 'community', 'countries'] as const,
  comments: (postId: number, params: ListCommentsParams) => ['v2', 'community', 'posts', postId, 'comments', params] as const,
  commentsInfinite: (postId: number, params: ListCommentsParams) => ['v2', 'community', 'posts', postId, 'comments', 'infinite', params] as const,
  commentsRoot: (postId: number) => ['v2', 'community', 'posts', postId, 'comments'] as const,
  likeStatus: (postId: number) => ['v2', 'community', 'posts', postId, 'likes'] as const,
  post: (postId: number) => ['v2', 'community', 'posts', 'detail', postId] as const,
  posts: (categoryId: string, params: ListPostsByCategoryParams) => ['v2', 'community', 'categories', categoryId, 'posts', params] as const,
  postsInfinite: (categoryId: string, params: ListPostsByCategoryParams) => ['v2', 'community', 'categories', categoryId, 'posts', 'infinite', params] as const,
  postsRoot: (categoryId: string) => ['v2', 'community', 'categories', categoryId, 'posts'] as const,
};

/**
 * Patches one post's summary in every cached feed page (the "All" tab and the
 * category tabs). The feed cards show like and comment counts, and the sheet
 * stays mounted under the detail screen, so a change made there would
 * otherwise keep showing the old number until the feed is refetched.
 */
function patchCachedFeedPost(
  queryClient: QueryClient,
  postId: number,
  update: (post: CommunityPostSummary) => CommunityPostSummary,
) {
  const patch = (data: InfiniteData<CommunityPostPage> | undefined) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((page) => (
        page.posts ? { ...page, posts: page.posts.map((post) => (post.postId === postId ? update(post) : post)) } : page
      )),
    };
  };
  queryClient.setQueriesData<InfiniteData<CommunityPostPage>>({ queryKey: communityQueryKeys.allPostsRoot }, patch);
  queryClient.setQueriesData<InfiniteData<CommunityPostPage>>({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === 'v2' && key[1] === 'community' && key[2] === 'categories' && key[4] === 'posts' && key[5] === 'infinite';
    },
  }, patch);
}

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

export function createCountriesQueryOptions(
  api: Pick<CommunityApi, 'listCountries'> = communityApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listCountries(signal),
    queryKey: communityQueryKeys.countries,
  };
}

/** Country codes the feed's `countryCode` filter accepts. */
export function useCountries(options: { enabled?: boolean } = {}) {
  return useQuery({ ...createCountriesQueryOptions(), ...options });
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

/** A single fresh feed page for app-owned selection; reuses the existing list API. */
export function createPostsQueryOptions(
  params: ListPostsParams,
  api: Pick<CommunityApi, 'listPosts'> = communityApi,
) {
  return {
    queryKey: ['v2', 'community', 'posts', 'all', 'page', params] as const,
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listPosts(params, signal),
  };
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

/** Same paging rules as the category feed, over every category. */
export function createInfiniteAllPostsQueryOptions(
  params: ListPostsParams = {},
  api: Pick<CommunityApi, 'listPosts'> = communityApi,
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
      api.listPosts({ ...filters, page: pageParam }, signal),
    queryKey: communityQueryKeys.allPostsInfinite(filters),
  };
}

export type CommunityFeedFilters = {
  /** `null` is the "All" tab: every category. */
  categoryId: string | null;
  /** ISO alpha-2 code from `useCountries`; omitted when no country is picked. */
  countryCode?: string;
  limit?: number;
};

/**
 * The feed behind the sheet's category tabs and country filter. The filters
 * are part of the query key, so changing either one starts a fresh query at
 * page 1 instead of appending to the previous filter's pages.
 */
export function createCommunityFeedQueryOptions(
  { categoryId, countryCode, limit }: CommunityFeedFilters,
  api: Pick<CommunityApi, 'listPosts' | 'listPostsByCategory'> = communityApi,
) {
  const params = { ...(countryCode ? { countryCode } : {}), ...(limit ? { limit } : {}) };
  const options = categoryId === null
    ? createInfiniteAllPostsQueryOptions(params, api)
    : createInfinitePostsByCategoryQueryOptions(categoryId, params, api);
  // The two feeds differ only in key shape; widening it lets one
  // `useInfiniteQuery` call serve both.
  return { ...options, queryKey: options.queryKey as readonly unknown[] };
}

export function useCommunityFeed(filters: CommunityFeedFilters, options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({ ...createCommunityFeedQueryOptions(filters), ...options });
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
    // Only the feeds the new post appears in are invalidated — its category
    // and the "All" tab. Other categories' cached pages, and the category
    // list itself, are untouched.
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.postsRoot(variables.categoryId) }),
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.allPostsRoot }),
      ]);
    },
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
    onSuccess: async () => {
      // A count the list response never carried stays absent rather than
      // becoming a made-up 1.
      patchCachedFeedPost(queryClient, postId, (post) => (
        typeof post.commentCount === 'number' ? { ...post, commentCount: post.commentCount + 1 } : post
      ));
      await queryClient.invalidateQueries({ queryKey: communityQueryKeys.commentsRoot(postId) });
    },
  });
}

type CachedComments = CommunityCommentPage | InfiniteData<CommunityCommentPage> | undefined;

function mapCachedComments(
  data: CachedComments,
  update: (comment: CommunityComment) => CommunityComment,
): CachedComments {
  if (!data) return data;
  const mapPage = (page: CommunityCommentPage): CommunityCommentPage => (
    page.comments ? { ...page, comments: page.comments.map(update) } : page
  );
  return 'pages' in data ? { ...data, pages: data.pages.map(mapPage) } : mapPage(data);
}

/**
 * Toggles the current user's like on one comment with an optimistic update.
 * `onMutate` flips that comment in every cached comment page of this post,
 * `onError` puts back only that comment's previous `{ liked, likeCount }`
 * (other comments liked in the meantime are left alone), and a successful
 * response overwrites the optimistic value with the server's numbers. The
 * list is never refetched, so pagination and scroll position are untouched.
 */
export function useToggleCommentLike(
  postId: number,
  api: Pick<CommunityApi, 'likeComment' | 'unlikeComment'> = communityApi,
) {
  const queryClient = useQueryClient();
  const queryKey = communityQueryKeys.commentsRoot(postId);
  const patch = (commentId: number, update: (comment: CommunityComment) => CommunityComment) => {
    queryClient.setQueriesData<CachedComments>({ queryKey }, (data) => mapCachedComments(
      data,
      (comment) => (comment.commentId === commentId ? update(comment) : comment),
    ));
  };

  return useMutation({
    mutationFn: ({ commentId, nextLiked }: { commentId: number; nextLiked: boolean }): Promise<CommunityCommentLikeStatus> => (
      nextLiked ? api.likeComment(commentId) : api.unlikeComment(commentId)
    ),
    // Non-idempotent toggle: see useToggleLike.
    retry: false,
    onMutate: ({ commentId, nextLiked }) => {
      let previous: Pick<CommunityComment, 'likeCount' | 'liked'> | undefined;
      patch(commentId, (comment) => {
        previous ??= { likeCount: comment.likeCount, liked: comment.liked };
        return applyOptimisticCommentLike(comment, nextLiked);
      });
      return { previous };
    },
    onError: (_error, { commentId }, context) => {
      const previous = context?.previous;
      if (previous) patch(commentId, (comment) => ({ ...comment, ...previous }));
    },
    onSuccess: (status, { commentId }) => {
      patch(commentId, (comment) => ({
        ...comment,
        likeCount: status.likeCount ?? comment.likeCount,
        liked: status.liked ?? comment.liked,
      }));
    },
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
 * is touched — no other postId and no list query is invalidated. The settled
 * count is also written into the cached feed cards for this post.
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
      const likeCount = status.likeCount;
      if (typeof likeCount === 'number') {
        patchCachedFeedPost(queryClient, postId, (post) => ({ ...post, likeCount }));
      }
    },
  });
}

/**
 * Non-idempotent: no AbortSignal (leaving the screen mid-request must not
 * cancel a view the server may already be counting) and retry disabled
 * (retrying a timed-out request would risk a second view for the same tap).
 */
export function useRecordPlaceView(api: Pick<CommunityApi, 'recordPlaceView'> = communityApi) {
  return useMutation({
    mutationFn: ({ placeId, postId }: { placeId: number; postId: number }) =>
      api.recordPlaceView(postId, placeId),
    retry: false,
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
