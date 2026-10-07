/**
 * View models for the merchant My Page. These describe only what the screen
 * renders; wiring them to the real merchant/place/event APIs comes later.
 */

import type { ReviewReasonKey } from '../../../shared/api/reviewReasons';

export type MerchantProfileSummary = Readonly<{
  isVerified: boolean;
  profileImageUrl: string | null;
  username: string;
}>;

export type MerchantStorePhoto = Readonly<{
  id: string;
  url: string;
}>;

export type MerchantStoreFeature = 'englishSupport' | 'parking';

export type MerchantStore = Readonly<{
  address: string;
  businessHours: string;
  category: string;
  features: readonly MerchantStoreFeature[];
  name: string;
  phoneNumber: string;
  photos: readonly MerchantStorePhoto[];
  verifiedCount: number;
}>;

export type MerchantReview = Readonly<{
  authorName: string;
  authorProfileImageUrl: string | null;
  content: string;
  id: string;
  photoUrls: readonly string[];
  reasons: readonly ReviewReasonKey[];
  relativeTime: string;
}>;

export type MerchantEventStatus = 'ended' | 'ongoing' | 'upcoming';

export type MerchantEvent = Readonly<{
  benefit: string;
  id: string;
  period: string;
  status: MerchantEventStatus;
  title: string;
}>;
