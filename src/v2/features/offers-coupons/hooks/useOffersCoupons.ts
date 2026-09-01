import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import {
  offerCouponApi,
  type ApiError,
  type Coupon,
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
  // Mutation 전용 key. 발급이 진행 중인 Offer 를 구분할 수 있도록 offerId 를 붙인다.
  issueCoupon: (offerId: number) => ['v2', 'coupons', 'issue', offerId] as const,
  issueCouponRoot: ['v2', 'coupons', 'issue'] as const,
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
  return {
    // 호출부가 넘긴 offerId 를 그대로 API 에 전달한다.
    // AbortSignal 은 붙이지 않는다. 발급은 비멱등이라 서버가 이미 Coupon 을 만든 뒤
    // 요청을 끊으면 클라이언트만 결과를 잃는다(취소 API 도 없다).
    mutationFn: (offerId: number) => api.issueCoupon(offerId),
    retry: false as const,
  };
}

export function createRedeemCouponMutationOptions(
  api: Pick<OfferCouponApi, 'redeemCoupon'> = offerCouponApi,
) {
  return { mutationFn: (body: RedeemCouponBody) => api.redeemCoupon(body) };
}

export function useOffers(params: ListOffersParams = {}) {
  return useQuery(createOffersQueryOptions(params));
}

export function useOffer(offerId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    ...createOfferQueryOptions(offerId),
    ...options,
  });
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

export type UseIssueCouponResult = {
  data: Coupon | undefined;
  error: ApiError | null;
  isError: boolean;
  isIssuing: (offerId: number) => boolean;
  isPending: boolean;
  isSuccess: boolean;
  issueCoupon: (offerId: number) => boolean;
  pendingOfferIds: readonly number[];
  reset: () => void;
};

export function useIssueCoupon(
  api: Pick<OfferCouponApi, 'issueCoupon'> = offerCouponApi,
): UseIssueCouponResult {
  const queryClient = useQueryClient();
  // 발급 진행 중인 offerId 집합. 렌더 사이에 값을 읽어야 하는 state 와 달리
  // mutate 직전에 동기적으로 갱신할 수 있어야 같은 tick 의 연속 탭을 막을 수 있다.
  const pendingOfferIdsRef = useRef<Set<number>>(new Set());
  const [pendingOfferIds, setPendingOfferIds] = useState<readonly number[]>([]);

  const syncPendingOfferIds = useCallback(() => {
    setPendingOfferIds([...pendingOfferIdsRef.current]);
  }, []);

  const mutation = useMutation<Coupon, ApiError, number>({
    ...createIssueCouponMutationOptions(api),
    mutationKey: offerCouponQueryKeys.issueCouponRoot,
    // 실패 시 onError 를 두지 않는다. 낙관적 write 가 없으므로 되돌릴 cache 도 없고,
    // 에러는 훅 사용자에게 ApiError 그대로 전달한다(메시지 매핑은 화면의 책임).
    onSettled: (_coupon, _error, offerId) => {
      pendingOfferIdsRef.current.delete(offerId);
      syncPendingOfferIds();
    },
    onSuccess: async () => {
      // 201 CouponResponse 를 setQueryData 로 직접 넣지 않는다. 내 Coupon 목록은
      // page/limit/status 로 서버가 잘라 주는 CouponPage 라서, 클라이언트가 한 건을
      // 끼워 넣으면 totalCount/hasNext/정렬이 서버와 어긋난다. 대신 관련 root 만 무효화한다.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: offerCouponQueryKeys.couponsRoot }),
        // offersRoot 는 prefix 라서 발급 가능한 Offer 목록과
        // offer(offerId) 상세(재고·발급 가능 여부 변동)를 함께 무효화한다.
        queryClient.invalidateQueries({ queryKey: offerCouponQueryKeys.offersRoot }),
      ]);
    },
  });

  const { mutate } = mutation;

  // 진행 중인 Offer 면 요청을 만들지 않고 false 를 돌려준다. 서로 다른 Offer 는 동시 발급 허용.
  const issueCoupon = useCallback(
    (offerId: number) => {
      if (pendingOfferIdsRef.current.has(offerId)) {
        return false;
      }

      pendingOfferIdsRef.current.add(offerId);
      syncPendingOfferIds();
      mutate(offerId);

      return true;
    },
    [mutate, syncPendingOfferIds],
  );

  const isIssuing = useCallback(
    (offerId: number) => pendingOfferIds.includes(offerId),
    [pendingOfferIds],
  );

  return {
    data: mutation.data,
    error: mutation.error,
    isError: mutation.isError,
    isIssuing,
    // mutation.isPending 은 마지막 mutation 만 반영하므로 동시 발급을 놓친다.
    isPending: pendingOfferIds.length > 0,
    isSuccess: mutation.isSuccess,
    issueCoupon,
    pendingOfferIds,
    reset: mutation.reset,
  };
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
