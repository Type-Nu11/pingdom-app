import type {
  ActivityIntent,
  RecommendationLimitReason,
  TravelPurpose,
} from './place.types';

const TRAVEL_PURPOSE_KEYS: Record<TravelPurpose, string> = {
  BEAUTY: 'map.recommendations.context.purpose.beauty', CAFE: 'map.recommendations.context.purpose.cafe',
  EXHIBITION: 'map.recommendations.context.purpose.exhibition', FASHION: 'map.recommendations.context.purpose.fashion',
  FOOD: 'map.recommendations.context.purpose.food', K_POP: 'map.recommendations.context.purpose.kPop',
  NIGHTLIFE: 'map.recommendations.context.purpose.nightlife', OTHER: 'map.recommendations.context.purpose.other',
  POP_UP: 'map.recommendations.context.purpose.popUp',
};

const ACTIVITY_INTENT_KEYS: Record<ActivityIntent, string> = {
  ATTEND_EVENT: 'map.recommendations.context.activity.attendEvent', CAFE: 'map.recommendations.context.activity.cafe',
  EAT: 'map.recommendations.context.activity.eat', EXPLORE: 'map.recommendations.context.activity.explore',
  NIGHTLIFE: 'map.recommendations.context.activity.nightlife', SHOP: 'map.recommendations.context.activity.shop',
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
}, translate: (key: string) => string) {
  const contextParts = [
    ...(appliedTravelPurposes ?? []).map((purpose) => translate(TRAVEL_PURPOSE_KEYS[purpose])),
    ...(appliedActivityIntent ? [translate(ACTIVITY_INTENT_KEYS[appliedActivityIntent])] : []),
  ];
  const limitMessages = [...new Set(limitReasons ?? [])].flatMap((reason) => {
    switch (reason) {
      case 'REQUEST_LIMIT_CLAMPED':
        return [translate('map.recommendations.limits.requestClamped')];
      case 'RADIUS_EXPANDED':
        return [translate('map.recommendations.limits.radiusExpanded')];
      case 'OPERATING_STATUS_PRIORITY':
        return [translate('map.recommendations.limits.operatingPriority')];
      case 'INTERACTED_PLACE_EXCLUDED':
        return [translate('map.recommendations.limits.interactedExcluded')];
      case 'FALLBACK_CANDIDATE_POOL':
        return [translate('map.recommendations.limits.candidatePool')];
    }
  });

  return {
    contextText: contextParts.length > 0 ? contextParts.join(' · ') : null,
    limitText: limitMessages.length > 0 ? limitMessages.join(' ') : null,
  };
}
