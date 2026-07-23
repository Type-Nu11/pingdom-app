import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  offerCouponApi,
  type ListCouponsParams,
  type ListOffersParams,
  type RedeemCouponBody,
} from '../api/offerCouponApi';

type OfferCouponApi = typeof offerCouponApi;

export const offerCouponQueryKeys = {
  coupons: (params: ListCouponsParams) => ['v2', 'coupons', params] as const,
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

export function createCouponsQueryOptions(
  params: ListCouponsParams = {},
  api: Pick<OfferCouponApi, 'listCoupons'> = offerCouponApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listCoupons(params, signal),
    queryKey: offerCouponQueryKeys.coupons(params),
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

export function useCoupons(params: ListCouponsParams = {}) {
  return useQuery(createCouponsQueryOptions(params));
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
