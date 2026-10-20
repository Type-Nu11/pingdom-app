import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import StarFilledIcon from '../../../../assets/v2/icons/community/star-filled.svg';
import StarOutlineIcon from '../../../../assets/v2/icons/community/star-outline-16.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import { formatCommunityTime } from '../model/communityTime';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityComment } from '../api/communityApi';

export type CommentItemProps = {
  comment: CommunityComment;
  /** The comment was written by the post's author (Figma 작성자 badge). */
  isPostAuthor?: boolean;
  /** A like/unlike for this comment is in flight; further taps are ignored. */
  likeBusy?: boolean;
  now: Date;
  onReply?: (comment: CommunityComment) => void;
  onToggleLike?: (comment: CommunityComment) => void;
  /** `reply` is the Figma `Comment/Reply`: indented 42px with a 28px avatar. */
  variant?: 'comment' | 'reply';
};

const REPLY_INDENT = 42;

// Figma `Comment` / `Comment/Reply` (8241:47092, 8241:47105): avatar, 10px gap,
// name row → 4px → body → 4px → the 16px Actions row (답글 달기, star + count).
// The comment like uses the same star as the post like (Figma 8167:28636).
export default function CommentItem({
  comment,
  isPostAuthor = false,
  likeBusy = false,
  now,
  onReply,
  onToggleLike,
  variant = 'comment',
}: CommentItemProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const authorName = comment.authorName ?? '';
  const content = comment.content ?? '';
  const relativeTime = formatCommunityTime(comment.createdAt, now, i18n.language);
  const isReply = variant === 'reply';
  const avatarSize = isReply ? 28 : 32;
  const liked = comment.liked ?? false;
  const hasLikeCount = typeof comment.likeCount === 'number' && Number.isFinite(comment.likeCount);
  const canLike = Boolean(onToggleLike) && comment.commentId !== undefined;
  const showLike = canLike || hasLikeCount;

  return (
    <Row $indent={isReply ? REPLY_INDENT : 0} testID={`v2-community-comment-${comment.commentId}`}>
      <AvatarPlaceholder height={avatarSize} width={avatarSize} />
      <Content>
        <Texts
          accessibilityLabel={t('community.detail.comments.a11yLabel', {
            author: isPostAuthor ? `${authorName}, ${t('community.detail.comments.authorBadge')}` : authorName,
            content,
            time: relativeTime,
          })}
          accessible
        >
          <NameRow>
            <Name>{authorName}</Name>
            {isPostAuthor ? (
              <AuthorBadge testID={`v2-community-comment-${comment.commentId}-author-badge`}>
                <AuthorBadgeLabel>{t('community.detail.comments.authorBadge')}</AuthorBadgeLabel>
              </AuthorBadge>
            ) : null}
            {relativeTime ? <Time>{relativeTime}</Time> : null}
          </NameRow>
          <Body>{content}</Body>
        </Texts>
        {onReply || showLike ? (
          <Actions>
            {onReply ? (
              <ActionButton
                accessibilityLabel={t('community.detail.comments.replyA11y', { author: authorName })}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => onReply(comment)}
                testID={`v2-community-comment-${comment.commentId}-reply`}
              >
                <ActionLabel>{t('community.detail.comments.reply')}</ActionLabel>
              </ActionButton>
            ) : null}
            {showLike ? (
              <LikeButton
                accessibilityHint={canLike ? t(liked ? 'community.detail.comments.likeHintUnlike' : 'community.detail.comments.likeHintLike') : undefined}
                accessibilityLabel={t('community.detail.comments.likeA11y', { count: comment.likeCount ?? 0 })}
                accessibilityRole="button"
                accessibilityState={{ busy: likeBusy, disabled: !canLike || likeBusy, selected: liked }}
                disabled={!canLike || likeBusy}
                hitSlop={8}
                onPress={() => onToggleLike?.(comment)}
                testID={`v2-community-comment-${comment.commentId}-like`}
              >
                {liked
                  ? <StarFilledIcon height={14} width={14} />
                  : <StarOutlineIcon color={theme.colors.labelAssistive} height={14} width={14} />}
                {hasLikeCount ? <LikeCount $active={liked}>{comment.likeCount}</LikeCount> : null}
              </LikeButton>
            ) : null}
          </Actions>
        ) : null}
      </Content>
    </Row>
  );
}

const Row = styled.View<{ $indent: number }>`
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding-left: ${({ $indent }) => $indent}px;
`;
const Content = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const Texts = styled.View`gap: 4px;`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
const Name = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.labelBold)}`;
// Figma `AuthorBadge`: 20px Primary/Tint pill, 6px sides, 6px corners.
const AuthorBadge = styled.View`height: 20px; justify-content: center; padding: 0 6px; border-radius: 6px; background-color: ${({ theme }) => theme.colors.primarySelected};`;
const AuthorBadgeLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; ${({ theme }) => textStyleCss(theme.typography.captionMedium)}`;
const Time = styled(AppText)`color: ${({ theme }) => theme.colors.labelAssistive}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
const Body = styled(AppText)`color: ${({ theme }) => theme.colors.labelNeutral}; ${({ theme }) => textStyleCss(theme.typography.labelRegular)}`;
// Figma `Actions`: 16px row, Reply and Like 12px apart; star 2px before its count.
const Actions = styled.View`flex-direction: row; align-items: center; gap: 12px; height: 16px;`;
const ActionButton = styled.Pressable`height: 16px; justify-content: center;`;
const ActionLabel = styled(AppText)`color: ${({ theme }) => theme.colors.labelAssistive}; ${({ theme }) => textStyleCss(theme.typography.captionMedium)}`;
const LikeButton = styled.Pressable`flex-direction: row; align-items: center; gap: 2px; height: 16px;`;
const LikeCount = styled(AppText)<{ $active: boolean }>`
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.labelAssistive)};
  ${({ theme }) => textStyleCss(theme.typography.captionMedium)}
`;
