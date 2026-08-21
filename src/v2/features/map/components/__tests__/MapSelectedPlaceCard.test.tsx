import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import MapSelectedPlaceCard from '../MapSelectedPlaceCard';

const place = {
  address: '서울 테스트로 17',
  category: 'CAFE',
  currentlyOperating: true,
  distanceMeters: null,
  id: 17,
  imageUrl: null,
  name: '이미지 없는 카페',
  notice: null,
  summary: null,
};

describe('MapSelectedPlaceCard', () => {
  test('이미지가 없으면 대체 UI를 표시한다', async () => {
    await renderWithProviders(
      <MapSelectedPlaceCard
        error={null}
        loading={false}
        onDismiss={jest.fn()}
        onOpenPlace={jest.fn()}
        onRetry={jest.fn()}
        place={place}
        selectedPlaceId={17}
        visible
      />,
    );

    expect(screen.getByTestId('v2-selected-place-image-fallback')).toBeVisible();
  });

  test('카드 요청 오류에서 재시도 동작을 제공한다', async () => {
    const onRetry = jest.fn();
    const { user } = await renderWithProviders(
      <MapSelectedPlaceCard
        error={new Error('network')}
        loading={false}
        onDismiss={jest.fn()}
        onOpenPlace={jest.fn()}
        onRetry={onRetry}
        place={null}
        selectedPlaceId={17}
        visible
      />,
    );

    await user.press(screen.getByTestId('v2-selected-place-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
