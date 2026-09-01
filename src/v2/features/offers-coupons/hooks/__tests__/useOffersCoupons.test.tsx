import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type CouponPage } from '../../api/offerCouponApi';
import { createInfiniteCouponsQueryOptions, useInfiniteCoupons } from '../useOffersCoupons';

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
