import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../shared/testing/testProviders';
import {
  ApiError,
  type Coupon,
  type CouponPage,
  type OfferPage,
} from '../../api/offerCouponApi';
import { offerCouponQueryKeys, useIssueCoupon } from '../useOffersCoupons';

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    code: '11111111-1111-4111-8111-111111111111',
    expiresAt: '2026-09-30T23:59:59Z',
    id: 9_001,
    issuedAt: '2026-09-01T09:00:00Z',
    offerId: 401,
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  };
}

function couponPage(coupons: Coupon[]): CouponPage {
  return {
    coupons,
    hasNext: false,
    limit: 20,
    page: 1,
    totalElements: coupons.length,
    totalPages: 1,
  };
}

function offerPage(): OfferPage {
  return {
    hasNext: false,
    limit: 20,
    offers: [],
    page: 1,
    totalElements: 0,
    totalPages: 1,
  };
}

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

const unrelatedKey = ['v2', 'places', 'list'] as const;

describe('useIssueCoupon', () => {
  test('성공하면 coupon·offer root 만 무효화한다', async () => {
    const issueCoupon = jest.fn().mockResolvedValue(coupon());
    const { queryClient, wrapper } = await createTestWrapper();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData(unrelatedKey, { places: [] });

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(issueCoupon).toHaveBeenCalledWith(401);
    expect(result.current.data).toEqual(coupon());
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: offerCouponQueryKeys.couponsRoot,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: offerCouponQueryKeys.offersRoot,
    });
    // 인자 없는 전체 무효화 금지: 호출은 위 두 건뿐이다.
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
  });

  test('offersRoot 무효화가 목록과 해당 Offer 상세까지 덮는다', async () => {
    const issueCoupon = jest.fn().mockResolvedValue(coupon());
    const { queryClient, wrapper } = await createTestWrapper();
    queryClient.setQueryData(offerCouponQueryKeys.offer(401), { id: 401 });
    queryClient.setQueryData(offerCouponQueryKeys.offers({}), offerPage());
    queryClient.setQueryData(offerCouponQueryKeys.coupons({}), couponPage([]));

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(offerCouponQueryKeys.offer(401))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(offerCouponQueryKeys.offers({}))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(offerCouponQueryKeys.coupons({}))?.isInvalidated).toBe(true);
  });

  test('무효화된 내 Coupon 목록을 다시 조회하면 새 Coupon 이 반영된다', async () => {
    const issued = coupon({ id: 9_100, offerId: 401 });
    const issueCoupon = jest.fn().mockResolvedValue(issued);
    const listCoupons = jest.fn()
      .mockResolvedValueOnce(couponPage([]))
      .mockResolvedValue(couponPage([issued]));
    const { queryClient, wrapper } = await createTestWrapper();

    // staleTime 이 Infinity 라서, 무효화되지 않으면 fetchQuery 는 cache 를 그대로 돌려준다.
    const queryOptions = {
      queryFn: () => listCoupons(),
      queryKey: offerCouponQueryKeys.coupons({}),
      staleTime: Infinity,
    };
    await queryClient.fetchQuery(queryOptions);
    await queryClient.fetchQuery(queryOptions);
    expect(listCoupons).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryData<CouponPage>(offerCouponQueryKeys.coupons({}))?.coupons,
    ).toEqual([]);

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await queryClient.fetchQuery(queryOptions);

    expect(listCoupons).toHaveBeenCalledTimes(2);
    expect(
      queryClient.getQueryData<CouponPage>(offerCouponQueryKeys.coupons({}))?.coupons,
    ).toEqual([issued]);
  });

  test('진행 중인 같은 offerId 를 다시 탭해도 요청은 한 번만 나간다', async () => {
    const pending = deferred<Coupon>();
    const issueCoupon = jest.fn().mockReturnValue(pending.promise);
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    let accepted: boolean[] = [];
    await act(async () => {
      accepted = [
        result.current.issueCoupon(401),
        result.current.issueCoupon(401),
        result.current.issueCoupon(401),
      ];
    });

    expect(accepted).toEqual([true, false, false]);
    expect(issueCoupon).toHaveBeenCalledTimes(1);
    expect(result.current.isIssuing(401)).toBe(true);
    expect(result.current.isIssuing(402)).toBe(false);
    expect(result.current.isPending).toBe(true);

    await act(async () => {
      pending.resolve(coupon());
      await pending.promise;
    });

    await waitFor(() => expect(result.current.isIssuing(401)).toBe(false));
    expect(result.current.isPending).toBe(false);
  });

  test('기존 CTA의 mutate 진입점도 같은 offerId 요청을 한 번으로 합친다', async () => {
    const pending = deferred<Coupon>();
    const issueCoupon = jest.fn().mockReturnValue(pending.promise);
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.mutate(401);
      result.current.mutate(401);
      result.current.mutate(401);
    });

    expect(issueCoupon).toHaveBeenCalledTimes(1);
    expect(result.current.isIssuing(401)).toBe(true);

    await act(async () => {
      pending.resolve(coupon());
      await pending.promise;
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  test('발급이 끝나면 같은 offerId 를 다시 발급할 수 있다', async () => {
    const issueCoupon = jest.fn().mockResolvedValue(coupon());
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    await act(async () => {
      result.current.issueCoupon(401);
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(issueCoupon).toHaveBeenCalledTimes(2);
  });

  test('서로 다른 offerId 는 동시에 각각 한 번씩 발급된다', async () => {
    const first = deferred<Coupon>();
    const second = deferred<Coupon>();
    const issueCoupon = jest.fn().mockImplementation(
      (offerId: number) => (offerId === 401 ? first.promise : second.promise),
    );
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
      result.current.issueCoupon(402);
      // 같은 Offer 를 한 번 더 눌러도 새 요청은 없다.
      result.current.issueCoupon(401);
    });

    expect(issueCoupon).toHaveBeenCalledTimes(2);
    expect(issueCoupon).toHaveBeenNthCalledWith(1, 401);
    expect(issueCoupon).toHaveBeenNthCalledWith(2, 402);
    expect([...result.current.pendingOfferIds].sort()).toEqual([401, 402]);

    await act(async () => {
      first.resolve(coupon({ id: 401, offerId: 401 }));
      second.resolve(coupon({ id: 402, offerId: 402 }));
      await Promise.all([first.promise, second.promise]);
    });

    await waitFor(() => expect(result.current.pendingOfferIds).toHaveLength(0));
  });

  test('409 는 성공으로 가려지지 않고 error 로 노출된다', async () => {
    const conflict = new ApiError('이미 발급한 쿠폰입니다.', {
      code: 'COUPON_ALREADY_ISSUED',
      status: 409,
    });
    const issueCoupon = jest.fn().mockRejectedValue(conflict);
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(conflict);
    expect(result.current.error?.status).toBe(409);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBe(false);
    // 발급은 비멱등이므로 자동 재시도하지 않는다.
    expect(issueCoupon).toHaveBeenCalledTimes(1);
  });

  test('실패해도 기존 cache 는 그대로 남는다', async () => {
    const issueCoupon = jest.fn().mockRejectedValue(
      new ApiError('발급 조건 불충족', { code: 'FORBIDDEN', status: 403 }),
    );
    const { queryClient, wrapper } = await createTestWrapper();
    const before = couponPage([coupon({ id: 1 })]);
    const offers = offerPage();
    queryClient.setQueryData(offerCouponQueryKeys.coupons({}), before);
    queryClient.setQueryData(offerCouponQueryKeys.offers({}), offers);
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(offerCouponQueryKeys.coupons({}))).toEqual(before);
    expect(queryClient.getQueryData(offerCouponQueryKeys.offers({}))).toEqual(offers);
    expect(queryClient.getQueryState(offerCouponQueryKeys.coupons({}))?.isInvalidated).toBe(false);
    expect(result.current.isPending).toBe(false);
  });

  test('404 는 error 로, 빈 목록은 정상 데이터로 구분된다', async () => {
    const notFound = new ApiError('발급 가능한 Offer 없음', {
      code: 'OFFER_NOT_FOUND',
      status: 404,
    });
    const issueCoupon = jest.fn().mockRejectedValue(notFound);
    const { queryClient, wrapper } = await createTestWrapper();
    await queryClient.fetchQuery({
      queryFn: async () => couponPage([]),
      queryKey: offerCouponQueryKeys.coupons({}),
    });

    const { result } = await renderHook(() => useIssueCoupon({ issueCoupon }), { wrapper });

    await act(async () => {
      result.current.issueCoupon(401);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.status).toBe(404);
    // 빈 목록은 error 가 아니라 데이터가 있는 정상 상태다.
    const emptyState = queryClient.getQueryState(offerCouponQueryKeys.coupons({}));
    expect(emptyState?.error).toBeNull();
    expect(emptyState?.status).toBe('success');
    expect((emptyState?.data as CouponPage).coupons).toEqual([]);
  });
});
