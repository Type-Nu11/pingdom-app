import type {
  PlaceRankingCriteria,
  PlaceRankingImageSource,
  PlaceRankingItem,
  PlaceRankingPeriod,
} from './placeRanking.types';

const CRITERIA: PlaceRankingCriteria[] = [
  'POST_LIKE_COUNT',
  'POST_COUNT',
  'CHECK_IN_COUNT',
  'COMPOSITE',
];
const PERIODS: PlaceRankingPeriod[] = ['DAY', 'WEEK', 'MONTH'];
const IMAGE_SOURCES: PlaceRankingImageSource[] = ['POST', 'PLACE_EXPLORATION_MEDIA', 'NONE'];

export const normalizePlaceRankingCriteria = (
  value: string | null | undefined
): PlaceRankingCriteria | null => (
  CRITERIA.includes(value as PlaceRankingCriteria) ? (value as PlaceRankingCriteria) : null
);

export const normalizePlaceRankingPeriod = (
  value: string | null | undefined
): PlaceRankingPeriod | null => (
  PERIODS.includes(value as PlaceRankingPeriod) ? (value as PlaceRankingPeriod) : null
);

export const normalizePlaceRankingImageSource = (
  value: string | null | undefined
): PlaceRankingImageSource => (
  IMAGE_SOURCES.includes(value as PlaceRankingImageSource)
    ? (value as PlaceRankingImageSource)
    : 'NONE'
);

export type PlaceRankingImage = {
  source: PlaceRankingImageSource;
  url: string | null;
};

// 카드 이미지는 서버가 알려준 출처를 그대로 따르고, 클라이언트가 다른 source를 추정하지 않는다.
export const resolvePlaceRankingImage = (item: PlaceRankingItem): PlaceRankingImage => {
  const source = normalizePlaceRankingImageSource(item.imageSource);

  if (source === 'NONE') {
    return { source, url: null };
  }

  return { source, url: item.thumbnailUrl ?? item.imageUrl ?? null };
};
