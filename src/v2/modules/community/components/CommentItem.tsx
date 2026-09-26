import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import CommentAvatarIcon from '../../../../assets/v2/icons/community/comment-avatar.svg';
import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import type { CommunityComment } from '../api/communityApi';

export type CommentItemProps = {
  comment: CommunityComment;
  now: Date;
};

// The contract's `CommunityCommentSummary` has no `parentId` (no replies) and
// no like count, so this row is intentionally flat with no Actions row —
// unlike the Figma reference, which shows reply/like affordances that don't
// exist on the server yet.
export default function CommentItem({ comment, now }: CommentItemProps) {
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
        author: authorName,
        content,
        time: relativeTime,
      })}
      testID={`v2-community-comment-${comment.commentId}`}
    >
      <Avatar>
        <CommentAvatarIcon height={18} width={18} />
      </Avatar>
      <Content>
        <NameRow>
          <Name>{authorName}</Name>
          {relativeTime ? <Time>{relativeTime}</Time> : null}
        </NameRow>
        <Body>{content}</Body>
      </Content>
    </Row>
  );
}

const Row = styled.View`flex-direction: row; align-items: flex-start; gap: ${({ theme }) => theme.spacing.sm}px; width: 100%;`;
const Avatar = styled.View`width: 32px; height: 32px; border-radius: 16px; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.backgroundNeutral};`;
const Content = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
const Name = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 14px; font-weight: 700;`;
const Time = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;`;
const Body = styled(AppText)`color: ${({ theme }) => theme.colors.text}; font-size: 14px; line-height: 18px;`;
