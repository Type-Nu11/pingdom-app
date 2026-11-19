import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, type CommunityComment, type CommunityCommentLikeStatus, type CommunityLikeStatus, type CommunityApi } from '../api/communityApi';
import { applyOptimisticCommentLike } from '../model/commentThread';
import { mapCachedComments, patchCachedFeedPost, type CachedComments } from '../model/communityCache';
import { communityQueryKeys } from '../model/communityQueryKeys';

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
