import type { PlaceExplorationSchema } from './placeExplorationContract';

export const REASON_CODES = {
  kind: 'FRIENDLY', easyToFind: 'EASY_TO_FIND', delicious: 'GOOD_FOOD',
  multilingual: 'MULTILINGUAL_SUPPORT', parking: 'PARKING', photoSpot: 'PHOTO_SPOT', clean: 'CLEAN',
} as const satisfies Record<string, NonNullable<PlaceExplorationSchema<'PlaceReviewCreateRequest'>['recommendReasons']>[number]>;

export type ReviewReasonKey = keyof typeof REASON_CODES;

const REASON_KEY_BY_CODE = new Map<string, ReviewReasonKey>(
  (Object.keys(REASON_CODES) as ReviewReasonKey[]).map((key) => [REASON_CODES[key], key]),
);

export function reviewReasonLabelKey(reason: ReviewReasonKey): string {
  return `visitVerification.reasons.${reason}`;
}

/**
 * Server reason codes -> known reasons, in server order. Missing/null/empty input gives `[]`,
 * duplicates collapse to the first occurrence, and unknown codes are dropped (never shown).
 */
export function normalizeReviewReasons(codes: readonly string[] | null | undefined): ReviewReasonKey[] {
  if (!Array.isArray(codes)) return [];
  const reasons: ReviewReasonKey[] = [];
  for (const code of codes) {
    const reason = REASON_KEY_BY_CODE.get(code);
    if (!reason) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[review-reasons] Ignoring unknown reason code: ${String(code)}`);
      continue;
    }
    if (!reasons.includes(reason)) reasons.push(reason);
  }
  return reasons;
}

/** `recommendReasons` is the contract; the deprecated single `recommendReason` counts only when it is a known code. */
export function reviewReasonsFromResponse(review: {
  recommendReason?: string | null;
  recommendReasons?: readonly string[] | null;
}): ReviewReasonKey[] {
  if (review.recommendReasons != null) return normalizeReviewReasons(review.recommendReasons);
  const legacy = review.recommendReason ? REASON_KEY_BY_CODE.get(review.recommendReason) : undefined;
  return legacy ? [legacy] : [];
}
