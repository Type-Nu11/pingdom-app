import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import EtcVerticalIcon from '../../../../assets/v2/icons/community/etc-vertical.svg';
import type { CommunityPostSummary } from '../api/communityApi';

export type PostCardProps = {
  onOpenOverflow: (event: GestureResponderEvent) => void;
  onPress: () => void;
  post: CommunityPostSummary;
};

// The list endpoint only returns `{ postId, title }` (see communityApi.ts) —
// tags, thumbnails, and like/comment counts aren't part of the real contract,
// so this card can't show them yet.
export default function PostCard({ onOpenOverflow, onPress, post }: PostCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      accessibilityLabel={post.title}
      accessibilityRole="button"
      onPress={onPress}
      testID={`v2-community-post-${post.postId}`}
    >
      <Title numberOfLines={2}>{post.title}</Title>
      <OverflowButton
        accessibilityLabel={t('community.moreOptions')}
        accessibilityRole="button"
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onOpenOverflow(event);
        }}
        testID={`v2-community-post-${post.postId}-overflow`}
      >
        <EtcVerticalIcon height={20} width={20} />
      </OverflowButton>
    </Card>
  );
}

const Card = styled.Pressable`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const Title = styled(AppText)`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: 700;
`;

const OverflowButton = styled.Pressable`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;
