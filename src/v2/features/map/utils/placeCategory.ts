import type { PlaceCategory } from '../model/place.types';

export const DEFAULT_PLACE_CATEGORY: PlaceCategory = 'etc';

const PLACE_CATEGORY_ALIASES: Record<string, PlaceCategory> = {
  art: 'art',
  beauty: 'beauty',
  cafe: 'cafe',
  'cultural heritage': 'heritage',
  cultural_asset: 'heritage',
  cultural_heritage: 'heritage',
  cultural_property: 'heritage',
  etc: 'etc',
  exhibition: 'art',
  fashion: 'fashion',
  feshion: 'fashion',
  food: 'food',
  game: 'game',
  heritage: 'heritage',
  historic: 'heritage',
  historic_site: 'heritage',
  historical: 'heritage',
  historical_site: 'heritage',
  k_pop: 'music',
  music: 'music',
  other: 'etc',
  pop_up: 'popup',
  popup: 'popup',
  restaurant: 'food',
  ruin: 'heritage',
  ruins: 'heritage',
  showing: 'art',
  기타: 'etc',
  문화재: 'heritage',
  뷰티: 'beauty',
  유적: 'heritage',
  음식점: 'food',
  전시: 'art',
  카페: 'cafe',
  팝업: 'popup',
  패션: 'fashion',
  음식: 'food',
  게임: 'game',
  음악: 'music',
};

export function normalizePlaceCategory(category: string | null | undefined): PlaceCategory {
  const normalized = category?.trim().toLowerCase();

  if (!normalized) {
    return DEFAULT_PLACE_CATEGORY;
  }

  return PLACE_CATEGORY_ALIASES[normalized] ?? DEFAULT_PLACE_CATEGORY;
}
