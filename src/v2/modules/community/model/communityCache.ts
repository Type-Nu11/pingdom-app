import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { CommunityComment, CommunityCommentPage, CommunityPostPage, CommunityPostSummary } from '../api/communityApi';
import { communityQueryKeys } from './communityQueryKeys';

/**
 * Patches one post's summary in every cached feed page (the "All" tab and the
 * category tabs). The feed cards show like and comment counts, and the sheet
 * stays mounted under the detail screen, so a change made there would
 * otherwise keep showing the old number until the feed is refetched.
 */
export function patchCachedFeedPost(
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

export type CachedComments = CommunityCommentPage | InfiniteData<CommunityCommentPage> | undefined;

export function mapCachedComments(
  data: CachedComments,
  update: (comment: CommunityComment) => CommunityComment,
): CachedComments {
  if (!data) return data;
  const mapPage = (page: CommunityCommentPage): CommunityCommentPage => (
    page.comments ? { ...page, comments: page.comments.map(update) } : page
  );
  return 'pages' in data ? { ...data, pages: data.pages.map(mapPage) } : mapPage(data);
}

export async function invalidatePostLists(client: QueryClient) {
  await client.invalidateQueries({ predicate: query => {
    const key = query.queryKey;
    return key[0] === 'v2' && key[1] === 'community'
      && (key[2] === 'mine' || (key[2] === 'categories' && key[4] === 'posts') || (key[2] === 'posts' && key[3] === 'all'));
  } });
}
