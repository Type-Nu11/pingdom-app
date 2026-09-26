import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator, Animated, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { useSharedPulse } from '../../../shared/hooks/useSharedPulse';
import type { useInfiniteComments } from '../hooks/useCommunity';
import CommentItem from './CommentItem';

export type CommentsSectionProps = {
  commentsQuery: ReturnType<typeof useInfiniteComments>;
  now: Date;
  onLayout?: (event: LayoutChangeEvent) => void;
  onSignIn?: () => void;
};

const SKELETON_KEYS = ['skeleton-0', 'skeleton-1', 'skeleton-2'] as const;

function CommentsSkeleton() {
  const pulse = useSharedPulse();
  return (
    <SkeletonList testID="v2-community-comments-loading">
      {SKELETON_KEYS.map((key) => (
        <Animated.View key={key} style={{ flexDirection: 'row', gap: 10, opacity: pulse }}>
          <SkeletonAvatar />
          <SkeletonLines>
            <SkeletonLine $width={120} />
            <SkeletonLine $width={220} />
          </SkeletonLines>
        </Animated.View>
      ))}
    </SkeletonList>
  );
}

export default function CommentsSection({ commentsQuery, now, onLayout, onSignIn }: CommentsSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();

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
            {comments.map((comment, index) => (
              <CommentItem comment={comment} key={comment.commentId ?? `comment-${index}`} now={now} />
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
                <ChevronRightIcon height={16} width={16} />
              </ChevronDown>
            </LoadMoreButton>
          ) : null}
        </>
      )}
    </Section>
  );
}

const Section = styled.View`gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.xl}px; border-top-width: 8px; border-top-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const Head = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const HeadLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const HeadCount = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: 18px; font-weight: 700;`;

const List = styled.View`gap: ${({ theme }) => theme.spacing.md}px;`;
const EmptyText = styled(AppText)`padding: ${({ theme }) => theme.spacing.lg}px 0; text-align: center; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;

const LoadMoreButton = styled.Pressable`
  flex-direction: row; align-items: center; justify-content: center; gap: 6px;
  align-self: stretch; padding: 14px 0; border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.border};
`;
const LoadMoreLabel = styled(AppText)`color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const ChevronDown = styled.View`transform: rotate(90deg);`;

const FooterState = styled.View`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px 0;`;
const FooterErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const RetryButton = styled.Pressable`background-color: ${({ theme }) => theme.colors.primary}; border-radius: ${({ theme }) => theme.radius.full}px; padding: 9px 18px;`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const SkeletonList = styled.View`gap: ${({ theme }) => theme.spacing.md}px;`;
const SkeletonAvatar = styled.View`width: 32px; height: 32px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.border};`;
const SkeletonLines = styled.View`flex: 1; gap: 6px; padding-top: 2px;`;
const SkeletonLine = styled.View<{ $width: number }>`height: 12px; width: ${({ $width }) => $width}px; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;
