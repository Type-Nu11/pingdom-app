import type { Coordinate, MapMarker } from './map.types';

export const FALLBACK_COORDINATE: Coordinate = {
  lat: 37.402001,
  lng: 127.108678,
};

export function createTestPlaceMarkers(origin: Coordinate): MapMarker[] {
  return [
    {
      id: 'v2-test-cafe',
      name: '테스트 카페',
      category: 'food',
      lat: origin.lat + 0.0018,
      lng: origin.lng - 0.0012,
      markerType: 'hot',
    },
    {
      id: 'v2-test-popup',
      name: '테스트 팝업',
      category: 'fashion',
      lat: origin.lat - 0.0011,
      lng: origin.lng + 0.0019,
      markerType: 'default',
    },
  ];
}
