import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, type CreateCommentBody, type ReportBody, type CommunityApi } from '../api/communityApi';
import { patchCachedFeedPost } from '../model/communityCache';
import { communityQueryKeys } from '../model/communityQueryKeys';

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

export function useReportComment(
  postId: number,
  commentId: number,
  api: Pick<CommunityApi, 'reportComment'> = communityApi,
) {
  return useMutation({
    mutationFn: (body: ReportBody) => api.reportComment(postId, commentId, body),
  });
}
