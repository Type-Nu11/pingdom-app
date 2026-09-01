import {
  ApiError,
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
 * A coupon summary. Both documented servers (`/v3/api-docs/app`) return only the
 * identity, status and instants, but some deployments enrich the payload with an
 * offer/place summary, so those stay optional-by-null instead of required.
 */
export type Coupon = OperationResponse<'issueCoupon', 201> & {
  benefitDescription: string | null;
  offerTitle: string | null;
  placeId: number | null;
  placeName: string | null;
};
export type CouponStatus = Coupon['status'];

// A single-coupon read walks the list; keep the page big and the walk bounded so
// a large wallet cannot turn one detail view into an unbounded request fan-out.
const COUPON_LOOKUP_PAGE_SIZE = 100;
const COUPON_LOOKUP_MAX_PAGES = 20;

export function createOfferCouponApi(client: ApiClient = apiClient) {
  const listCoupons = async (
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
  };

  return {
    /**
     * Neither documented server exposes `GET /coupons/{couponId}`, so a single
     * coupon is resolved out of the paginated list. Not-found is surfaced as a
     * 404 `ApiError` so callers keep the same error handling either way.
     */
    getCoupon: async (couponId: number, signal?: AbortSignal): Promise<Coupon> => {
      for (let page = 1; page <= COUPON_LOOKUP_MAX_PAGES; page += 1) {
        const result = await listCoupons({ limit: COUPON_LOOKUP_PAGE_SIZE, page }, signal);
        const found = result.coupons.find((coupon) => coupon.id === couponId);
        if (found) return found;
        if (!result.hasNext) break;
      }

      throw new ApiError('Coupon not found', { code: 'COUPON_NOT_FOUND', status: 404 });
    },

    getOffer: (offerId: number, signal?: AbortSignal): Promise<Offer> =>
      client.get<Offer>(`/offers/${offerId}`, { signal }),

    issueCoupon: (offerId: number, signal?: AbortSignal): Promise<Coupon> =>
      client.post<Coupon>(`/offers/${offerId}/coupons`, undefined, { signal }),

    listCoupons,

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
