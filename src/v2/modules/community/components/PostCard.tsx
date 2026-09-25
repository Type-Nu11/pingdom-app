import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { Image, type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import ChatDotsIcon from '../../../../assets/v2/icons/community/chat-dots.svg';
import EtcVerticalIcon from '../../../../assets/v2/icons/community/etc-vertical.svg';
import StarFilledIcon from '../../../../assets/v2/icons/community/star-filled.svg';
import StarOutlineIcon from '../../../../assets/v2/icons/community/star-outline.svg';
import type { CommunityPostSummary } from '../model/types';

export type PostCardProps = {
  onOpenOverflow: (event: GestureResponderEvent) => void;
  onPress: () => void;
  post: CommunityPostSummary;
};

export default function PostCard({ onOpenOverflow, onPress, post }: PostCardProps) {
  const { t } = useTranslation();
  const extraPhotoCount = post.photoCount - 1;

  return (
    <Card
      accessibilityLabel={post.title}
      accessibilityRole="button"
      onPress={onPress}
      testID={`v2-community-post-${post.id}`}
    >
      <TagRow>
        <Tags>
          {post.tags.map((tag) => (
            <TagChip key={tag}>
              <TagLabel numberOfLines={1}>{t(`community.categories.${tag}`)}</TagLabel>
            </TagChip>
          ))}
        </Tags>
        <OverflowButton
          accessibilityLabel={t('community.moreOptions')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onOpenOverflow(event);
          }}
          testID={`v2-community-post-${post.id}-overflow`}
        >
          <EtcVerticalIcon height={20} width={20} />
        </OverflowButton>
      </TagRow>

      <Body>
        <Texts>
          <Title numberOfLines={2}>{post.title}</Title>
          <Preview numberOfLines={1}>{post.preview}</Preview>
        </Texts>
        {post.thumbnailUrl ? (
          <ThumbnailWrap>
            <Thumbnail source={{ uri: post.thumbnailUrl }} />
            {extraPhotoCount > 0 ? (
              <MoreBadge>
                <MoreBadgeText>+{extraPhotoCount}</MoreBadgeText>
              </MoreBadge>
            ) : null}
          </ThumbnailWrap>
        ) : null}
      </Body>

      <Meta>
        <MetaText numberOfLines={1}>
          {t('community.postMeta', { location: post.location, time: post.relativeTime, count: post.viewCount })}
        </MetaText>
        <Stats>
          <StatItem>
            {post.liked ? <StarFilledIcon height={16} width={16} /> : <StarOutlineIcon height={16} width={16} />}
            <StatText>{post.likeCount}</StatText>
          </StatItem>
          <StatItem>
            <ChatDotsIcon height={16} width={16} />
            <StatText>{post.commentCount}</StatText>
          </StatItem>
        </Stats>
      </Meta>
    </Card>
  );
}

const Card = styled.Pressable`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const TagRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Tags = styled.View`
  flex: 1;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`;

const TagChip = styled.View`
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundNeutral};
`;

const TagLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 500;
`;

const OverflowButton = styled.Pressable`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;

const Body = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Texts = styled.View`
  flex: 1;
  gap: 4px;
`;

const Title = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: 700;
`;

const Preview = styled(AppText)`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const ThumbnailWrap = styled.View`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  overflow: hidden;
`;

const Thumbnail = styled(Image)`
  width: 100%;
  height: 100%;
`;

const MoreBadge = styled.View`
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 2px 6px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.6);
`;

const MoreBadgeText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textInverse};
  font-size: 12px;
  font-weight: 700;
`;

const Meta = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const MetaText = styled(AppText)`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const Stats = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const StatText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 500;
`;
