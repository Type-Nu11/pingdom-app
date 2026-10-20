import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import PostPhotoGallery from '../PostPhotoGallery';

const photos = (count: number) => Array.from({ length: count }, (_value, index) => ({
  imageId: index + 1,
  imageUrl: `https://cdn.test/community/${index + 1}.jpg`,
  position: index,
}));

function renderGallery(images: React.ComponentProps<typeof PostPhotoGallery>['images']) {
  return renderWithProviders(<PostPhotoGallery images={images} />, { language: 'ko' });
}

describe('PostPhotoGallery', () => {
  test.each([[undefined], [null], [[]]])('renders nothing for %p', async (images) => {
    await renderGallery(images);

    expect(screen.queryByTestId('v2-community-detail-photos')).toBeNull();
  });

  test('a single photo fills the content width with no strip and no count badge', async () => {
    await renderGallery(photos(1));

    const gallery = screen.getByTestId('v2-community-detail-photos');
    expect(gallery.props.horizontal).toBeUndefined();
    await act(async () => { fireEvent(gallery, 'layout', { nativeEvent: { layout: { height: 264, width: 354 } } }); });

    expect(screen.getByTestId('v2-community-detail-photo-0')).toHaveStyle({ height: 264, width: 354 });
    expect(screen.queryByTestId('v2-community-detail-photo-0-count')).toBeNull();
  });

  test('several photos form a horizontal strip of 264px squares 8px apart with n/total badges', async () => {
    await renderGallery(photos(4));

    const gallery = screen.getByTestId('v2-community-detail-photos');
    expect(gallery.props.horizontal).toBe(true);
    expect(gallery.props.contentContainerStyle).toMatchObject({ gap: 8 });
    expect(gallery.props.snapToInterval).toBe(272);
    for (let index = 0; index < 4; index += 1) {
      expect(screen.getByTestId(`v2-community-detail-photo-${index}`)).toHaveStyle({
        borderColor: '#F2F2F3',
        borderTopLeftRadius: 12,
        borderWidth: 1,
        height: 264,
        width: 264,
      });
      expect(screen.getByTestId(`v2-community-detail-photo-${index}-count`)).toHaveTextContent(`${index + 1}/4`);
    }
  });

  test('renders all ten photos of a full post in response order', async () => {
    await renderGallery(photos(10));

    expect(screen.getByTestId('v2-community-detail-photo-9').props.source).toEqual({ uri: 'https://cdn.test/community/10.jpg' });
    expect(screen.getByTestId('v2-community-detail-photo-9-count')).toHaveTextContent('10/10');
    expect(screen.queryByTestId('v2-community-detail-photo-10')).toBeNull();
  });

  test('a photo that fails to load keeps its slot and badge with the placeholder tile', async () => {
    await renderGallery(photos(2));

    await act(async () => { fireEvent(screen.getByTestId('v2-community-detail-photo-1'), 'error'); });

    expect(screen.getByTestId('v2-community-detail-photo-1-fallback')).toHaveStyle({ height: 264, width: 264 });
    expect(screen.getByTestId('v2-community-detail-photo-1-count')).toHaveTextContent('2/2');
    expect(screen.getByTestId('v2-community-detail-photo-0')).toBeTruthy();
  });

  test('entries without a URL are skipped and do not count toward the total', async () => {
    await renderGallery([{ imageId: 1, imageUrl: 'https://cdn.test/a.jpg', position: 0 }, { imageId: 2, position: 1 }]);

    expect(screen.getByTestId('v2-community-detail-photos').props.horizontal).toBeUndefined();
  });
});
