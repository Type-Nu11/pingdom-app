import { apiClient, type ApiClient } from '../../../shared/api';

/**
 * Hand-written client for the /merchant-owner endpoints. The generated contract
 * was last regenerated against an older spec and does not carry these paths, so
 * — as with bookmarkApi — the shapes are declared here from the live Swagger.
 */

export type MerchantOwnerProfileStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'REVOKED';

export type MerchantOwnerProfile = {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  description: string | null;
  displayName: string;
  placeIds: number[];
  status: MerchantOwnerProfileStatus;
  userId: number;
};

export type PlaceOperatingStatus =
  | 'OPERATING'
  | 'PERMANENTLY_CLOSED'
  | 'TEMPORARILY_CLOSED';

export type DayOfWeek =
  | 'FRIDAY'
  | 'MONDAY'
  | 'SATURDAY'
  | 'SUNDAY'
  | 'THURSDAY'
  | 'TUESDAY'
  | 'WEDNESDAY';

export type RegularOperatingHour = {
  closesAt: string;
  dayOfWeek: DayOfWeek;
  opensAt: string;
};

export type MerchantOwnerPlaceDetail = {
  address: string;
  category: string;
  englishName: string;
  id: number;
  imageUrl: string;
  name: string;
  operatingStatus: PlaceOperatingStatus;
  regularHours: RegularOperatingHour[];
  roadAddress: string;
};

export type MerchantPlaceInformation = {
  contactPhone: string | null;
  description: string | null;
  placeId: number;
  reservationUrl: string | null;
  websiteUrl: string | null;
};

export type MerchantPlaceInformationUpdate = {
  contactPhone?: string | null;
  description?: string | null;
  reservationUrl?: string | null;
  websiteUrl?: string | null;
};

export type MerchantOwnerOperating = {
  currentlyOperating: boolean;
  operatingStatus: PlaceOperatingStatus;
  placeId: number;
  regularHours: RegularOperatingHour[];
};

export type OperatingScheduleUpdate = {
  regularHours: RegularOperatingHour[];
};

export type PlaceMediaItem = {
  displayOrder: number;
  id: number;
  imageUrl: string;
  placeId: number;
  purpose: 'EXPLORATION' | 'VERIFICATION';
  thumbnailUrl: string | null;
};

export type MerchantOwnerMedia = {
  media: PlaceMediaItem[];
  placeId: number;
  representativeMediaId: number | null;
};

export type PlaceReview = {
  content: string;
  createdAt: string;
  imageUrls: string[];
  placeId: number;
  recommendReason: string;
  reviewId: number;
  userId: number;
};

export type PlaceReviewPage = {
  content: PlaceReview[];
  last: boolean;
  number: number;
  totalElements: number;
};

export type OfferStatus = 'CLOSED' | 'DRAFT' | 'PUBLISHED';

export type Offer = {
  benefitDescription: string;
  description: string;
  endsAt: string;
  id: number;
  placeId: number;
  startsAt: string;
  status: OfferStatus;
  title: string;
};

export type OfferPage = {
  hasNext: boolean;
  offers: Offer[];
  page: number;
  totalElements: number;
};

export type OfferCreate = {
  benefitDescription: string;
  couponValidityDays: number;
  description: string;
  endsAt: string;
  placeId: number;
  startsAt: string;
  title: string;
  totalQuantity?: number | null;
};

export type PageParams = {
  limit?: number;
  page?: number;
};

export function createMerchantOwnerApi(client: ApiClient = apiClient) {
  return {
    getProfile: (signal?: AbortSignal): Promise<MerchantOwnerProfile> =>
      client.get<MerchantOwnerProfile>('/merchant-owner/me', { signal }),

    getPlaceDetail: (placeId: number, signal?: AbortSignal): Promise<MerchantOwnerPlaceDetail> =>
      client.get<MerchantOwnerPlaceDetail>(`/merchant-owner/places/${placeId}`, { signal }),

    getPlaceInformation: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<MerchantPlaceInformation> =>
      client.get<MerchantPlaceInformation>(
        `/merchant-owner/places/${placeId}/information`,
        { signal },
      ),

    updatePlaceInformation: (
      placeId: number,
      body: MerchantPlaceInformationUpdate,
      signal?: AbortSignal,
    ): Promise<MerchantPlaceInformation> =>
      client.put<MerchantPlaceInformation, MerchantPlaceInformationUpdate>(
        `/merchant-owner/places/${placeId}/information`,
        body,
        { signal },
      ),

    getOperating: (placeId: number, signal?: AbortSignal): Promise<MerchantOwnerOperating> =>
      client.get<MerchantOwnerOperating>(
        `/merchant-owner/places/${placeId}/operating`,
        { signal },
      ),

    updateOperatingSchedule: (
      placeId: number,
      body: OperatingScheduleUpdate,
      signal?: AbortSignal,
    ): Promise<unknown> =>
      client.put<unknown, OperatingScheduleUpdate>(
        `/merchant-owner/places/${placeId}/operating-schedule`,
        body,
        { signal },
      ),

    getMedia: (placeId: number, signal?: AbortSignal): Promise<MerchantOwnerMedia> =>
      client.get<MerchantOwnerMedia>(`/merchant-owner/places/${placeId}/media`, { signal }),

    listReviews: (
      placeId: number,
      params: PageParams = {},
      signal?: AbortSignal,
    ): Promise<PlaceReviewPage> =>
      client.get<PlaceReviewPage>(`/places/${placeId}/reviews`, { params, signal }),

    listOffers: (params: PageParams = {}, signal?: AbortSignal): Promise<OfferPage> =>
      client.get<OfferPage>('/merchant-owner/offers', { params, signal }),

    createOffer: (body: OfferCreate, signal?: AbortSignal): Promise<Offer> =>
      client.post<Offer, OfferCreate>('/merchant-owner/offers', body, { signal }),

    publishOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.post<Offer>(`/merchant-owner/offers/${offerId}/publish`, undefined, { signal }),

    closeOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.post<Offer>(`/merchant-owner/offers/${offerId}/close`, undefined, { signal }),
  };
}

export const merchantOwnerApi = createMerchantOwnerApi();
