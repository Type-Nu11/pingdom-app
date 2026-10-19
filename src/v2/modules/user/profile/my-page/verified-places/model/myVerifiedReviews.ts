import type { MyPlaceReview } from '../../../model/profile.types';

/** Keep the first returned authored review for each place; never treat a check-in as a review. */
export function myVerifiedReviews(reviews: MyPlaceReview[]): MyPlaceReview[] {
  const seen = new Set<number>();
  return reviews.filter((review) => {
    if (review.visibilityStatus === 'DELETED' || !Number.isSafeInteger(review.placeId)
      || review.placeId <= 0 || !Number.isSafeInteger(review.reviewId) || review.reviewId <= 0
      || seen.has(review.placeId)) return false;
    seen.add(review.placeId);
    return true;
  });
}
