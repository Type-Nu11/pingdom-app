import {
  normalizePlaceRankingCriteria,
  normalizePlaceRankingImageSource,
  normalizePlaceRankingPeriod,
  resolvePlaceRankingImage,
} from '../placeRanking';
import type { PlaceRankingItem } from '../placeRanking.types';

const item: PlaceRankingItem = {
  imageSource: 'POST',
  imageUrl: 'https://cdn.example.com/a.jpg',
  latitude: 37.54,
  longitude: 127.05,
  placeId: 11,
  placeName: '첫 장소',
  rank: 1,
  score: 12.5,
  thumbnailUrl: 'https://cdn.example.com/a-thumb.jpg',
};

describe('알 수 없는 enum 처리', () => {
  test('계약에 없는 criteria는 null로 처리한다', () => {
    expect(normalizePlaceRankingCriteria('POST_LIKE_COUNT')).toBe('POST_LIKE_COUNT');
    expect(normalizePlaceRankingCriteria('SOMETHING_NEW')).toBeNull();
    expect(normalizePlaceRankingCriteria(undefined)).toBeNull();
  });

  test('계약에 없는 period는 null로 처리한다', () => {
    expect(normalizePlaceRankingPeriod('WEEK')).toBe('WEEK');
    expect(normalizePlaceRankingPeriod('QUARTER')).toBeNull();
  });

  test('계약에 없는 imageSource는 NONE으로 처리한다', () => {
    expect(normalizePlaceRankingImageSource('PLACE_EXPLORATION_MEDIA')).toBe('PLACE_EXPLORATION_MEDIA');
    expect(normalizePlaceRankingImageSource('BANNER')).toBe('NONE');
  });
});

describe('resolvePlaceRankingImage', () => {
  test('썸네일을 우선 사용하고 출처를 함께 돌려준다', () => {
    expect(resolvePlaceRankingImage(item)).toEqual({
      source: 'POST',
      url: 'https://cdn.example.com/a-thumb.jpg',
    });
  });

  test('썸네일이 없으면 원본 이미지를 사용한다', () => {
    expect(resolvePlaceRankingImage({ ...item, thumbnailUrl: null })).toEqual({
      source: 'POST',
      url: 'https://cdn.example.com/a.jpg',
    });
  });

  test('출처가 NONE이면 이미지 URL을 사용하지 않는다', () => {
    expect(resolvePlaceRankingImage({ ...item, imageSource: 'NONE' })).toEqual({
      source: 'NONE',
      url: null,
    });
  });

  test('알 수 없는 출처는 이미지 없이 처리한다', () => {
    expect(resolvePlaceRankingImage({ ...item, imageSource: 'BANNER' as never })).toEqual({
      source: 'NONE',
      url: null,
    });
  });
});
