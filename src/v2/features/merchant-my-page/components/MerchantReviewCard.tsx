import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import CleanIcon from '../../../../assets/v2/icons/place/Clean.svg';
import DeliciousIcon from '../../../../assets/v2/icons/place/Delicious.svg';
import KindIcon from '../../../../assets/v2/icons/place/Kind.svg';
import PhotogenicIcon from '../../../../assets/v2/icons/place/Camera.svg';
import type { MerchantReview, MerchantReviewTagKind } from '../model/types';

type MerchantReviewCardProps = {
  review: MerchantReview;
  showDivider?: boolean;
};

const TAG_ICON: Record<MerchantReviewTagKind, React.FC<{ height: number; width: number }>> = {
  clean: CleanIcon,
  delicious: DeliciousIcon,
  kind: KindIcon,
  photogenic: PhotogenicIcon,
};

const REVIEW_PHOTO_WIDTH = 242;
const REVIEW_PHOTO_HEIGHT = 182;

export default function MerchantReviewCard({ review, showDivider = true }: MerchantReviewCardProps) {
  return (
    <Card $withDivider={showDivider} testID="v2-merchant-review-card">
      <AuthorRow>
        {review.authorProfileImageUrl ? (
          <Avatar source={{ uri: review.authorProfileImageUrl }} />
        ) : (
          <AvatarFallback>
            <AvatarPlaceholder height={44} width={44} />
          </AvatarFallback>
        )}
        <AuthorText>
          <AuthorName numberOfLines={1}>{review.authorName}</AuthorName>
          <AuthorMeta numberOfLines={1}>{review.relativeTime}</AuthorMeta>
        </AuthorText>
      </AuthorRow>

      <Content>{review.content}</Content>

      {review.photoUrls.length > 0 ? (
        <PhotoScroll horizontal showsHorizontalScrollIndicator={false}>
          {review.photoUrls.map((url, index) => (
            <ReviewPhoto
              key={url}
              source={{ uri: url }}
              style={{
                borderTopLeftRadius: index === 0 ? 16 : 0,
                borderBottomLeftRadius: index === 0 ? 16 : 0,
                borderTopRightRadius: index === review.photoUrls.length - 1 ? 16 : 0,
                borderBottomRightRadius: index === review.photoUrls.length - 1 ? 16 : 0,
              }}
            />
          ))}
        </PhotoScroll>
      ) : null}

      {review.tags.length > 0 ? (
        <TagRow>
          {review.tags.map((tag) => {
            const Icon = tag.kind ? TAG_ICON[tag.kind] : null;
            return (
              <TagChip key={tag.label}>
                {Icon ? <Icon height={14} width={14} /> : null}
                <TagLabel numberOfLines={1}>{tag.label}</TagLabel>
              </TagChip>
            );
          })}
        </TagRow>
      ) : null}
    </Card>
  );
}

const Card = styled.View<{ $withDivider: boolean }>`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: ${({ $withDivider }) => ($withDivider ? 1 : 0)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Avatar = styled(Image)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border-width: 1.5px;
  border-color: #bfc1c1;
`;

const AvatarFallback = styled.View`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  border-width: 1.5px;
  border-color: #bfc1c1;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  overflow: hidden;
`;

const AuthorText = styled.View`
  gap: 1px;
`;

const AuthorName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const AuthorMeta = styled.Text`
  color: #5e5e66;
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
`;

const Content = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const PhotoScroll = styled.ScrollView.attrs({
  contentContainerStyle: { gap: 2 },
})``;

const ReviewPhoto = styled(Image)`
  width: ${REVIEW_PHOTO_WIDTH}px;
  height: ${REVIEW_PHOTO_HEIGHT}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const TagRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const TagChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: #f2f2f3;
`;

const TagLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 500;
`;
