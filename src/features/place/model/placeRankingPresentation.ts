import type { DecisionPlace } from '../components/MapBottomSheet';
import { resolvePlaceRankingImage } from './placeRanking';
import type { PlaceRankingItem } from './placeRanking.types';

export type PlaceRankingState = 'empty' | 'error' | 'loading' | 'ready';

// 서버가 주지 않는 주소·대기시간·검증 시각은 추정하지 않고 빈 값으로 둔다.
export const toRankingDecisionPlace = (item: PlaceRankingItem): DecisionPlace => ({
  address: '',
  category: (item.category ?? '').toUpperCase(),
  distance: '',
  ...(typeof item.distanceMeters === 'number' ? { distanceMeters: item.distanceMeters } : {}),
  id: item.placeId,
  latitude: item.latitude ?? 0,
  longitude: item.longitude ?? 0,
  name: item.placeName ?? '',
  ...(typeof item.rank === 'number' ? { recommendationRank: item.rank } : {}),
  tags: [],
  verifiedAgo: '',
  wait: '',
});

export const toRankingDecisionPlaces = (items: PlaceRankingItem[]): DecisionPlace[] => (
  items
    .filter((item) => typeof item.placeId === 'number')
    .map(toRankingDecisionPlace)
);

export const toRankingImageUrls = (items: PlaceRankingItem[]): Record<string, string> => {
  const urls: Record<string, string> = {};

  for (const item of items) {
    const { url } = resolvePlaceRankingImage(item);

    if (url) {
      urls[String(item.placeId)] = url;
    }
  }

  return urls;
};

export const getPlaceRankingState = ({
  isEmpty,
  isError,
  isLoading,
}: {
  isEmpty: boolean;
  isError: boolean;
  isLoading: boolean;
}): PlaceRankingState => {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return isEmpty ? 'empty' : 'ready';
};
