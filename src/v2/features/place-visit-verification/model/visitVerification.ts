export const MAX_PHOTOS = 3;
export const MAX_REASONS = 5;
export const MAX_REVIEW_LENGTH = 2_000;

export const RECOMMEND_REASONS = [
  'kind',
  'easyToFind',
  'delicious',
  'multilingual',
  'parking',
  'photoSpot',
  'clean',
] as const;

export type RecommendReason = (typeof RECOMMEND_REASONS)[number];

export type SelectedPhoto = {
  fileName?: string | null;
  height: number;
  mimeType?: string | null;
  uri: string;
  width: number;
};

export type ReviewValidation =
  | 'content-required'
  | 'content-too-long'
  | 'photo-upload-contract-missing'
  | 'reason-required'
  | 'multiple-reasons-contract-missing'
  | null;

export function uniquePlaceIdsInServerOrder(
  checkIns: readonly { placeId: number }[],
): number[] {
  return [...new Set(checkIns.map((checkIn) => checkIn.placeId))];
}

export function selectCandidateImageUrls(
  cardImageUrl: string | null,
  media: readonly { displayOrder: number; imageUrl: string; thumbnailUrl: string | null }[],
) {
  const orderedMedia = [...media]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .flatMap((item) => [item.thumbnailUrl, item.imageUrl])
    .filter((value): value is string => Boolean(value));
  return [...new Set([cardImageUrl, ...orderedMedia].filter(
    (value): value is string => Boolean(value),
  ))].slice(0, 2);
}

export function toggleReason(
  selected: readonly RecommendReason[],
  reason: RecommendReason,
): RecommendReason[] {
  if (selected.includes(reason)) return selected.filter((value) => value !== reason);
  if (selected.length >= MAX_REASONS) return [...selected];
  return [...selected, reason];
}

export function appendPhotos(
  selected: readonly SelectedPhoto[],
  incoming: readonly SelectedPhoto[],
): SelectedPhoto[] {
  const seen = new Set(selected.map((photo) => photo.uri));
  const result = [...selected];
  for (const photo of incoming) {
    if (result.length >= MAX_PHOTOS) break;
    if (!seen.has(photo.uri)) {
      result.push(photo);
      seen.add(photo.uri);
    }
  }
  return result;
}

export function validateReviewDraft({
  content,
  photoCount,
  reasons,
}: {
  content: string;
  photoCount: number;
  reasons: readonly RecommendReason[];
}): ReviewValidation {
  if (!content.trim()) return 'content-required';
  if (content.length > MAX_REVIEW_LENGTH) return 'content-too-long';
  if (reasons.length === 0) return 'reason-required';
  if (reasons.length > 1) return 'multiple-reasons-contract-missing';
  if (photoCount > 0) return 'photo-upload-contract-missing';
  return null;
}
