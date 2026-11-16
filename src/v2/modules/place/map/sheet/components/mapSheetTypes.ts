import { type ReviewReasonKey } from '../../../../../shared/api/reviewReasons';
import type { PlaceOperatingSummaryText } from '../../../detail';
import type { ReservationCtaState } from '../../../../booking';
import { type ExternalMapPlace } from '../../selection/model/externalPlace';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'recommendations' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number }
  | { type: 'external-place'; place: ExternalMapPlace };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

export type MapPreviewFallbackContent = {
  amenities: Array<'english' | 'parking'>;
  topReviewReasons?: ReviewReasonKey[];
  coupons?: Array<{ period: string; title: string }>;
  englishName?: string;
  events?: Array<{ period: string; title: string }>;
  imageState?: 'empty' | 'error' | 'loading' | 'ready';
  imageUrls: string[];
  phone?: string;
  jibunAddress?: string;
  notice?: string;
  operatingSummary?: PlaceOperatingSummaryText;
  roadAddress?: string;
  summary?: string;
  reviewCount?: number;
  reservation?: ReservationCtaState;
  reviewState?: 'empty' | 'error' | 'loading' | 'ready';
  reviewHighlights?: Array<{ count: number; label: string; reason?: ReviewReasonKey }>;
  reviewSampleSize?: number;
  reviewHighlightsComplete?: boolean;
  reviewParticipantCount?: number;
  reviews?: Array<{
    author: string;
    placeId?: number;
    isOwnReview?: boolean;
    onEdit?: () => void;
    reviewId?: number;
    avatarUrl?: string;
    createdAt: string;
    imageUrls?: string[];
    reasons: ReviewReasonKey[];
    text: string;
  }>;
  statusDescription: string;
  statusEmphasis: string;
  verifiedEvidenceCount?: number;
};

export type DecisionPlace = {
  address: string;
  category: string;
  distance: string;
  distanceMeters?: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  recommendationRank?: number;
  recommendationReason?: string;
  recommendationSource?: string;
  tags: string[];
  verifiedAgo: string;
  verifiedMinutes?: number;
  wait: string;
  waitMinutes?: [number, number];
};
