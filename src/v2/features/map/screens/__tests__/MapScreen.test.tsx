import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import React from 'react';

import { V2_ROUTES, type V2ScreenProps } from '../../../../app/navigation/types';
import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
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
    default: ({
      markers,
      onMarkerSelect,
    }: {
      markers: { id: string }[];
      onMarkerSelect?: (id: string) => void;
    }) =>
      ReactLibrary.createElement(
        ReactNative.View,
        { testID: 'mock-kakao-map' },
        markers.map((marker) => ReactLibrary.createElement(ReactNative.Pressable, {
          key: marker.id,
          testID: `mock-marker-${marker.id}`,
          onPress: () => onMarkerSelect?.(marker.id),
        })),
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
  dataSource: 'real',
  isAutocompleteLoading: false,
  isDisabled: false,
  hasResolvedMarkers: true,
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
    distanceMeters: 120,
    id: 17,
    imageUrl: 'https://cdn.example.test/places/17.jpg',
    imageUrls: ['https://cdn.example.test/places/17.jpg'],
    name: place.name,
    notice: null,
    reservable: true,
    summary: null,
    supportTags: ['english'],
  },
  selectedPlaceError: null,
  selectedPlaceLoading: false,
  selectedPlaceRefetch: jest.fn(),
};

const navigation = {
  navigate: jest.fn(),
} as unknown as V2ScreenProps<'Map'>['navigation'];

async function renderMapScreen() {
  const i18n = await createTestI18n();
  return renderWithProviders(<MapScreen navigation={navigation} />, { i18n });
}

describe('MapScreen', () => {
  beforeEach(() => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: true,
      coordinate: { lat: 37.5, lng: 127 },
      refresh: jest.fn(),
      status: 'granted',
    });
    jest.mocked(useMapDiscovery).mockReturnValue(baseDiscovery);
    jest.mocked(navigation.navigate).mockClear();
  });

  test('검색어와 카테고리를 Hook 상태로 전달하고 서버 자동완성 장소를 선택한다', async () => {
    const { user } = await renderMapScreen();

    await user.type(screen.getByTestId('v2-map-search-input'), '카페');
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: '카페' }));
    expect(screen.getByText('서버 카페')).toBeVisible();

    await user.press(screen.getByText('음식'));
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'FOOD' }));

    await user.press(screen.getByText('서버 카페'));
    expect(useMapDiscovery).toHaveBeenLastCalledWith(expect.objectContaining({
      selectedPlace: { distanceMeters: 120, id: 17 },
    }));
    const selectedCard = screen.getByTestId('v2-selected-place');
    expect(selectedCard).toBeVisible();
    expect(within(selectedCard).getByText(/^120m/)).toBeVisible();
  });

  test('방문 검증 CTA가 명확한 route로 한 번만 이동한다', async () => {
    const { user } = await renderMapScreen();

    await user.press(screen.getByTestId('visit-verification-map-cta'));
    await user.press(screen.getByTestId('visit-verification-map-cta'));
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith(V2_ROUTES.VisitVerificationPlaces);
  });

  test('마커 재탭 또는 닫기 버튼으로 선택을 해제하고, 카드에서 실제 장소 식별자로 상세에 진입한다', async () => {
    const { user } = await renderMapScreen();

    await user.press(screen.getByTestId('mock-marker-place:17'));
    expect(screen.getByTestId('v2-selected-place')).toBeVisible();

    await user.press(screen.getByTestId('v2-selected-place-open'));
    expect(navigation.navigate).toHaveBeenCalledWith(V2_ROUTES.PlaceDetail, { placeId: 17 });

    await user.press(screen.getByTestId('v2-selected-place-reserve'));
    expect(navigation.navigate).toHaveBeenCalledWith(V2_ROUTES.CreateReservation, { placeId: 17 });

    await user.press(screen.getByTestId('v2-selected-place-dismiss'));
    expect(screen.queryByTestId('v2-selected-place')).toBeNull();

    await user.press(screen.getByTestId('mock-marker-place:17'));
    expect(screen.getByTestId('v2-selected-place')).toBeVisible();
    await user.press(screen.getByTestId('mock-marker-place:17'));
    expect(screen.queryByTestId('v2-selected-place')).toBeNull();
  });

  test('선택 장소가 새 지도 결과에서 사라지면 닫고, 빠른 탭의 이전 카드를 표시하지 않는다', async () => {
    const secondMarker = {
      category: 'food' as const,
      id: 'place:18',
      kind: 'place' as const,
      lat: 37.51,
      lng: 127.01,
      markerType: 'default' as const,
      name: '새 장소',
      placeId: 18,
    };
    let discoveryState: ReturnType<typeof useMapDiscovery> = {
      ...baseDiscovery,
      markers: [...baseDiscovery.markers, secondMarker],
    };
    jest.mocked(useMapDiscovery).mockImplementation(() => discoveryState);
    const rendered = await renderMapScreen();
    const { user } = rendered;

    await user.press(screen.getByTestId('mock-marker-place:17'));
    await user.press(screen.getByTestId('mock-marker-place:18'));

    const selectedCard = within(screen.getByTestId('v2-selected-place'));
    expect(selectedCard.queryByText('서버 카페')).toBeNull();

    discoveryState = { ...discoveryState, markers: [] };
    await act(async () => {
      rendered.rerender(<MapScreen navigation={navigation} />);
    });

    await waitFor(() => expect(screen.queryByTestId('v2-selected-place')).toBeNull());
  });

  test('API empty와 위치 권한 거부 상태를 함께 표시한다', async () => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: false,
      coordinate: null,
      refresh: jest.fn(),
      status: 'denied',
    });
    jest.mocked(useMapDiscovery).mockReturnValue({ ...baseDiscovery, isEmpty: true, markers: [] });

    await renderMapScreen();

    expect(screen.getByTestId('v2-location-denied')).toBeVisible();
    expect(screen.getByTestId('v2-map-empty')).toBeVisible();
    fireEvent.press(screen.getByTestId('v2-map-locate'));
  });

  test('장소 기능 비활성과 네트워크 오류를 서로 다른 상태로 표시한다', async () => {
    const rendered = await renderMapScreen();

    jest.mocked(useMapDiscovery).mockReturnValue({
      ...baseDiscovery,
      isDisabled: true,
      markers: [],
    });
    await act(async () => {
      rendered.rerender(<MapScreen navigation={navigation} />);
    });
    expect(screen.getByTestId('v2-map-disabled')).toBeVisible();

    jest.mocked(useMapDiscovery).mockReturnValue({
      ...baseDiscovery,
      isDisabled: false,
      markers: [],
      queryError: new Error('network unavailable'),
    });
    await act(async () => {
      rendered.rerender(<MapScreen navigation={navigation} />);
    });
    expect(screen.getByTestId('v2-map-error')).toBeVisible();
  });

  test('명시적으로 활성화한 mock marker는 서버 장소처럼 보이지 않게 표시한다', async () => {
    jest.mocked(useMapDiscovery).mockReturnValue({ ...baseDiscovery, dataSource: 'mock' });

    await renderMapScreen();

    expect(screen.getByTestId('v2-map-mock')).toBeVisible();
  });
});
