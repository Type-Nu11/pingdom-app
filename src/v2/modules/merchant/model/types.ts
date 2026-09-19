/**
 * View models for the merchant My Page. These describe only what the screen
 * renders; wiring them to the real merchant/place/event APIs comes later.
 */

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

export type MerchantReviewTagKind =
  | 'clean'
  | 'delicious'
  | 'kind'
  | 'photogenic';

export type MerchantReviewTag = Readonly<{
  /** Omitted when the reason has no matching preset icon. */
  kind?: MerchantReviewTagKind;
  label: string;
}>;

export type MerchantReview = Readonly<{
  authorName: string;
  authorProfileImageUrl: string | null;
  content: string;
  id: string;
  photoUrls: readonly string[];
  relativeTime: string;
  tags: readonly MerchantReviewTag[];
}>;

export type MerchantEventStatus = 'ended' | 'ongoing' | 'upcoming';

export type MerchantEvent = Readonly<{
  benefit: string;
  id: string;
  period: string;
  status: MerchantEventStatus;
  title: string;
}>;
