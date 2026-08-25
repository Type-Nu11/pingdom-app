import { renderHook } from '@testing-library/react-native';
import React from 'react';

import {
  usePlaceAutocomplete,
  usePlaceCard,
  usePlaceList,
  usePlaceMap,
  usePlaceOperatingNotices,
  usePlaceVerificationMedia,
  usePlaceVisitDecision,
} from '../../../place-exploration';
import { usePlaceDetail } from '../../../place-detail/hooks/usePlaceDetail';
import { useMapDiscovery } from '../useMapDiscovery';

jest.mock('../../../place-exploration', () => ({
  usePlaceAutocomplete: jest.fn(),
  usePlaceCard: jest.fn(),
  usePlaceList: jest.fn(),
  usePlaceMap: jest.fn(),
  usePlaceOperatingNotices: jest.fn(),
  usePlaceVerificationMedia: jest.fn(),
  usePlaceVisitDecision: jest.fn(),
}));

jest.mock('../../../place-detail/hooks/usePlaceDetail', () => ({
  usePlaceDetail: jest.fn(),
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
    jest.mocked(usePlaceVerificationMedia).mockReturnValue(query(undefined));
    jest.mocked(usePlaceVisitDecision).mockReturnValue(query(undefined));
    jest.mocked(usePlaceDetail).mockReturnValue(query(undefined));
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

  test('필터가 없으면 지도 endpoint, 필터가 있으면 GET /places 목록을 활성화한다', async () => {
    const renderDiscovery = (category: string | null) => renderHook(() => useMapDiscovery({
      category,
      center: { lat: 37.5, lng: 127 },
      keyword: '',
      radiusKm: 3,
      selectedPlace: null,
    }));

    await renderDiscovery(null);

    expect(usePlaceMap).toHaveBeenLastCalledWith(expect.any(Object), { enabled: true });
    expect(usePlaceList).toHaveBeenLastCalledWith(expect.any(Object), { enabled: false });

    await renderDiscovery('FOOD');

    expect(usePlaceMap).toHaveBeenLastCalledWith(expect.any(Object), { enabled: false });
    expect(usePlaceList).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'FOOD' }),
      { enabled: true },
    );
  });
});
