import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../v2/shared/testing/testProviders';
import type { Place } from '../../../place/model/place.types';
import SavedPlacesGallery from '../SavedPlacesGallery';

const savedPlace: Place = {
  address: '서울 성동구 연무장길 1',
  category: 'CAFE',
  id: 11,
  latitude: 37.54,
  longitude: 127.05,
  name: '저장한 카페',
};

describe('SavedPlacesGallery', () => {
  test('장소 북마크 목록을 표시하고 선택한 장소를 전달한다', async () => {
    const onPlacePress = jest.fn();

    const { user } = await renderWithProviders(
      <SavedPlacesGallery
        itemSize={120}
        onPlacePress={onPlacePress}
        onRetry={jest.fn()}
        places={[savedPlace]}
      />,
    );

    await user.press(screen.getByText('저장한 카페'));

    expect(onPlacePress).toHaveBeenCalledWith(savedPlace);
    expect(screen.queryByText('저장한 게시글')).not.toBeOnTheScreen();
  });
});
