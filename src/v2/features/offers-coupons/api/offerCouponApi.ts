import {
  apiClient,
  type ApiClient,
  type OffersCouponsOperationQuery,
  type OffersCouponsOperationResponse,
  type OffersCouponsSchema,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

// The tourist offer + coupon surface (`GET /offers`, `GET /offers/{offerId}`,
// `GET /coupons`, `GET /coupons/{couponId}`, `POST /offers/{offerId}/coupons`) is
// typed from the scoped live-server snapshot (`docs/api/offers-coupons.openapi.json`),
// regenerated via `npm run sync:offers-coupons-openapi && npm run generate:offers-coupons-api-types`.
// The app-wide `mvp` contract predates the issued-at coupon filter, the offer/place
// snapshot fields the coupon list embeds, and the offer policy enums, so this
// feature reads the scoped contract instead of the stale one.
export type ListOffersParams = OffersCouponsOperationQuery<'listIssuableOffers'>;
export type OfferPage = OffersCouponsOperationResponse<'listIssuableOffers', 200>;
export type Offer = OffersCouponsSchema<'OfferResponse'>;

export type ListCouponsParams = OffersCouponsOperationQuery<'listMyCoupons'>;
export type CouponPage = OffersCouponsOperationResponse<'listMyCoupons', 200>;
export type Coupon = OffersCouponsSchema<'CouponResponse'>;
export type CouponStatus = Coupon['status'];

// `redeemCoupon` is a Merchant-owner endpoint outside the tourist snapshot, so it
// stays on the `mvp` contract.
export type RedeemCouponBody = OperationRequestBody<'redeemCoupon'>;
export type RedeemedCoupon = OperationResponse<'redeemCoupon', 200>;

export function createOfferCouponApi(client: ApiClient = apiClient) {
  return {
    getCoupon: (couponId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.get<Coupon>(`/coupons/${couponId}`, { signal }),

    getOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.get<Offer>(`/offers/${offerId}`, { signal }),

    issueCoupon: (offerId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.post<Coupon>(`/offers/${offerId}/coupons`, undefined, { signal }),

    listCoupons: (
      params: ListCouponsParams = {},
      signal?: AbortSignal,
    ): Promise<CouponPage> =>
      client.get<CouponPage>('/coupons', { params, signal }),

    listOffers: (params: ListOffersParams = {}, signal?: AbortSignal): Promise<OfferPage> =>
      client.get<OfferPage>('/offers', { params, signal }),

    redeemCoupon: (body: RedeemCouponBody, signal?: AbortSignal): Promise<RedeemedCoupon> =>
      client.post<RedeemedCoupon, RedeemCouponBody>(
        '/merchant-owner/offers/coupons/redeem',
        body,
        { signal },
      ),
  };
}

export const offerCouponApi = createOfferCouponApi();
