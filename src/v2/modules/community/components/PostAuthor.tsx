import { Text as AppText } from '../../../shared/components/Typography';
import React, { useState } from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityPostDetail } from '../api/communityApi';
import { joinMeta } from '../model/photoCount';

const AVATAR_SIZE = 37;

export type PostAuthorProps = {
  author: CommunityPostDetail['author'];
  createdAt?: string;
  now: Date;
  /** Display region the author set; omitted when the post has none. */
  region?: string | null;
  viewCount?: number | null;
};

// Figma `Author`: 37px User_Circle avatar, 10px gap, Label/Bold name over the
// Caption meta line ("구지면 · 12분 전 · 조회 128"). Each part of the meta line is
// shown only when the response carries it.
export default function PostAuthor({ author, createdAt, now, region, viewCount }: PostAuthorProps) {
  const { i18n, t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = author?.profileImageUrl;
  const minutesAgo = createdAt ? Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60_000) : 0;
  const relativeTime = createdAt ? formatRelativeMinutes(minutesAgo, i18n.language) : '';
  const meta = joinMeta([
    region,
    relativeTime,
    typeof viewCount === 'number' && Number.isFinite(viewCount)
      ? t('community.list.views', { count: viewCount })
      : undefined,
  ]);

  if (!author?.authorName) return null;

  return (
    <Row testID="v2-community-detail-author">
      {imageUrl && !imageFailed ? (
        <Avatar
          accessibilityIgnoresInvertColors
          onError={() => setImageFailed(true)}
          source={{ uri: imageUrl }}
          testID="v2-community-detail-author-image"
        />
      ) : (
        <AvatarPlaceholder height={AVATAR_SIZE} width={AVATAR_SIZE} />
      )}
      <Info>
        <Name numberOfLines={1}>{author.authorName}</Name>
        {meta ? <Meta numberOfLines={1} testID="v2-community-detail-author-meta">{meta}</Meta> : null}
      </Info>
    </Row>
  );
}

const Row = styled.View`flex-direction: row; align-items: center; gap: 10px;`;
const Avatar = styled(Image)`
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  border-radius: ${AVATAR_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const Info = styled.View`flex: 1; gap: 2px; min-width: 0;`;
const Name = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.labelBold)}`;
const Meta = styled(AppText)`color: ${({ theme }) => theme.colors.labelAssistive}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
