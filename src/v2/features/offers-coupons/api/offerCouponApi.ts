import {
  ApiError,
  apiClient,
  type ApiClient,
  type OffersCouponsOperationQuery,
  type OffersCouponsOperationResponse,
  type OffersCouponsSchema,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

// 발급 실패(401/403/404/409)는 shared/api 의 정규화를 거친 ApiError 로 올라온다.
// 훅과 화면은 shared 계층을 직접 import 하지 않으므로 이 모듈에서 다시 내보낸다.
export { ApiError };

// The tourist offer + coupon surface (`GET /offers`, `GET /offers/{offerId}`,
// `GET /coupons`, `POST /offers/{offerId}/coupons`) is
// typed from the scoped live-server snapshot (`docs/api/offers-coupons.openapi.json`),
// regenerated via `npm run sync:offers-coupons-openapi && npm run generate:offers-coupons-api-types`.
// The app-wide `mvp` contract predates the issued-at coupon filter and current
// Offer policy enums, so this feature reads the scoped contract instead of the
// stale one.
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
    getOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.get<Offer>(`/offers/${offerId}`, { signal }),

    // POST /offers/{offerId}/coupons — 계약상 request body 가 없다(201 CouponResponse).
    // 401/403/404/409 는 apiClient 의 toApiError 를 거쳐 ApiError 로 reject 된다.
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
