import type { RankedPlaceFeedStatus } from '../../home-feeds';

export type MapHomeCategory =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'heritage'
  | 'music'
  | 'popup';

export type MapHomePlacesState = RankedPlaceFeedStatus;
export type MapHomeDisplayState = MapHomePlacesState | 'category-empty';

type CategorizedPlace = {
  category: string;
};

const CATEGORY_ALIASES: Record<Exclude<MapHomeCategory, 'all'>, string[]> = {
  art: ['art', 'exhibit', 'exhibition', '전시'],
  beauty: ['beauty', '뷰티', '미용'],
  cafe: ['cafe', 'coffee', '카페', '커피'],
  etc: ['etc', 'other', '기타'],
  fashion: ['fashion', '패션'],
  food: ['dining', 'food', 'restaurant', '음식', '식당'],
  heritage: ['heritage', 'historic', 'ruin', '문화재', '유적'],
  music: ['music', '음악'],
  popup: ['pop-up', 'popup', '팝업'],
};

export function selectMapHomeCategoryResult<T extends CategorizedPlace>(
  places: T[],
  category: MapHomeCategory,
  sourceState: MapHomePlacesState,
): { places: T[]; state: MapHomeDisplayState } {
  if (sourceState !== 'ready') return { places: [], state: sourceState };
  if (places.length === 0) return { places: [], state: 'empty' };
  if (category === 'all') return { places, state: 'ready' };

  const categoryPlaces = places.filter((place) => {
    const value = place.category.trim().toLowerCase();
    return CATEGORY_ALIASES[category].some((alias) => value.includes(alias));
  });

  return {
    places: categoryPlaces,
    state: categoryPlaces.length > 0 ? 'ready' : 'category-empty',
  };
}
