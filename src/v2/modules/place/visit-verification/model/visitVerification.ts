import { REASON_CODES } from '../../../../shared/api/reviewReasons';
import { ApiError } from '../../../../shared/api/ApiError';

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
  | 'reason-required'
  | null;

export function serializeRecommendReasons(reasons: readonly RecommendReason[]) {
  const unique = [...new Set(reasons)];
  if (!unique.length || unique.length > MAX_REASONS || unique.some(reason => !Object.hasOwn(REASON_CODES, reason))) {
    throw new ApiError('Invalid recommendation reasons', { code: 'INVALID_REVIEW_DRAFT' });
  }
  return unique.map(reason => REASON_CODES[reason]);
}

export function reviewPhotoPart(photo: SelectedPhoto) {
  const mime = photo.mimeType?.trim().toLowerCase();
  const extension = (photo.fileName || photo.uri.split(/[?#]/)[0]).split('.').pop()?.toLowerCase();
  const type = mime === 'image/jpg' || mime === 'image/pjpeg' ? 'image/jpeg'
    : mime || (extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : extension === 'png' ? 'image/png' : undefined);
  if ((type !== 'image/jpeg' && type !== 'image/png') || !photo.uri.trim()) {
    throw new ApiError('Unsupported review photo', { code: 'UNSUPPORTED_REVIEW_PHOTO', status: 415 });
  }
  const safeName = photo.fileName?.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  return { uri: photo.uri, type, name: safeName && /\.(jpe?g|png)$/i.test(safeName) ? safeName : `review-photo.${type === 'image/png' ? 'png' : 'jpg'}` };
}

export function reviewSubmissionErrorKey(error: unknown) {
  const status = error instanceof ApiError ? error.status : undefined;
  if (status === 415) return 'unsupportedFormat';
  if (status === 413) return 'fileTooLarge';
  if (status === 401) return 'unauthenticated';
  if (status === 403) return 'forbidden';
  if (status === 503 || (status && status >= 500)) return 'serverUnavailable';
  if (error instanceof ApiError && error.isNetworkError) return 'network';
  return 'submitFailed';
}

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
  reasons,
}: {
  content: string;
  reasons: readonly RecommendReason[];
}): ReviewValidation {
  if (!content.trim()) return 'content-required';
  if (content.length > MAX_REVIEW_LENGTH) return 'content-too-long';
  if (reasons.length === 0) return 'reason-required';
  return null;
}

export function assertReviewSubmissionDraft(draft: {
  content: string;
  reasons: readonly RecommendReason[];
  photos: readonly SelectedPhoto[];
}) {
  if (validateReviewDraft(draft) || draft.photos.length > MAX_PHOTOS) {
    throw new ApiError('Invalid review draft', { code: 'INVALID_REVIEW_DRAFT' });
  }
  draft.photos.forEach(reviewPhotoPart);
}

export function requireReviewMediaId(value: number | undefined): number {
  if (value === undefined || !Number.isSafeInteger(value) || value <= 0) {
    throw new ApiError('Invalid media response', { code: 'INVALID_MEDIA_RESPONSE' });
  }
  return value;
}
