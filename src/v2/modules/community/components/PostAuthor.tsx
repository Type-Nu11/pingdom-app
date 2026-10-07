import { Text as AppText } from '../../../shared/components/Typography';
import React, { useState } from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import { formatRelativeMinutes } from '../../../shared/i18n/formatters';
import { textStyleCss } from '../../../shared/theme/typography';
import type { CommunityPostDetail } from '../api/communityApi';

const AVATAR_SIZE = 37;

export type PostAuthorProps = {
  author: CommunityPostDetail['author'];
  createdAt?: string;
  now: Date;
};

// Figma `Author`: 37px User_Circle avatar, 10px gap, Label/Bold name over the
// Caption meta line. The contract gives the author and creation time only, so
// the meta line shows the relative time (region and views aren't provided).
export default function PostAuthor({ author, createdAt, now }: PostAuthorProps) {
  const { i18n } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = author?.profileImageUrl;
  const minutesAgo = createdAt ? Math.floor((now.getTime() - new Date(createdAt).getTime()) / 60_000) : 0;
  const relativeTime = createdAt ? formatRelativeMinutes(minutesAgo, i18n.language) : '';

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
        {relativeTime ? <Meta numberOfLines={1}>{relativeTime}</Meta> : null}
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
const Meta = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
