import {
  ApiError,
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

// 발급 실패(401/403/404/409)는 shared/api 의 정규화를 거친 ApiError 로 올라온다.
// 훅과 화면은 shared 계층을 직접 import 하지 않으므로 이 모듈에서 다시 내보낸다.
export { ApiError };

export type ListOffersParams = OperationQuery<'listIssuableOffers'>;

/**
 * The generated contract still describes `/coupons` with only `page`, `limit`
 * and `status`. The live endpoint also accepts an inclusive `issuedAt` window
 * (`issuedFrom` / `issuedTo`, ISO-8601 local date-time). Those are widened in
 * here rather than by regenerating the contract, so callers get one param type.
 */
export type ListCouponsParams = OperationQuery<'listMyCoupons'> & {
  issuedFrom?: string;
  issuedTo?: string;
};

export type RedeemCouponBody = OperationRequestBody<'redeemCoupon'>;
export type OfferPage = OperationResponse<'listIssuableOffers', 200>;
/**
 * The generated contract predates the offer policy fields the live server now
 * returns. They are widened here rather than by regenerating the app-wide
 * contract, matching how `listCoupons` absorbs the page envelope difference.
 */
export type Offer = OperationResponse<'getIssuableOffer', 200> & {
  eligibilityPolicy?: 'ACTIVE_TRAVEL_SCHEDULE' | 'PUBLIC';
  expiryPolicy?: 'ISSUE_PLUS_DAYS' | 'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END' | 'OFFER_END';
  inventoryPolicy?: 'LIMITED' | 'UNLIMITED';
};
export type CouponPage = Omit<OperationResponse<'listMyCoupons', 200>, 'coupons'> & {
  coupons: Coupon[];
};

/**
 * The live `/coupons` payload embeds the offer and place summary the box and
 * detail screens render, so neither has to fan out per row. The generated
 * contract predates those fields, so they are widened in here.
 */
export type Coupon = OperationResponse<'issueCoupon', 201> & {
  benefitDescription: string | null;
  offerTitle: string | null;
  placeId: number | null;
  placeName: string | null;
};
export type CouponStatus = Coupon['status'];

export function createOfferCouponApi(client: ApiClient = apiClient) {
  return {
    getCoupon: (couponId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.get<Coupon>(`/coupons/${couponId}`, { signal }),

    getOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.get<Offer>(`/offers/${offerId}`, { signal }),

    // POST /offers/{offerId}/coupons — 계약상 request body 가 없다(201 CouponResponse).
    // 401/403/404/409 는 apiClient 의 toApiError 를 거쳐 ApiError 로 reject 된다.
    issueCoupon: (offerId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.post<Coupon>(`/offers/${offerId}/coupons`, undefined, { signal }),

    listCoupons: async (
      params: ListCouponsParams = {},
      signal?: AbortSignal,
    ): Promise<CouponPage> => {
      // The live server responds with `totalElements` and always includes the
      // page envelope; the generated contract (last regenerated against an older
      // spec) still expects `totalCount`. Normalize so every field callers and
      // the infinite query rely on is present regardless of which server answers.
      const raw = await client.get<Record<string, unknown>>('/coupons', { params, signal });
      const page = (raw.page ?? params.page ?? 1) as CouponPage['page'];
      const hasNext = (raw.hasNext ?? false) as CouponPage['hasNext'];

      return {
        ...raw,
        coupons: (raw.coupons ?? []) as CouponPage['coupons'],
        hasNext,
        limit: (raw.limit ?? params.limit ?? 20) as CouponPage['limit'],
        page,
        totalCount: (raw.totalElements ?? raw.totalCount ?? 0) as CouponPage['totalCount'],
        totalPages: (raw.totalPages ?? (hasNext ? page + 1 : page)) as CouponPage['totalPages'],
      } as CouponPage;
    },

    listOffers: (params: ListOffersParams = {}, signal?: AbortSignal): Promise<OfferPage> =>
      client.get<OfferPage>('/offers', { params, signal }),

    redeemCoupon: (body: RedeemCouponBody, signal?: AbortSignal): Promise<Coupon> =>
      client.post<Coupon, RedeemCouponBody>(
        '/merchant-owner/offers/coupons/redeem',
        body,
        { signal },
      ),
  };
}

export const offerCouponApi = createOfferCouponApi();
