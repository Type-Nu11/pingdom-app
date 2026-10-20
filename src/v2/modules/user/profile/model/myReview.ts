import { reviewReasonsFromResponse } from '../../../../shared/api/reviewReasons';
import type { MyPlaceReview } from './profile.types';

export function selectMyReview(reviews: MyPlaceReview[], reviewId: number) {
  const review = reviews.find(item => item.reviewId === reviewId && item.visibilityStatus !== 'DELETED');
  return { review, reasons: review ? reviewReasonsFromResponse(review) : [] };
}
