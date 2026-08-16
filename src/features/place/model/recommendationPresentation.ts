import type {
  ActivityIntent,
  RecommendationLimitReason,
  TravelPurpose,
} from './place.types';

const TRAVEL_PURPOSE_LABELS: Record<TravelPurpose, string> = {
  BEAUTY: '뷰티',
  CAFE: '카페',
  EXHIBITION: '전시',
  FASHION: '패션',
  FOOD: '맛집',
  K_POP: 'K-POP',
  NIGHTLIFE: '나이트라이프',
  OTHER: '기타',
  POP_UP: '팝업',
};

const ACTIVITY_INTENT_LABELS: Record<ActivityIntent, string> = {
  ATTEND_EVENT: '이벤트 참여',
  CAFE: '카페 방문',
  EAT: '식사',
  EXPLORE: '주변 탐색',
  NIGHTLIFE: '나이트라이프',
  SHOP: '쇼핑',
};

export type RecommendationState = 'empty' | 'error' | 'loading' | 'ready';

export function getRecommendationState({
  isError,
  isLoading,
  places,
}: {
  isError: boolean;
  isLoading: boolean;
  places: readonly unknown[];
}): RecommendationState {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return places.length > 0 ? 'ready' : 'empty';
}

export function createRecommendationPresentation({
  appliedActivityIntent,
  appliedTravelPurposes,
  limitReasons,
}: {
  appliedActivityIntent?: ActivityIntent | null;
  appliedTravelPurposes?: TravelPurpose[] | null;
  limitReasons?: RecommendationLimitReason[] | null;
}) {
  const contextParts = [
    ...(appliedTravelPurposes ?? []).map((purpose) => TRAVEL_PURPOSE_LABELS[purpose]),
    ...(appliedActivityIntent ? [ACTIVITY_INTENT_LABELS[appliedActivityIntent]] : []),
  ];
  const limitMessages = [...new Set(limitReasons ?? [])].flatMap((reason) => {
    switch (reason) {
      case 'REQUEST_LIMIT_CLAMPED':
        return ['서버 기준에 맞춰 추천 개수를 조정했어요.'];
      case 'RADIUS_EXPANDED':
        return ['추천 결과를 찾기 위해 검색 반경을 넓혔어요.'];
      case 'OPERATING_STATUS_PRIORITY':
        return ['현재 운영 중인 장소를 우선해 추천했어요.'];
      case 'INTERACTED_PLACE_EXCLUDED':
        return ['이미 확인한 장소를 제외해 추천했어요.'];
      case 'FALLBACK_CANDIDATE_POOL':
        return ['조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요.'];
    }
  });

  return {
    contextText: contextParts.length > 0 ? contextParts.join(' · ') : null,
    limitText: limitMessages.length > 0 ? limitMessages.join(' ') : null,
  };
}
