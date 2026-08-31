import { createFocusedRecommendationMarker } from '../recommendationMarkers';

const recommendation = {
  category: 'CAFE',
  id: 17,
  latitude: 37.5,
  longitude: 127,
};

describe('createFocusedRecommendationMarker', () => {
  test('선택되지 않은 추천 장소를 marker collection에 추가하지 않는다', () => {
    expect(createFocusedRecommendationMarker(null, new Set([17]), new Set())).toBeNull();
  });

  test('사용자가 선택한 추천 장소만 focus marker로 만든다', () => {
    expect(createFocusedRecommendationMarker(recommendation, new Set([17]), new Set())).toEqual({
      category: 'cafe',
      id: '17',
      lat: 37.5,
      lng: 127,
      markerType: 'default',
    });
  });

  test('viewport API marker와 중복되는 선택 추천은 추가하지 않는다', () => {
    expect(createFocusedRecommendationMarker(recommendation, new Set([17]), new Set(['17']))).toBeNull();
  });
});
