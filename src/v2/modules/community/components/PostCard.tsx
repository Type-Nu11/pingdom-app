import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import EtcVerticalIcon from '../../../../assets/v2/icons/community/etc-vertical.svg';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityPostSummary } from '../api/communityApi';

export type PostCardProps = {
  categoryName?: string;
  onOpenOverflow: (event: GestureResponderEvent) => void;
  onPress: () => void;
  post: CommunityPostSummary;
};

// The list endpoint only returns `{ postId, title }` (see communityApi.ts) —
// the Figma card's preview, thumbnail, region/time/view meta and like/comment
// counts aren't part of the real contract, so this card can't show them yet.
// The category tag comes from the category the list was fetched for.
export default function PostCard({ categoryName, onOpenOverflow, onPress, post }: PostCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      accessibilityLabel={post.title}
      accessibilityRole="button"
      onPress={onPress}
      testID={`v2-community-post-${post.postId}`}
    >
      <TagRow>
        <Tags>
          {categoryName ? (
            <Tag testID={`v2-community-post-${post.postId}-tag`}>
              <TagLabel numberOfLines={1}>{categoryName}</TagLabel>
            </Tag>
          ) : null}
        </Tags>
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
          <EtcVerticalIcon height={23.4} width={24.0021} />
        </OverflowButton>
      </TagRow>
      <Title numberOfLines={2}>{post.title}</Title>
    </Card>
  );
}

// Figma `FeedItem/Post`: 16px vertical padding, 24px tag row, 8px gap.
const Card = styled.Pressable`
  width: 100%;
  gap: 8px;
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const TagRow = styled.View`
  height: 24px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Tags = styled.View`
  flex: 1;
  flex-direction: row;
  gap: 4px;
  min-width: 0;
`;

const Tag = styled.View`
  height: 24px;
  justify-content: center;
  padding: 0 8px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.fillNeutral};
`;

const TagLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNeutral};
  ${({ theme }) => textStyleCss(theme.typography.captionMedium)}
`;

const Title = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNormal};
  ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}
`;

const OverflowButton = styled.Pressable`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;
