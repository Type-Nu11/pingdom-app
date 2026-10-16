import Skeleton from '../../../shared/components/Skeleton';
import { Text as AppText } from '../../../shared/components/Typography';
import React, { useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import { getApiErrorUx } from '../../../shared/api';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityComment } from '../api/communityApi';
import { useToggleCommentLike, type useInfiniteComments } from '../hooks/useCommunity';
import { buildCommentThreads } from '../model/commentThread';
import CommentItem from './CommentItem';

export type CommentsSectionProps = {
  commentsQuery: ReturnType<typeof useInfiniteComments>;
  now: Date;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Starts a reply to this comment in the input bar. */
  onReply?: (comment: CommunityComment) => void;
  onSignIn?: () => void;
  /** Author of the post; their comments get the Figma 작성자 badge. */
  postAuthorId?: number;
  postId: number;
};

function CommentsSkeleton() {
  return <Skeleton variant="comments" testID="v2-community-comments-loading" />;
}

export default function CommentsSection({
  commentsQuery,
  now,
  onLayout,
  onReply,
  onSignIn,
  postAuthorId,
  postId,
}: CommentsSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const toggleCommentLike = useToggleCommentLike(postId);
  // One in-flight toggle per comment: a second tap on the same comment is
  // ignored (not queued) until its request settles. The ref closes the gap
  // before React re-renders with the busy state.
  const pendingLikes = useRef(new Set<number>());
  const [busyLikeIds, setBusyLikeIds] = useState<number[]>([]);

  const toggleLike = (comment: CommunityComment) => {
    const commentId = comment.commentId;
    if (commentId === undefined || pendingLikes.current.has(commentId)) return;
    pendingLikes.current.add(commentId);
    setBusyLikeIds((current) => [...current, commentId]);
    toggleCommentLike.mutate({ commentId, nextLiked: !(comment.liked ?? false) }, {
      onError: (likeError) => {
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceLikeFailure'));
        if (getApiErrorUx(likeError).kind === 'authentication') onSignIn?.();
      },
      onSettled: () => {
        pendingLikes.current.delete(commentId);
        setBusyLikeIds((current) => current.filter((id) => id !== commentId));
      },
    });
  };

  // Read every derived field once up front via `let`: TanStack Query's
  // infinite-query result is a discriminated union, and TS correlates `const`
  // bindings destructured from the same object across sibling ternary
  // branches, which collapses unrelated fields (like `fetchNextPage`) to
  // `never`. `let` bindings aren't tracked for that correlation.
  let {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoading,
    refetch,
  } = commentsQuery;

  const comments = data?.pages.flatMap((page) => page.comments ?? []) ?? [];
  const threads = buildCommentThreads(comments, { complete: !hasNextPage });
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const remainingCount = Math.max(totalCount - comments.length, 0);

  const loadMore = () => {
    if (isFetchingNextPage || isFetchNextPageError) return;
    void fetchNextPage();
  };

  return (
    <Section onLayout={onLayout} testID="v2-community-comments-section">
      <Head accessibilityRole="header">
        <HeadLabel>{t('community.detail.comments.headerLabel')}</HeadLabel>
        <HeadCount>{totalCount}</HeadCount>
      </Head>

      {isLoading ? (
        <CommentsSkeleton />
      ) : isError && !data ? (
        // `isError` alone doesn't distinguish "nothing ever loaded" from "a
        // later fetchNextPage failed" — an infinite query shares one status
        // across both, keeping prior pages in `data` when only the next page
        // failed. Only the no-data case gets this full block; a next-page
        // failure with existing comments falls through to the inline footer
        // retry below instead.
        <ApiErrorState
          error={error}
          onRetry={() => void refetch()}
          onSignIn={onSignIn}
        />
      ) : comments.length === 0 ? (
        <EmptyText testID="v2-community-comments-empty">{t('community.detail.comments.empty')}</EmptyText>
      ) : (
        <>
          <List>
            {threads.map((thread, index) => (
              <React.Fragment key={thread.comment.commentId ?? `comment-${index}`}>
                {[thread.comment, ...thread.replies].map((comment, position) => (
                  <CommentItem
                    comment={comment}
                    isPostAuthor={postAuthorId !== undefined && comment.authorId === postAuthorId}
                    key={comment.commentId ?? `comment-${index}-${position}`}
                    likeBusy={comment.commentId !== undefined && busyLikeIds.includes(comment.commentId)}
                    now={now}
                    onReply={onReply}
                    onToggleLike={toggleLike}
                    variant={typeof comment.parentCommentId === 'number' ? 'reply' : 'comment'}
                  />
                ))}
              </React.Fragment>
            ))}
          </List>

          {isFetchingNextPage ? (
            <FooterState testID="v2-community-comments-next-loading">
              <ActivityIndicator color={theme.colors.primary} />
            </FooterState>
          ) : isFetchNextPageError ? (
            <FooterState testID="v2-community-comments-next-error">
              <FooterErrorText>{t('community.detail.comments.nextPageError')}</FooterErrorText>
              <RetryButton
                accessibilityLabel={t('community.detail.comments.nextPageRetry')}
                accessibilityRole="button"
                onPress={() => void fetchNextPage()}
                testID="v2-community-comments-next-retry"
              >
                <RetryLabel>{t('community.detail.comments.nextPageRetry')}</RetryLabel>
              </RetryButton>
            </FooterState>
          ) : hasNextPage ? (
            <LoadMoreButton
              accessibilityLabel={t('community.detail.comments.loadMore', { count: remainingCount })}
              accessibilityRole="button"
              onPress={loadMore}
              testID="v2-community-comments-load-more"
            >
              <LoadMoreLabel>{t('community.detail.comments.loadMore', { count: remainingCount })}</LoadMoreLabel>
              <ChevronDown>
                <ChevronRightIcon color={theme.colors.labelNeutral} height={24} width={24} />
              </ChevronDown>
            </LoadMoreButton>
          ) : null}
        </>
      )}
    </Section>
  );
}

// Figma `Comments`: 20px top / 24px bottom / 24px side padding and 20px
// between the head, each comment and the load-more pill. The 8px band above
// belongs to the detail ActionBar.
const Section = styled.View`gap: 20px; padding: 20px 24px 24px;`;
const Head = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const HeadLabel = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}`;
const HeadCount = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}`;

const List = styled.View`gap: 20px;`;
const EmptyText = styled(AppText)`padding: ${({ theme }) => theme.spacing.lg}px 0; text-align: center; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;

// Figma `Component 1`: 14×8 Label/Neutral chevron 9px after the label — the
// 24px chevron asset draws exactly that glyph, 5px inside its box.
const LoadMoreButton = styled.Pressable`
  flex-direction: row; align-items: center; justify-content: center; gap: 4px;
  align-self: stretch; padding: 14px 0; border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.fillAlternative};
`;
const LoadMoreLabel = styled(AppText)`color: ${({ theme }) => theme.colors.labelNeutral}; ${({ theme }) => textStyleCss(theme.typography.bodyRegular)}`;
const ChevronDown = styled.View`transform: rotate(90deg);`;

const FooterState = styled.View`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px 0;`;
const FooterErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const RetryButton = styled.Pressable`background-color: ${({ theme }) => theme.colors.primaryAction}; border-radius: ${({ theme }) => theme.radius.full}px; padding: 9px 18px;`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;
