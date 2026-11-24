import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import IosReviewPhotoGallery from '../IosReviewPhotoGallery';

test('긴 가로 사진 목록은 화면 주변만 마운트하고 마지막 사진까지 원래 순서를 유지한다', async () => {
  const urls = Array.from({ length: 60 }, (_, index) => `https://example.com/photo-${index + 1}.jpg`);
  await render(
    <IosReviewPhotoGallery
      urls={urls}
      renderPhoto={(_, index) => <Text testID="review-photo">{index + 1}</Text>}
    />,
  );

  const gallery = screen.getByTestId('map-review-photo-gallery');
  await fireEvent(gallery, 'layout', { nativeEvent: { layout: { width: 354 } } });
  expect(screen.getAllByTestId('review-photo')).toHaveLength(6);
  expect(screen.queryByText('60')).toBeNull();

  await fireEvent.scroll(gallery, { nativeEvent: { contentOffset: { x: 5_400, y: 0 } } });
  expect(screen.queryByText('1')).toBeNull();
  expect(screen.getByText('31')).toBeOnTheScreen();
  expect(screen.getAllByTestId('review-photo')).toHaveLength(9);

  await fireEvent.scroll(gallery, { nativeEvent: { contentOffset: { x: 10_430, y: 0 } } });
  expect(screen.getByText('60')).toBeOnTheScreen();
  expect(screen.queryByText('31')).toBeNull();
});
