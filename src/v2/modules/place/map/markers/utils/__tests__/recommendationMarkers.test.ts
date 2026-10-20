import { createFocusedPlaceMarker } from '../recommendationMarkers';

const recommendation = {
  category: 'CAFE',
  id: 17,
  latitude: 37.5,
  longitude: 127,
};

describe('createFocusedPlaceMarker', () => {
  test('선택되지 않은 추천 장소를 marker collection에 추가하지 않는다', () => {
    expect(createFocusedPlaceMarker(null, new Set())).toBeNull();
  });

  test('사용자가 선택한 추천 장소만 focus marker로 만든다', () => {
    expect(createFocusedPlaceMarker(recommendation, new Set())).toEqual({
      category: 'cafe',
      id: '17',
      lat: 37.5,
      lng: 127,
      markerType: 'default',
    });
  });

  test('viewport API marker와 중복되는 선택 추천은 추가하지 않는다', () => {
    expect(createFocusedPlaceMarker(recommendation, new Set(['17']))).toBeNull();
  });

  test('즐겨찾기에서 선택한 장소도 추천 목록 없이 focus marker로 표시한다', () => {
    expect(createFocusedPlaceMarker(recommendation, new Set())).toEqual({
      category: 'cafe', id: '17', lat: 37.5, lng: 127, markerType: 'default',
    });
  });
});
