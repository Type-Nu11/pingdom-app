import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { communityApi, type CommunityCommentPage, type CommunityPostPage, type ListCommentsParams, type ListPostsByCategoryParams, type ListPostsParams, type CommunityApi } from '../api/communityApi';
import { communityQueryKeys } from '../model/communityQueryKeys';

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

export function useMyCommunityPosts(limit = 20) {
  return useInfiniteQuery({
    queryKey: [...communityQueryKeys.mineRoot, limit], initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => communityApi.listMyPosts({ page: pageParam, limit }, signal),
    getNextPageParam: (page, _pages, pageParam) => page.hasNext ? pageParam + 1 : undefined,
  });
}
