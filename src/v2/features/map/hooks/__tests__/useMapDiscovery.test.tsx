import { renderHook } from '@testing-library/react-native';
import React from 'react';

import {
  usePlaceAutocomplete,
  usePlaceCard,
  usePlaceList,
  usePlaceMap,
  usePlaceOperatingNotices,
  usePlaceVisitDecision,
} from '../../../place-exploration';
import { useMapDiscovery } from '../useMapDiscovery';

jest.mock('../../../place-exploration', () => ({
  usePlaceAutocomplete: jest.fn(),
  usePlaceCard: jest.fn(),
  usePlaceList: jest.fn(),
  usePlaceMap: jest.fn(),
  usePlaceOperatingNotices: jest.fn(),
  usePlaceVisitDecision: jest.fn(),
}));

const query = (data: unknown) => ({
  data,
  error: null,
  isFetching: false,
  isLoading: false,
  isSuccess: true,
  refetch: jest.fn(),
}) as never;

const card = {
  address: '서울 테스트로 17',
  category: 'CAFE',
  currentlyOperating: true,
  id: 17,
  imageUrl: 'https://cdn.example.test/places/17.jpg',
  name: '서버 카페',
  roadAddress: null,
  touristSummary: null,
};

describe('useMapDiscovery', () => {
  beforeEach(() => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue(query({ places: [] }));
    jest.mocked(usePlaceCard).mockReturnValue(query(card));
    jest.mocked(usePlaceList).mockReturnValue(query({ places: [] }));
    jest.mocked(usePlaceMap).mockReturnValue(query({
      clusters: [],
      markers: [{
        category: 'CAFE',
        latitude: 37.5,
        longitude: 127,
        name: '서버 카페',
        placeId: 17,
      }],
    }));
    jest.mocked(usePlaceOperatingNotices).mockReturnValue(query({
      checkedAt: '2026-08-20T00:00:00Z',
      currentlyOperating: true,
      notices: [],
      placeId: 17,
    }));
    jest.mocked(usePlaceVisitDecision).mockReturnValue(query(undefined));
  });

  test('선택한 장소의 서버 카드와 검색 응답 거리를 하나의 ViewModel로 연결한다', async () => {
    const { result } = await renderHook(() => useMapDiscovery({
      category: null,
      center: { lat: 37.5, lng: 127 },
      keyword: '',
      radiusKm: 3,
      selectedPlace: { distanceMeters: 120, id: 17 },
    }));

    expect(result.current.selectedPlace).toMatchObject({
      distanceMeters: 120,
      id: 17,
      imageUrl: 'https://cdn.example.test/places/17.jpg',
      name: '서버 카페',
    });
  });

  test('다른 장소를 선택한 뒤 도착한 이전 카드 응답은 노출하지 않는다', async () => {
    const { result } = await renderHook(() => useMapDiscovery({
      category: null,
      center: { lat: 37.5, lng: 127 },
      keyword: '',
      radiusKm: 3,
      selectedPlace: { distanceMeters: null, id: 18 },
    }));

    expect(result.current.selectedPlace).toBeNull();
  });
});
