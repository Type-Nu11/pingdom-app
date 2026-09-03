import { selectMapExplorationPlaceIds } from '../mapExplorationPlaceIds';

const places = Array.from({ length: 20 }, (_, index) => ({ id: index + 1 }));
const recommendations = Array.from({ length: 20 }, (_, index) => ({ id: index + 101 }));

describe('selectMapExplorationPlaceIds', () => {
  test('medium 패널에서는 양쪽 feed에서 실제 노출 가능한 앞뒤 6개만 조회한다', () => {
    expect(selectMapExplorationPlaceIds({
      expanded: false,
      places,
      recommendationPlaces: recommendations,
      recommendationsActive: false,
    })).toEqual([1, 2, 3, 4, 5, 6, 15, 16, 17, 18, 19, 20]);
  });

  test('확장 패널은 hook 상한까지 조회하되 장소 미리보기는 선택 장소만 조회한다', () => {
    expect(selectMapExplorationPlaceIds({
      expanded: true,
      places,
      recommendationPlaces: recommendations,
      recommendationsActive: true,
    })).toEqual(recommendations.map((place) => place.id));
    expect(selectMapExplorationPlaceIds({
      expanded: false,
      places,
      recommendationPlaces: recommendations,
      recommendationsActive: false,
      selectedPlaceId: 102,
    })).toEqual([102]);
  });
});
