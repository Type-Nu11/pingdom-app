import { createFocusedRecommendationMarker, withRecommendationFallbackMarkers } from '../recommendationMarkers';

const recommendation = {
  category: 'CAFE',
  id: 17,
  latitude: 37.5,
  longitude: 127,
};

describe('withRecommendationFallbackMarkers', () => {
  test('성공한 빈 목록에는 추천 마커를 추가하지 않는다', () => {
    expect(withRecommendationFallbackMarkers([], [recommendation], false)).toEqual([]);
  });

  test('목록 실패 시 실제 추천 좌표를 표시하고 중복을 제거한다', () => {
    const markers = withRecommendationFallbackMarkers([], [recommendation, recommendation], true);
    expect(markers).toEqual([{ id: '17', category: 'cafe', lat: 37.5, lng: 127, markerType: 'default' }]);
    expect(withRecommendationFallbackMarkers(markers, [recommendation], true)).toEqual(markers);
  });

  test('잘못된 추천 좌표는 표시하지 않는다', () => {
    expect(withRecommendationFallbackMarkers([], [
      { ...recommendation, latitude: NaN },
      { ...recommendation, latitude: 91 },
      { ...recommendation, longitude: 181 },
    ], true)).toEqual([]);
  });
});

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
