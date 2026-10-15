import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../../../../shared/theme/colors';
import PlacePhotoViewer from '../PlacePhotoViewer';

describe('PlacePhotoViewer', () => {
  test.each(['LIGHT', 'DARK'] as const)('photo controls remain readable in %s appearance', async (appearancePreference) => {
    const onClose = jest.fn();
    await renderWithProviders(
      <PlacePhotoViewer
        visible
        imageUrls={['https://example.test/first.jpg', 'https://example.test/second.jpg']}
        initialIndex={1}
        placeName="테스트 장소"
        onClose={onClose}
      />,
      { appearancePreference },
    );
    const colors = appearancePreference === 'DARK' ? darkColors : lightColors;
    expect(screen.getByTestId('place-photo-viewer')).toHaveStyle({ backgroundColor: colors.background });
    expect(screen.getByText('2 / 2')).toHaveStyle({ color: colors.textStrong });
    expect(screen.getByText('×')).toHaveStyle({ color: colors.textStrong });
    await fireEvent.press(screen.getByRole('button', { name: '다음 사진' }));
    await waitFor(() => expect(screen.getByText('1 / 2')).toBeTruthy());
    await fireEvent.press(screen.getByRole('button', { name: '사진 닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
