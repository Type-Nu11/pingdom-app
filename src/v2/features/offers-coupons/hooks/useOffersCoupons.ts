import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  offerCouponApi,
  type CouponPage,
  type ListCouponsParams,
  type ListOffersParams,
  type RedeemCouponBody,
} from '../api/offerCouponApi';

type OfferCouponApi = typeof offerCouponApi;

export const offerCouponQueryKeys = {
  coupon: (couponId: number) => ['v2', 'coupons', 'detail', couponId] as const,
  coupons: (params: ListCouponsParams) => ['v2', 'coupons', params] as const,
  couponsInfinite: (params: ListCouponsParams) => ['v2', 'coupons', 'infinite', params] as const,
  couponsRoot: ['v2', 'coupons'] as const,
  offer: (offerId: number) => ['v2', 'offers', 'detail', offerId] as const,
  offers: (params: ListOffersParams) => ['v2', 'offers', 'list', params] as const,
  offersRoot: ['v2', 'offers'] as const,
};

export function createOffersQueryOptions(
  params: ListOffersParams = {},
  api: Pick<OfferCouponApi, 'listOffers'> = offerCouponApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listOffers(params, signal),
    queryKey: offerCouponQueryKeys.offers(params),
  };
}

export function createOfferQueryOptions(
  offerId: number,
  api: Pick<OfferCouponApi, 'getOffer'> = offerCouponApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getOffer(offerId, signal),
    queryKey: offerCouponQueryKeys.offer(offerId),
  };
}

export function createCouponQueryOptions(
  couponId: number,
  api: Pick<OfferCouponApi, 'getCoupon'> = offerCouponApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getCoupon(couponId, signal),
    queryKey: offerCouponQueryKeys.coupon(couponId),
  };
}

export function createCouponsQueryOptions(
  params: ListCouponsParams = {},
  api: Pick<OfferCouponApi, 'listCoupons'> = offerCouponApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listCoupons(params, signal),
    queryKey: offerCouponQueryKeys.coupons(params),
  };
}

/**
 * Server-backed pagination for the coupon box. `page` is owned by the query, so
 * it is stripped from `params` and only the filters (status, issued-at window,
 * limit) take part in the cache key.
 */
export function createInfiniteCouponsQueryOptions(
  params: ListCouponsParams = {},
  api: Pick<OfferCouponApi, 'listCoupons'> = offerCouponApi,
) {
  const { page: _page, ...filters } = params;

  return {
    getNextPageParam: (lastPage: CouponPage) => (
      lastPage.hasNext && lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }: { pageParam: number; signal?: AbortSignal }) =>
      api.listCoupons({ ...filters, page: pageParam }, signal),
    queryKey: offerCouponQueryKeys.couponsInfinite(filters),
  };
}

export function createIssueCouponMutationOptions(
  api: Pick<OfferCouponApi, 'issueCoupon'> = offerCouponApi,
) {
  return { mutationFn: (offerId: number) => api.issueCoupon(offerId) };
}

export function createRedeemCouponMutationOptions(
  api: Pick<OfferCouponApi, 'redeemCoupon'> = offerCouponApi,
) {
  return { mutationFn: (body: RedeemCouponBody) => api.redeemCoupon(body) };
}

export function useOffers(params: ListOffersParams = {}) {
  return useQuery(createOffersQueryOptions(params));
}

export function useOffer(offerId: number) {
  return useQuery(createOfferQueryOptions(offerId));
}

export function useCoupon(couponId: number) {
  return useQuery(createCouponQueryOptions(couponId));
}

export function useCoupons(params: ListCouponsParams = {}) {
  return useQuery(createCouponsQueryOptions(params));
}

export function useInfiniteCoupons(params: ListCouponsParams = {}) {
  return useInfiniteQuery(createInfiniteCouponsQueryOptions(params));
}

export function useIssueCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createIssueCouponMutationOptions(),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: offerCouponQueryKeys.couponsRoot }),
      queryClient.invalidateQueries({ queryKey: offerCouponQueryKeys.offersRoot }),
    ]),
  });
}

export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createRedeemCouponMutationOptions(),
    onSuccess: async () => queryClient.invalidateQueries({
      queryKey: offerCouponQueryKeys.couponsRoot,
    }),
  });
}
