import type { PlaceExplorationSchema } from './placeExplorationContract';

export const REASON_CODES = {
  kind: 'FRIENDLY', easyToFind: 'EASY_TO_FIND', delicious: 'GOOD_FOOD',
  multilingual: 'MULTILINGUAL_SUPPORT', parking: 'PARKING', photoSpot: 'PHOTO_SPOT', clean: 'CLEAN',
} as const satisfies Record<string, NonNullable<PlaceExplorationSchema<'PlaceReviewCreateRequest'>['recommendReasons']>[number]>;

export function reviewReasonTranslationKey(code: string): string | undefined {
  const entry = Object.entries(REASON_CODES).find(([, value]) => value === code);
  return entry ? `visitVerification.reasons.${entry[0]}` : undefined;
}
