import { ApiError, type ApiClient } from '../../../../shared/api';
import { createOfferCouponApi, type Coupon } from '../offerCouponApi';

function fakeClient(getImpl: ApiClient['get']): ApiClient {
  return {
    delete: jest.fn(),
    get: getImpl,
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  } as unknown as ApiClient;
}

function createClient(overrides: Partial<Record<'get' | 'post', jest.Mock>> = {}) {
  return {
    delete: jest.fn(),
    get: overrides.get ?? jest.fn(),
    patch: jest.fn(),
    post: overrides.post ?? jest.fn(),
    put: jest.fn(),
  };
}

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    benefitDescription: null,
    code: '11111111-1111-4111-8111-111111111111',
    expiresAt: '2026-09-30T23:59:59Z',
    id: 9_001,
    issuedAt: '2026-09-01T09:00:00Z',
    offerId: 401,
    offerTitle: null,
    placeId: null,
    placeName: null,
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  };
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

describe('offerCouponApi.issueCoupon', () => {
  test('전달받은 offerId 로 body 없이 POST 하고 signal 을 넘긴다', async () => {
    const post = jest.fn().mockResolvedValue(coupon({ offerId: 777 }));
    const api = createOfferCouponApi(createClient({ post }));
    const controller = new AbortController();

    const issued = await api.issueCoupon(777, controller.signal);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/offers/777/coupons', undefined, {
      signal: controller.signal,
    });
    expect(issued).toEqual(coupon({ offerId: 777 }));
    expect(issued.status).toBe('ISSUED');
  });

  test('signal 없이 호출해도 offerId 는 그대로 경로에 들어간다', async () => {
    const post = jest.fn().mockResolvedValue(coupon());
    const api = createOfferCouponApi(createClient({ post }));

    await api.issueCoupon(401);

    expect(post).toHaveBeenCalledWith('/offers/401/coupons', undefined, { signal: undefined });
  });

  test.each<[number, string]>([
    [401, 'AUTHENTICATION_FAILED'],
    [403, 'FORBIDDEN'],
    [404, 'OFFER_NOT_FOUND'],
    [409, 'COUPON_ALREADY_ISSUED'],
  ])('%s 응답은 ApiError 로 reject 된다', async (status, code) => {
    const post = jest.fn().mockRejectedValue(new ApiError('발급 실패', { code, status }));
    const api = createOfferCouponApi(createClient({ post }));

    await expect(api.issueCoupon(401)).rejects.toBeInstanceOf(ApiError);
    await expect(api.issueCoupon(401)).rejects.toMatchObject({ code, status });
  });
});
