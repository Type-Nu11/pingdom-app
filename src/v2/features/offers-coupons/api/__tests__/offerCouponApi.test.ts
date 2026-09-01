import type { ApiClient } from '../../../../shared/api';
import { createOfferCouponApi } from '../offerCouponApi';

function fakeClient(getImpl: ApiClient['get']): ApiClient {
  return {
    delete: jest.fn(),
    get: getImpl,
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  } as unknown as ApiClient;
}

describe('offerCouponApi.listCoupons', () => {
  test('status와 발급일 필터를 그대로 쿼리로 전달한다', async () => {
    const get = jest.fn().mockResolvedValue({
      coupons: [], hasNext: false, limit: 20, page: 1, totalElements: 0, totalPages: 0,
    });
    const api = createOfferCouponApi(fakeClient(get));

    await api.listCoupons({
      issuedFrom: '2026-08-01T00:00:00',
      issuedTo: '2026-08-31T23:59:59',
      limit: 20,
      page: 2,
      status: 'ISSUED',
    });

    expect(get).toHaveBeenCalledWith('/coupons', expect.objectContaining({
      params: {
        issuedFrom: '2026-08-01T00:00:00',
        issuedTo: '2026-08-31T23:59:59',
        limit: 20,
        page: 2,
        status: 'ISSUED',
      },
    }));
  });

  test('실서버 totalElements를 totalCount로 정규화한다', async () => {
    const api = createOfferCouponApi(fakeClient(jest.fn().mockResolvedValue({
      coupons: [{ id: 1 }],
      hasNext: true,
      limit: 20,
      page: 1,
      totalElements: 42,
      totalPages: 3,
    })));

    const pageResult = await api.listCoupons();

    expect(pageResult.totalCount).toBe(42);
    expect(pageResult.hasNext).toBe(true);
    expect(pageResult.totalPages).toBe(3);
  });

  test('페이지 봉투가 누락돼도 안전한 기본값을 채운다', async () => {
    const api = createOfferCouponApi(fakeClient(jest.fn().mockResolvedValue({ coupons: [] })));

    const pageResult = await api.listCoupons({ limit: 10, page: 1 });

    expect(pageResult).toMatchObject({
      coupons: [],
      hasNext: false,
      limit: 10,
      page: 1,
      totalCount: 0,
      totalPages: 1,
    });
  });
});

describe('offerCouponApi.getCoupon', () => {
  const coupon = (id: number) => ({
    benefitDescription: null,
    code: `code-${id}`,
    expiresAt: '2027-08-18T00:00:00Z',
    id,
    issuedAt: '2026-08-18T00:00:00Z',
    offerId: 401,
    offerTitle: null,
    placeId: null,
    placeName: null,
    redeemedAt: null,
    status: 'ISSUED',
  });

  test('단건 엔드포인트가 없으므로 목록에서 찾아 반환한다', async () => {
    const get = jest.fn().mockResolvedValue({
      coupons: [coupon(500), coupon(501)], hasNext: false, limit: 100, page: 1,
      totalElements: 2, totalPages: 1,
    });
    const api = createOfferCouponApi(fakeClient(get));

    const found = await api.getCoupon(501);

    expect(found.id).toBe(501);
    expect(get).toHaveBeenCalledWith('/coupons', expect.objectContaining({
      params: { limit: 100, page: 1 },
    }));
    expect(get).toHaveBeenCalledTimes(1);
  });

  test('첫 페이지에 없으면 hasNext를 따라 다음 페이지를 본다', async () => {
    const get = jest.fn()
      .mockResolvedValueOnce({
        coupons: [coupon(500)], hasNext: true, limit: 100, page: 1, totalElements: 2, totalPages: 2,
      })
      .mockResolvedValueOnce({
        coupons: [coupon(777)], hasNext: false, limit: 100, page: 2, totalElements: 2, totalPages: 2,
      });
    const api = createOfferCouponApi(fakeClient(get));

    const found = await api.getCoupon(777);

    expect(found.id).toBe(777);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenLastCalledWith('/coupons', expect.objectContaining({
      params: { limit: 100, page: 2 },
    }));
  });

  test('목록에 없으면 404 ApiError로 알린다', async () => {
    const get = jest.fn().mockResolvedValue({
      coupons: [coupon(500)], hasNext: false, limit: 100, page: 1, totalElements: 1, totalPages: 1,
    });
    const api = createOfferCouponApi(fakeClient(get));

    await expect(api.getCoupon(999)).rejects.toMatchObject({
      code: 'COUPON_NOT_FOUND',
      status: 404,
    });
  });

  test('hasNext가 계속 true여도 페이지 순회를 무한히 하지 않는다', async () => {
    const get = jest.fn().mockResolvedValue({
      coupons: [coupon(500)], hasNext: true, limit: 100, page: 1, totalElements: 9999, totalPages: 99,
    });
    const api = createOfferCouponApi(fakeClient(get));

    await expect(api.getCoupon(999)).rejects.toMatchObject({ status: 404 });
    expect(get).toHaveBeenCalledTimes(20);
  });
});
