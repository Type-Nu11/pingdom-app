import type { PlaceCategory } from '../model/place.types';

export const DEFAULT_PLACE_CATEGORY: PlaceCategory = 'food';

const PLACE_CATEGORY_ALIASES: Record<string, PlaceCategory> = {
  fashion: 'fashion',
  feshion: 'fashion',
  food: 'food',
  game: 'game',
  music: 'music',
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
