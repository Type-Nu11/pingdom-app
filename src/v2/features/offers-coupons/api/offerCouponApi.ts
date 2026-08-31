import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

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
export type Offer = OperationResponse<'getIssuableOffer', 200>;
export type CouponPage = OperationResponse<'listMyCoupons', 200>;
export type Coupon = OperationResponse<'issueCoupon', 201>;
export type CouponStatus = Coupon['status'];

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
