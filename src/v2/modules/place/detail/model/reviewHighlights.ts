import { REASON_CODES, reviewReasonsFromResponse, type ReviewReasonKey } from '../../../../shared/api/reviewReasons';
import type { PlaceReviewPage } from '../../visit-verification';

type Review = NonNullable<PlaceReviewPage['content']>[number];
const positiveId = (id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0;

/** Summarize only loaded records; a page is never presented as a global aggregate. */
export function summarizeReviewHighlights(records: Review[], page?: PlaceReviewPage) {
  const seen = new Set<number>();
  const reviews = records.filter(review => {
    if (!positiveId(review.reviewId)) return true;
    if (seen.has(review.reviewId)) return false;
    seen.add(review.reviewId);
    return true;
  });
  const knownAuthors = reviews.every(review => positiveId(review.userId));
  const votes = new Map<ReviewReasonKey, Set<string>>();
  reviews.forEach((review, index) => {
    const voter = knownAuthors ? `user:${review.userId}` : (positiveId(review.reviewId) ? `review:${review.reviewId}` : `row:${index}`);
    for (const reason of reviewReasonsFromResponse(review)) {
      const selected = votes.get(reason) ?? new Set<string>();
      selected.add(voter);
      votes.set(reason, selected);
    }
  });
  const highlights = (Object.keys(REASON_CODES) as ReviewReasonKey[])
    .map(reason => ({ reason, count: votes.get(reason)?.size ?? 0 }))
    .filter(item => item.count > 0)
    .sort((left, right) => right.count - left.count);
  return {
    highlights,
    participantCount: knownAuthors ? new Set(reviews.map(review => review.userId)).size : null,
    sampleSize: reviews.length,
    complete: (page?.number ?? 0) === 0 && typeof page?.totalElements === 'number'
      && Number.isFinite(page.totalElements) && page.totalElements === reviews.length,
  };
}
