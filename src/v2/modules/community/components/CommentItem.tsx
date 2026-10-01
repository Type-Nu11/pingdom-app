import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityComment } from '../api/communityApi';

export type CommentItemProps = {
  comment: CommunityComment;
  /** The comment was written by the post's author (Figma 작성자 badge). */
  isPostAuthor?: boolean;
  now: Date;
};

// The contract's `CommunityCommentSummary` has no `parentId` (no replies) and
// no like count, so this row is intentionally flat: the Figma reply/like
// Actions row and indented replies don't exist on the server yet.
export default function CommentItem({ comment, isPostAuthor = false, now }: CommentItemProps) {
  const { i18n, t } = useTranslation();
  const authorName = comment.authorName ?? '';
  const content = comment.content ?? '';
  const minutesAgo = comment.createdAt
    ? Math.floor((now.getTime() - new Date(comment.createdAt).getTime()) / 60_000)
    : 0;
  const relativeTime = comment.createdAt ? formatRelativeMinutes(minutesAgo, i18n.language) : '';

  return (
    <Row
      accessibilityLabel={t('community.detail.comments.a11yLabel', {
        author: isPostAuthor ? `${authorName}, ${t('community.detail.comments.authorBadge')}` : authorName,
        content,
        time: relativeTime,
      })}
      testID={`v2-community-comment-${comment.commentId}`}
    >
      <AvatarPlaceholder height={32} width={32} />
      <Content>
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
      </Content>
    </Row>
  );
}

// Figma `Comment`: 32px `User_Circle` avatar, 10px gap, name row → 4px → body.
const Row = styled.View`flex-direction: row; align-items: flex-start; gap: 10px; width: 100%;`;
const Content = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
const Name = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.labelBold)}`;
// Figma `AuthorBadge`: 20px Primary/Tint pill, 6px sides, 4px corners.
const AuthorBadge = styled.View`height: 20px; justify-content: center; padding: 0 6px; border-radius: 4px; background-color: ${({ theme }) => theme.colors.primarySelected};`;
const AuthorBadgeLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; ${({ theme }) => textStyleCss(theme.typography.captionMedium)}`;
const Time = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
const Body = styled(AppText)`color: ${({ theme }) => theme.colors.labelNeutral}; ${({ theme }) => textStyleCss(theme.typography.labelRegular)}`;
