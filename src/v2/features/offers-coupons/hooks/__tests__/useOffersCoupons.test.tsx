import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type CouponPage } from '../../api/offerCouponApi';
import {
  CouponNotFoundError,
  createCouponQueryOptions,
  createInfiniteCouponsQueryOptions,
  findCouponById,
  offerCouponQueryKeys,
  useInfiniteCoupons,
  useIssueCoupon,
  useRedeemCoupon,
} from '../useOffersCoupons';

function couponPage(overrides: Partial<CouponPage> = {}): CouponPage {
  return {
    coupons: [],
    hasNext: false,
    limit: 20,
    page: 1,
    totalElements: 0,
    totalPages: 1,
    ...overrides,
  } as CouponPage;
}

describe('createCouponQueryOptions', () => {
  test('상세(현장 제시) 조회는 마운트와 포그라운드 복귀마다 재검증한다', () => {
    const options = createCouponQueryOptions(7);
    expect(options.queryKey).toEqual(['v2', 'coupons', 'detail', 7]);
    expect(options.refetchOnMount).toBe('always');
    expect(options.refetchOnWindowFocus).toBe('always');
  });

  test('서버에 없는 단건 endpoint 대신 목록을 순회해 실제 couponId를 찾는다', async () => {
    const target = {
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      expiresAt: '2026-09-30T23:59:59',
      id: 7,
      issuedAt: '2026-09-01T09:00:00',
      offerId: 3,
      redeemedAt: null,
      status: 'ISSUED',
    } as CouponPage['coupons'][number];
    const listCoupons = jest.fn(async (params) => (
      params?.page === 1
        ? couponPage({ hasNext: true, page: 1, totalPages: 2 })
        : couponPage({ coupons: [target], page: 2, totalElements: 1, totalPages: 2 })
    ));

    await expect(findCouponById(7, { listCoupons })).resolves.toEqual(target);
    expect(listCoupons).toHaveBeenNthCalledWith(1, { limit: 100, page: 1 }, undefined);
    expect(listCoupons).toHaveBeenNthCalledWith(2, { limit: 100, page: 2 }, undefined);
  });

  test('모든 페이지에 couponId가 없으면 조회 오류로 구분한다', async () => {
    const listCoupons = jest.fn(async () => couponPage());

    await expect(findCouponById(404, { listCoupons }))
      .rejects.toBeInstanceOf(CouponNotFoundError);
  });
});

describe('createInfiniteCouponsQueryOptions', () => {
  test('page는 캐시 키에서 제외하고 필터만 남긴다', () => {
    const options = createInfiniteCouponsQueryOptions({ limit: 20, page: 5, status: 'ISSUED' });
    expect(options.queryKey).toEqual(['v2', 'coupons', 'infinite', { limit: 20, status: 'ISSUED' }]);
  });

  test('hasNext와 page<totalPages일 때만 다음 페이지 번호를 준다', () => {
    const { getNextPageParam } = createInfiniteCouponsQueryOptions();
    expect(getNextPageParam(couponPage({ hasNext: true, page: 1, totalPages: 3 }))).toBe(2);
    expect(getNextPageParam(couponPage({ hasNext: false, page: 1, totalPages: 3 }))).toBeUndefined();
    expect(getNextPageParam(couponPage({ hasNext: true, page: 3, totalPages: 3 }))).toBeUndefined();
  });
});

describe('useInfiniteCoupons', () => {
  test('fetchNextPage가 다음 page 번호로 서버를 호출한다', async () => {
    const listCoupons = jest.spyOn(offerCouponApi, 'listCoupons').mockImplementation(
      async (params) => couponPage({
        coupons: [{ id: params?.page ?? 1 }] as CouponPage['coupons'],
        hasNext: (params?.page ?? 1) < 2,
        page: params?.page ?? 1,
        totalPages: 2,
      }),
    );
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useInfiniteCoupons({ status: 'ISSUED' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listCoupons).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, status: 'ISSUED' }),
      expect.anything(),
    );
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(listCoupons).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, status: 'ISSUED' }),
      expect.anything(),
    );
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('coupon mutation cache invalidation', () => {
  test('발급 성공 후 쿠폰 목록과 Offer 캐시를 무효화한다', async () => {
    jest.spyOn(offerCouponApi, 'issueCoupon').mockResolvedValue({
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      expiresAt: '2026-09-30T23:59:59',
      id: 1,
      issuedAt: '2026-09-01T09:00:00',
      offerId: 7,
      redeemedAt: null,
      status: 'ISSUED',
    });
    const { queryClient, wrapper } = await createTestWrapper();
    const couponKey = offerCouponQueryKeys.coupons({ status: 'ISSUED' });
    const offerKey = offerCouponQueryKeys.offers({});
    queryClient.setQueryData(couponKey, couponPage());
    queryClient.setQueryData(offerKey, { offers: [] });
    const { result } = await renderHook(() => useIssueCoupon(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(7);
    });

    expect(queryClient.getQueryState(couponKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(offerKey)?.isInvalidated).toBe(true);
  });

  test('사용 성공 후 모든 쿠폰 목록 캐시를 무효화한다', async () => {
    jest.spyOn(offerCouponApi, 'redeemCoupon').mockResolvedValue({ id: 1 } as never);
    const { queryClient, wrapper } = await createTestWrapper();
    const listKey = offerCouponQueryKeys.coupons({});
    const infiniteKey = offerCouponQueryKeys.couponsInfinite({ status: 'REDEEMED' });
    queryClient.setQueryData(listKey, couponPage());
    queryClient.setQueryData(infiniteKey, { pageParams: [1], pages: [couponPage()] });
    const { result } = await renderHook(() => useRedeemCoupon(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ code: '3fa85f64-5717-4562-b3fc-2c963f66afa6' });
    });

    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(infiniteKey)?.isInvalidated).toBe(true);
  });
});
