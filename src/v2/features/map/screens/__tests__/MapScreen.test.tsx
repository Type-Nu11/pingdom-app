import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { useMapDiscovery } from '../../hooks/useMapDiscovery';
import MapScreen from '../MapScreen';

jest.mock('../../hooks/useCurrentLocation', () => ({ useCurrentLocation: jest.fn() }));
jest.mock('../../hooks/useMapDiscovery', () => ({ useMapDiscovery: jest.fn() }));
jest.mock('../../components/KakaoMapAdapter', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({ onMarkerSelect }: { onMarkerSelect?: (id: string) => void }) =>
      ReactLibrary.createElement(
        ReactNative.View,
        { testID: 'mock-kakao-map' },
        ReactLibrary.createElement(ReactNative.Pressable, {
          testID: 'mock-marker',
          onPress: () => onMarkerSelect?.('place:17'),
        }),
      ),
  };
});

const place = {
  address: '서울 테스트로 17',
  category: 'CAFE',
  coordinate: { lat: 37.5, lng: 127 },
  distanceMeters: 120,
  id: 17,
  name: '서버 카페',
};

const baseDiscovery: ReturnType<typeof useMapDiscovery> = {
  autocomplete: [place],
  autocompleteError: null,
  isAutocompleteLoading: false,
  isEmpty: false,
  isLoading: false,
  isRefreshing: false,
  markers: [{
    category: 'food', id: 'place:17', kind: 'place', lat: 37.5, lng: 127,
    markerType: 'default', name: '서버 카페', placeId: 17,
  }],
  queryError: null,
  refetch: jest.fn(),
  results: [place],
  selectedPlace: {
    address: place.address,
    category: 'CAFE',
    currentlyOperating: true,
    id: 17,
    name: place.name,
    notice: null,
    summary: null,
  },
  selectedPlaceError: null,
  selectedPlaceLoading: false,
};

describe('MapScreen', () => {
  beforeEach(() => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: true,
      coordinate: { lat: 37.5, lng: 127 },
      refresh: jest.fn(),
      status: 'granted',
    });
    jest.mocked(useMapDiscovery).mockReturnValue(baseDiscovery);
  });

  test('검색어와 카테고리를 Hook 상태로 전달하고 서버 자동완성 장소를 선택한다', async () => {
    const { user } = await renderWithProviders(<MapScreen />);

    await user.type(screen.getByTestId('v2-map-search-input'), '카페');
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: '카페' }));
    expect(screen.getByText('서버 카페')).toBeVisible();

    await user.press(screen.getByText('음식'));
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'FOOD' }));

    await user.press(screen.getByText('서버 카페'));
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({ selectedPlaceId: 17 }));
    expect(screen.getByTestId('v2-selected-place')).toBeVisible();
  });

  test('API empty와 위치 권한 거부 상태를 함께 표시한다', async () => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: false,
      coordinate: null,
      refresh: jest.fn(),
      status: 'denied',
    });
    jest.mocked(useMapDiscovery).mockReturnValue({ ...baseDiscovery, isEmpty: true, markers: [] });

    await renderWithProviders(<MapScreen />);

    expect(screen.getByTestId('v2-location-denied')).toBeVisible();
    expect(screen.getByTestId('v2-map-empty')).toBeVisible();
    fireEvent.press(screen.getByTestId('v2-map-locate'));
  });
});
