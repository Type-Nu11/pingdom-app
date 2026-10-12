import React, { useState } from 'react';
import { ScrollView, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import type { CommunityPostImage } from '../api/communityApi';
import CommunityImage from './CommunityImage';
import PhotoCountBadge from './PhotoCountBadge';

export const GALLERY_PHOTO_SIZE = 264;
export const GALLERY_PHOTO_GAP = 8;
// The gallery sits inside the post's 24px side padding and bleeds back out to
// the screen edges so the next photo peeks in, as in the Figma frame.
const POST_SIDE_PADDING = 24;

export type PostPhotoGalleryProps = {
  /** Post photos in display order — the response order is the gallery order. */
  images?: readonly CommunityPostImage[] | null;
};

// Figma `Photos` (8241:47056): 264px square photos 8px apart in a horizontal
// strip, each carrying its `n/total` badge. A post without photos renders
// nothing; a single photo fills the content width with no strip and no badge.
export default function PostPhotoGallery({ images }: PostPhotoGalleryProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [contentWidth, setContentWidth] = useState(0);
  const photos = (images ?? []).filter((image) => Boolean(image.imageUrl));
  const total = photos.length;

  if (total === 0) return null;

  if (total === 1) {
    const onLayout = (event: LayoutChangeEvent) => setContentWidth(event.nativeEvent.layout.width);
    return (
      <Single
        accessibilityLabel={t('community.detail.photos.galleryA11y', { count: 1 })}
        onLayout={onLayout}
        testID="v2-community-detail-photos"
      >
        {contentWidth > 0 ? (
          <CommunityImage
            accessibilityLabel={t('community.detail.photos.photoA11y', { index: 1, total: 1 })}
            bordered
            height={GALLERY_PHOTO_SIZE}
            radius={theme.radius.md}
            testID="v2-community-detail-photo-0"
            uri={photos[0].imageUrl}
            width={contentWidth}
          />
        ) : null}
      </Single>
    );
  }

  return (
    <Strip
      accessibilityLabel={t('community.detail.photos.galleryA11y', { count: total })}
      contentContainerStyle={STRIP_CONTENT_STYLE}
      decelerationRate="fast"
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={GALLERY_PHOTO_SIZE + GALLERY_PHOTO_GAP}
      testID="v2-community-detail-photos"
    >
      {photos.map((photo, index) => (
        <Photo key={photo.imageId ?? `photo-${index}`}>
          <CommunityImage
            accessibilityLabel={t('community.detail.photos.photoA11y', { index: index + 1, total })}
            bordered
            height={GALLERY_PHOTO_SIZE}
            radius={theme.radius.md}
            testID={`v2-community-detail-photo-${index}`}
            uri={photo.imageUrl}
            width={GALLERY_PHOTO_SIZE}
          />
          <PhotoCountBadge
            label={`${index + 1}/${total}`}
            testID={`v2-community-detail-photo-${index}-count`}
            variant="gallery"
          />
        </Photo>
      ))}
    </Strip>
  );
}

const STRIP_CONTENT_STYLE = { gap: GALLERY_PHOTO_GAP, paddingHorizontal: POST_SIDE_PADDING } as const;

const Single = styled.View`height: ${GALLERY_PHOTO_SIZE}px;`;
const Strip = styled(ScrollView)`flex-grow: 0; margin: 0 -${POST_SIDE_PADDING}px;`;
const Photo = styled.View`width: ${GALLERY_PHOTO_SIZE}px; height: ${GALLERY_PHOTO_SIZE}px;`;
