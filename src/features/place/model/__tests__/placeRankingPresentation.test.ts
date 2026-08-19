import type { PlaceRankingItem } from '../placeRanking.types';
import {
  getPlaceRankingState,
  toRankingDecisionPlaces,
  toRankingImageUrls,
} from '../placeRankingPresentation';

const localItem: PlaceRankingItem = {
  category: 'cafe',
  distanceMeters: 320,
  imageSource: 'POST',
  imageUrl: 'https://cdn.example.com/a.jpg',
  latitude: 37.54,
  longitude: 127.05,
  placeId: 11,
  placeName: '성수 카페',
  rank: 1,
  score: 42,
  thumbnailUrl: 'https://cdn.example.com/a-thumb.jpg',
};

describe('toRankingDecisionPlaces', () => {
  test('랭킹 항목을 카드 모델로 옮기고 순위를 유지한다', () => {
    expect(toRankingDecisionPlaces([localItem])[0]).toEqual({
      address: '',
      category: 'CAFE',
      distance: '',
      distanceMeters: 320,
      id: 11,
      latitude: 37.54,
      longitude: 127.05,
      name: '성수 카페',
      recommendationRank: 1,
      tags: [],
      verifiedAgo: '',
      wait: '',
    });
  });

  test('전국 항목처럼 거리·카테고리가 없으면 추정하지 않는다', () => {
    const [place] = toRankingDecisionPlaces([{
      imageSource: 'NONE',
      latitude: 35.1,
      longitude: 129.0,
      placeId: 22,
      placeName: '해운대 팝업',
    }]);

    expect(place.distanceMeters).toBeUndefined();
    expect(place.category).toBe('');
    expect(place.address).toBe('');
    expect(place.tags).toEqual([]);
  });
});

describe('toRankingImageUrls', () => {
  test('썸네일 우선으로 placeId별 이미지 맵을 만든다', () => {
    expect(toRankingImageUrls([localItem])).toEqual({
      '11': 'https://cdn.example.com/a-thumb.jpg',
    });
  });

  test('이미지 출처가 없으면 항목을 넣지 않는다', () => {
    expect(toRankingImageUrls([{ imageSource: 'NONE', imageUrl: 'https://x', placeId: 22 }]))
      .toEqual({});
  });
});

describe('getPlaceRankingState', () => {
  test('loading, error, empty, ready 순으로 상태를 정한다', () => {
    expect(getPlaceRankingState({ isEmpty: false, isError: false, isLoading: true })).toBe('loading');
    expect(getPlaceRankingState({ isEmpty: false, isError: true, isLoading: false })).toBe('error');
    expect(getPlaceRankingState({ isEmpty: true, isError: false, isLoading: false })).toBe('empty');
    expect(getPlaceRankingState({ isEmpty: false, isError: false, isLoading: false })).toBe('ready');
  });
});
