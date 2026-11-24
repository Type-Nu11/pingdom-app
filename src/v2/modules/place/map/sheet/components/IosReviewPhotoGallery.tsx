import React, { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { REVIEW_PHOTO_GAP, REVIEW_PHOTO_SIZE } from '../styles/MapBottomSheet.styles';

const PHOTO_STRIDE = REVIEW_PHOTO_SIZE + REVIEW_PHOTO_GAP;
const INITIAL_PHOTO_COUNT = 6;
const OVERSCAN_PHOTO_COUNT = 3;

type Props = {
  urls: string[];
  renderPhoto: (url: string, index: number) => ReactNode;
};

export default function IosReviewPhotoGallery({ urls, renderPhoto }: Props) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [firstVisible, setFirstVisible] = useState(0);
  const visibleCount = Math.ceil(viewportWidth / PHOTO_STRIDE) + 1;
  const first = Math.max(0, Math.min(firstVisible, urls.length - 1) - OVERSCAN_PHOTO_COUNT);
  const end = Math.min(urls.length, Math.max(INITIAL_PHOTO_COUNT, firstVisible + visibleCount + OVERSCAN_PHOTO_COUNT));
  const trailingWidth = (urls.length - end) * PHOTO_STRIDE - REVIEW_PHOTO_GAP;

  // Fixed spacers keep the native scroll content the same size as cells enter and leave the window.
  return (
    <ScrollView
      horizontal
      contentContainerStyle={{ paddingTop: REVIEW_PHOTO_GAP }}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onLayout={({ nativeEvent }) => setViewportWidth(nativeEvent.layout.width)}
      onScroll={({ nativeEvent }) => {
        const offset = Math.max(0, nativeEvent.contentOffset.x);
        setFirstVisible(Math.floor(offset / PHOTO_STRIDE));
      }}
      testID="map-review-photo-gallery"
    >
      {first > 0 ? <View accessible={false} pointerEvents="none" style={{ width: first * PHOTO_STRIDE }} /> : null}
      {urls.slice(first, end).map((url, relativeIndex) => {
        const index = first + relativeIndex;
        return (
          <View key={index} style={{ width: index === urls.length - 1 ? REVIEW_PHOTO_SIZE : PHOTO_STRIDE }}>
            {renderPhoto(url, index)}
          </View>
        );
      })}
      {trailingWidth > 0 ? <View accessible={false} pointerEvents="none" style={{ width: trailingWidth }} /> : null}
    </ScrollView>
  );
}
