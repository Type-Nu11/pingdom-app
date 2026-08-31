import { normalizePlaceCategory } from '../placeCategory';

describe('normalizePlaceCategory', () => {
  it('카페와 음식점을 서로 다른 마커 카테고리로 유지한다', () => {
    expect(normalizePlaceCategory('CAFE')).toBe('cafe');
    expect(normalizePlaceCategory('FOOD')).toBe('food');
    expect(normalizePlaceCategory('restaurant')).toBe('food');
  });

  it('문화재 서버 별칭을 문화재 마커로 정규화한다', () => {
    expect(normalizePlaceCategory('HERITAGE')).toBe('heritage');
    expect(normalizePlaceCategory('CULTURAL_HERITAGE')).toBe('heritage');
    expect(normalizePlaceCategory('문화재')).toBe('heritage');
  });

  it('알 수 없는 카테고리는 음식점이 아닌 기타로 처리한다', () => {
    expect(normalizePlaceCategory('NEW_CATEGORY')).toBe('etc');
  });
});
