import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

export type ListOffersParams = OperationQuery<'listIssuableOffers'>;
export type ListCouponsParams = OperationQuery<'listMyCoupons'>;
export type RedeemCouponBody = OperationRequestBody<'redeemCoupon'>;
export type OfferPage = OperationResponse<'listIssuableOffers', 200>;
export type Offer = OperationResponse<'getIssuableOffer', 200>;
export type CouponPage = OperationResponse<'listMyCoupons', 200>;
export type Coupon = OperationResponse<'issueCoupon', 201>;

export function createOfferCouponApi(client: ApiClient = apiClient) {
  return {
    getOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.get<Offer>(`/offers/${offerId}`, { signal }),

    issueCoupon: (offerId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.post<Coupon>(`/offers/${offerId}/coupons`, undefined, { signal }),

    listCoupons: async (
      params: ListCouponsParams = {},
      signal?: AbortSignal,
    ): Promise<CouponPage> => {
      // The live server responds with `totalElements`; the generated contract
      // (last regenerated against an older spec) still expects `totalCount`.
      // Normalize so callers can rely on either.
      const raw = await client.get<Record<string, unknown>>('/coupons', { params, signal });
      return {
        ...raw,
        totalCount: (raw.totalElements ?? raw.totalCount ?? 0) as CouponPage['totalCount'],
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
