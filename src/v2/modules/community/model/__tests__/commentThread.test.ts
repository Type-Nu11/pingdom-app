import type { CommunityComment } from '../../api/communityApi';
import { applyOptimisticCommentLike, buildCommentThreads, replyParentId } from '../commentThread';

const comment = (commentId: number, parentCommentId?: number): CommunityComment => ({
  authorId: commentId,
  authorName: `user-${commentId}`,
  commentId,
  content: `content-${commentId}`,
  parentCommentId,
});

const shape = (threads: ReturnType<typeof buildCommentThreads>) => threads.map((thread) => [
  thread.comment.commentId,
  thread.replies.map((reply) => reply.commentId),
]);

describe('buildCommentThreads', () => {
  test('keeps top-level comments newest-first and nests replies oldest-first', () => {
    // Flat newest-first list: 6 and 5 reply to 2, 4 replies to 1.
    const flat = [comment(6, 2), comment(5, 2), comment(4, 1), comment(3), comment(2), comment(1)];

    expect(shape(buildCommentThreads(flat, { complete: true }))).toEqual([
      [3, []],
      [2, [5, 6]],
      [1, [4]],
    ]);
  });

  test('holds back a reply whose parent is on a page that has not loaded yet', () => {
    const firstPage = [comment(6, 2), comment(5, 1), comment(4), comment(3)];

    expect(shape(buildCommentThreads(firstPage, { complete: false }))).toEqual([[4, []], [3, []]]);

    const withNextPage = [...firstPage, comment(2), comment(1)];
    expect(shape(buildCommentThreads(withNextPage, { complete: true }))).toEqual([
      [4, []],
      [3, []],
      [2, [6]],
      [1, [5]],
    ]);
  });

  test('shows a reply on its own once everything is loaded and its parent never arrived', () => {
    expect(shape(buildCommentThreads([comment(5, 99), comment(4)], { complete: true }))).toEqual([
      [4, []],
      [5, []],
    ]);
  });

  test('handles an empty list', () => {
    expect(buildCommentThreads([], { complete: true })).toEqual([]);
  });
});

describe('replyParentId', () => {
  test('a reply to a top-level comment targets that comment', () => {
    expect(replyParentId(comment(7))).toBe(7);
  });

  test('a reply to a reply targets the same top-level parent (one level only)', () => {
    expect(replyParentId(comment(9, 7))).toBe(7);
  });
});

describe('applyOptimisticCommentLike', () => {
  test('liking adds one and unliking removes one', () => {
    expect(applyOptimisticCommentLike({ ...comment(1), likeCount: 2, liked: false }, true)).toMatchObject({ likeCount: 3, liked: true });
    expect(applyOptimisticCommentLike({ ...comment(1), likeCount: 3, liked: true }, false)).toMatchObject({ likeCount: 2, liked: false });
  });

  test('never drops below zero and treats missing fields as not liked / zero', () => {
    expect(applyOptimisticCommentLike({ ...comment(1), likeCount: 0, liked: true }, false)).toMatchObject({ likeCount: 0, liked: false });
    expect(applyOptimisticCommentLike(comment(1), true)).toMatchObject({ likeCount: 1, liked: true });
  });

  test('re-applying the current state returns the same comment', () => {
    const liked = { ...comment(1), likeCount: 3, liked: true };

    expect(applyOptimisticCommentLike(liked, true)).toBe(liked);
  });
});
