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

export function createRecommendationPresentation({
  appliedActivityIntent,
  appliedRadiusKm,
  appliedTravelPurposes,
  limitReasons,
  requestedRadiusKm,
}: {
  appliedActivityIntent?: ActivityIntent | null;
  appliedRadiusKm?: number;
  appliedTravelPurposes?: TravelPurpose[];
  limitReasons?: RecommendationLimitReason[];
  requestedRadiusKm?: number;
}) {
  const contextParts = [
    ...(appliedTravelPurposes ?? []).map((purpose) => TRAVEL_PURPOSE_LABELS[purpose]),
    ...(appliedActivityIntent ? [ACTIVITY_INTENT_LABELS[appliedActivityIntent]] : []),
  ];
  const radiusExpanded = limitReasons?.includes('RADIUS_EXPANDED')
    && typeof appliedRadiusKm === 'number'
    && typeof requestedRadiusKm === 'number'
    && appliedRadiusKm > requestedRadiusKm;

  return {
    contextText: contextParts.length > 0 ? contextParts.join(' · ') : null,
    limitText: radiusExpanded
      ? `추천 결과를 찾기 위해 반경을 ${appliedRadiusKm}km로 넓혔어요.`
      : null,
  };
}
