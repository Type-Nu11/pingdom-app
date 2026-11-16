import type { ListCommentsParams, ListPostsByCategoryParams, ListPostsParams } from '../api/communityApi';

export const communityQueryKeys = {
  allPostsInfinite: (params: ListPostsParams) => ['v2', 'community', 'posts', 'all', 'infinite', params] as const,
  allPostsRoot: ['v2', 'community', 'posts', 'all'] as const,
  mineRoot: ['v2', 'community', 'mine'] as const,
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
