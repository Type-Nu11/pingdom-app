import type { CommunityComment } from '../api/communityApi';

export type CommentThread = {
  comment: CommunityComment;
  /** One level of replies, oldest first. */
  replies: CommunityComment[];
};

const isReply = (comment: CommunityComment): comment is CommunityComment & { parentCommentId: number } => (
  typeof comment.parentCommentId === 'number'
);

/**
 * Groups the flat, newest-first comment list into top-level comments with
 * their replies indented underneath.
 *
 * A reply is always newer than its parent, so in a newest-first list it is
 * loaded on the same page as the parent or an earlier one. A reply whose
 * parent hasn't been paged in yet is therefore held back until it is — unless
 * `complete` says there is nothing left to load, in which case it is shown as
 * its own entry rather than silently dropped.
 */
export function buildCommentThreads(
  comments: readonly CommunityComment[],
  { complete }: { complete: boolean },
): CommentThread[] {
  const threads: CommentThread[] = [];
  const byParentId = new Map<number, CommentThread>();

  for (const comment of comments) {
    if (isReply(comment)) continue;
    const thread: CommentThread = { comment, replies: [] };
    threads.push(thread);
    if (typeof comment.commentId === 'number') byParentId.set(comment.commentId, thread);
  }

  const orphans: CommunityComment[] = [];
  for (const comment of comments) {
    if (!isReply(comment)) continue;
    const thread = byParentId.get(comment.parentCommentId);
    // The list is newest-first; unshift keeps each thread oldest-first.
    if (thread) thread.replies.unshift(comment);
    else orphans.push(comment);
  }

  if (complete) {
    for (const orphan of orphans) threads.push({ comment: orphan, replies: [] });
  }
  return threads;
}

/** Top-level id a new reply must target: replies are one level deep. */
export function replyParentId(comment: CommunityComment): number | undefined {
  return isReply(comment) ? comment.parentCommentId : comment.commentId;
}

/**
 * Optimistic `{ liked, likeCount }` for one comment. The count never drops
 * below 0 and re-applying the state the comment already has leaves it alone.
 */
export function applyOptimisticCommentLike(comment: CommunityComment, nextLiked: boolean): CommunityComment {
  const liked = comment.liked ?? false;
  const likeCount = comment.likeCount ?? 0;
  if (liked === nextLiked) return comment;
  return { ...comment, likeCount: Math.max(0, likeCount + (nextLiked ? 1 : -1)), liked: nextLiked };
}
