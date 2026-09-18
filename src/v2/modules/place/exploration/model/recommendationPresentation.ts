import type {
  ActivityIntent,
  RecommendationLimitReason,
  TravelPurpose,
} from '../../core/place.types';
import type { PlaceExplorationSchema } from '../../../../shared/api';

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

type RecommendationExplanationItem =
  PlaceExplorationSchema<'PlaceRecommendationExplanationItem'>;
type RecommendationExplanation =
  PlaceExplorationSchema<'PlaceRecommendationExplanationResponse'>;

const REASON_CODE_KEYS = {
  ACTIVE_BENEFIT: 'map.recommendations.reasons.activeBenefit',
  BENEFIT_AND_RESERVABLE: 'map.recommendations.reasons.benefitAndReservable',
  CONTEXT_MATCH: 'map.recommendations.reasons.contextMatch',
  EXPLORATION: 'map.recommendations.reasons.exploration',
  FRESH_CONTENT: 'map.recommendations.reasons.freshContent',
  HIGH_CONVERSION: 'map.recommendations.reasons.highConversion',
  HIGH_ENGAGEMENT: 'map.recommendations.reasons.highEngagement',
  NEARBY: 'map.recommendations.reasons.nearby',
  PERSONAL_SIGNAL: 'map.recommendations.reasons.personalSignal',
  QUALITY_SIGNAL: 'map.recommendations.reasons.qualitySignal',
  RESERVABLE: 'map.recommendations.reasons.reservable',
} as const satisfies Record<
  NonNullable<PlaceExplorationSchema<'PlaceRecommendationItem'>['reasonCode']>,
  string
>;

const EXPLANATION_SOURCE_KEYS = {
  FALLBACK: 'map.recommendations.explanations.fallback',
  FRESH: 'map.recommendations.explanations.fresh',
  GEO: 'map.recommendations.explanations.geo',
  PERSONAL: 'map.recommendations.explanations.personal',
  POPULAR: 'map.recommendations.explanations.popular',
} as const satisfies Record<NonNullable<RecommendationExplanationItem['source']>, string>;

export type RecommendationReasonInput = {
  explanation?: RecommendationExplanationItem | null;
  placeId: number;
  reason?: string | null;
  reasonCode?: string | null;
};

export type RecommendationReasonPresentation = {
  source: 'explanation' | 'hidden' | 'neutral' | 'reason-code' | 'server-reason';
  text: string | null;
};

type Translate = (key: string) => string;

function hasOwnKey<RecordType extends object>(
  record: RecordType,
  key: PropertyKey,
): key is keyof RecordType {
  return Object.prototype.hasOwnProperty.call(record, key);
}

export function selectRecommendationReason(
  input: RecommendationReasonInput,
  translate: Translate,
): RecommendationReasonPresentation {
  const reasonCode = input.reasonCode?.trim();
  if (reasonCode && hasOwnKey(REASON_CODE_KEYS, reasonCode)) {
    return { source: 'reason-code', text: translate(REASON_CODE_KEYS[reasonCode]) };
  }

  const serverReason = input.reason?.trim();
  if (serverReason) return { source: 'server-reason', text: serverReason };

  // A response entry must identify this exact place; ranking and array order are never join keys.
  const explanationSource = input.explanation?.placeId === input.placeId
    ? input.explanation.source?.trim()
    : undefined;
  if (explanationSource && hasOwnKey(EXPLANATION_SOURCE_KEYS, explanationSource)) {
    return {
      source: 'explanation',
      text: translate(EXPLANATION_SOURCE_KEYS[explanationSource]),
    };
  }

  return { source: 'neutral', text: translate('map.recommendations.reasons.neutral') };
}

export function selectRecommendationExplanationsByPlaceId(
  requestId: string,
  explanation?: RecommendationExplanation | null,
): ReadonlyMap<number, RecommendationExplanationItem> {
  const byPlaceId = new Map<number, RecommendationExplanationItem>();

  // TanStack Query keeps old cache entries, so the payload must also prove it belongs to this list.
  if (!requestId || explanation?.requestId !== requestId) return byPlaceId;

  for (const item of explanation.items ?? []) {
    if (typeof item.placeId === 'number' && Number.isFinite(item.placeId)) {
      byPlaceId.set(item.placeId, item);
    }
  }

  return byPlaceId;
}

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
