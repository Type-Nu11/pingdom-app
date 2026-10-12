import { Text as AppText } from '../../../shared/components/Typography';
import React, { useRef } from 'react';
import { type GestureResponderEvent, type View } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import ChatDotsIcon from '../../../../assets/v2/icons/community/chat-dots-16.svg';
import EtcVerticalIcon from '../../../../assets/v2/icons/community/etc-vertical.svg';
import StarOutlineIcon from '../../../../assets/v2/icons/community/star-outline-16.svg';
import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityPostSummary } from '../api/communityApi';
import { extraPhotoCount, joinMeta } from '../model/photoCount';
import CategoryTag from './CategoryTag';
import CommunityImage from './CommunityImage';
import PhotoCountBadge from './PhotoCountBadge';

/** Window-space bottom edge of the overflow icon, used to anchor its menu. */
export type OverflowAnchor = { bottom: number };

export type PostCardProps = {
  /** Category the list was fetched for; used when the item carries none. */
  categoryName?: string;
  now: Date;
  onOpenOverflow: (anchor: OverflowAnchor) => void;
  onPress: () => void;
  post: CommunityPostSummary;
};

const isCount = (value: number | null | undefined): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

// Figma `FeedItem/Post` (8082:37094). Every block below the title is driven by
// the list response: a field the server omits is left out, never zero-filled.
// A post has exactly one category, so the tag row shows a single tag.
export default function PostCard({ categoryName, now, onOpenOverflow, onPress, post }: PostCardProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const overflowRef = useRef<View>(null);

  const openOverflow = (event: GestureResponderEvent) => {
    event.stopPropagation();
    // Open at the touch point immediately, then snap to the icon's measured
    // bottom edge once layout reports it (hidden behind the menu's fade-in).
    onOpenOverflow({ bottom: event.nativeEvent.pageY });
    overflowRef.current?.measureInWindow?.((_x, y, _width, height) => {
      if (Number.isFinite(y) && height > 0) onOpenOverflow({ bottom: y + height });
    });
  };

  const tagLabel = post.category?.categoryName ?? categoryName;
  // The preview is the first 150 characters of the body, line breaks included;
  // the card shows it as a single line.
  const preview = post.contentPreview?.replace(/\s+/g, ' ').trim();
  const createdTime = post.createdAt ? new Date(post.createdAt).getTime() : Number.NaN;
  const relativeTime = Number.isFinite(createdTime)
    ? formatRelativeMinutes(Math.max(0, Math.floor((now.getTime() - createdTime) / 60_000)), i18n.language)
    : '';
  const info = joinMeta([
    post.region,
    relativeTime,
    isCount(post.viewCount) ? t('community.list.views', { count: post.viewCount }) : undefined,
  ]);
  const extraPhotos = extraPhotoCount(post.imageCount);
  const showLikes = isCount(post.likeCount);
  const showComments = isCount(post.commentCount);
  const hasMeta = Boolean(info) || showLikes || showComments;

  return (
    <Card
      accessibilityLabel={post.title}
      accessibilityRole="button"
      onPress={onPress}
      testID={`v2-community-post-${post.postId}`}
    >
      <TagRow>
        <Tags>
          {tagLabel ? (
            <CategoryTag label={tagLabel} testID={`v2-community-post-${post.postId}-tag`} />
          ) : null}
        </Tags>
        <OverflowButton
          accessibilityLabel={t('community.moreOptions')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={openOverflow}
          ref={overflowRef}
          testID={`v2-community-post-${post.postId}-overflow`}
        >
          <EtcVerticalIcon color={theme.colors.labelNeutral} height={23.4} width={24.0021} />
        </OverflowButton>
      </TagRow>

      <Body $hasThumbnail={Boolean(post.imageUrl)}>
        <Texts>
          <Title numberOfLines={2}>{post.title}</Title>
          {preview ? (
            <Preview numberOfLines={1} testID={`v2-community-post-${post.postId}-preview`}>{preview}</Preview>
          ) : null}
        </Texts>
        {post.imageUrl ? (
          <Thumbnail>
            <CommunityImage
              accessibilityLabel={isCount(post.imageCount) ? t('community.list.photosA11y', { count: post.imageCount }) : undefined}
              height={80}
              radius={theme.radius.md}
              testID={`v2-community-post-${post.postId}-thumbnail`}
              uri={post.imageUrl}
              width={80}
            />
            {extraPhotos > 0 ? (
              <PhotoCountBadge
                label={`+${extraPhotos}`}
                testID={`v2-community-post-${post.postId}-photo-count`}
                variant="thumbnail"
              />
            ) : null}
          </Thumbnail>
        ) : null}
      </Body>

      {hasMeta ? (
        <Meta>
          <Info numberOfLines={1} testID={`v2-community-post-${post.postId}-info`}>{info}</Info>
          <Stats>
            {showLikes ? (
              <Stat
                accessibilityLabel={t('community.list.likesA11y', { count: post.likeCount })}
                accessible
                testID={`v2-community-post-${post.postId}-likes`}
              >
                <StarOutlineIcon color={theme.colors.textAlternative} height={16} width={16} />
                <StatCount>{post.likeCount}</StatCount>
              </Stat>
            ) : null}
            {showComments ? (
              <Stat
                accessibilityLabel={t('community.list.commentsA11y', { count: post.commentCount })}
                accessible
                testID={`v2-community-post-${post.postId}-comments`}
              >
                <ChatDotsIcon color={theme.colors.labelAssistive} height={16} width={16} />
                <StatCount>{post.commentCount}</StatCount>
              </Stat>
            ) : null}
          </Stats>
        </Meta>
      ) : null}
    </Card>
  );
}

// Figma `FeedItem/Post`: 16px vertical padding around a 24px tag row, the
// body and an 18px meta row, 8px apart — 170px tall with a thumbnail.
// The 1px divider is part of the 170px, so the bottom padding gives it up.
const Card = styled.Pressable`
  width: 100%;
  gap: 8px;
  padding: 16px 0 15px;
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

// The 80px thumbnail sets the body height; without one the texts take the
// full width and the body is only as tall as they are.
const Body = styled.View<{ $hasThumbnail: boolean }>`
  flex-direction: row;
  gap: 16px;
  min-height: ${({ $hasThumbnail }) => ($hasThumbnail ? 80 : 0)}px;
`;

const Texts = styled.View`
  flex: 1;
  gap: 4px;
  min-width: 0;
`;

const Title = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNormal};
  ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}
`;

const Preview = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNeutral};
  ${({ theme }) => textStyleCss(theme.typography.bodyRegular)}
`;

const Thumbnail = styled.View`
  width: 80px;
  height: 80px;
`;

const Meta = styled.View`
  height: 18px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Info = styled(AppText)`
  flex: 1;
  color: ${({ theme }) => theme.colors.labelAssistive};
  ${({ theme }) => textStyleCss(theme.typography.captionRegular)}
`;

const Stats = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Stat = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const StatCount = styled(AppText)`
  color: ${({ theme }) => theme.colors.textAlternative};
  ${({ theme }) => textStyleCss(theme.typography.labelMedium)}
`;

const OverflowButton = styled.Pressable`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;
