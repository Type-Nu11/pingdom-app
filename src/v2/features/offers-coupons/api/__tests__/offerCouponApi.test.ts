import { ApiError, type ApiClient } from '../../../../shared/api';
import { createOfferCouponApi, type Coupon } from '../offerCouponApi';

function fakeClient(overrides: Partial<ApiClient>): ApiClient {
  return {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    ...overrides,
  } as unknown as ApiClient;
}

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

const serverPage = {
  coupons: [
    {
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      expiresAt: '2026-09-30T23:59:59',
      id: 1,
      issuedAt: '2026-08-10T09:00:00',
      offerId: 7,
      redeemedAt: null,
      status: 'ISSUED',
    },
  ],
  hasNext: true,
  limit: 20,
  page: 1,
  totalElements: 42,
  totalPages: 3,
};

describe('offerCouponApi.listCoupons', () => {
  test('status와 발급일 기간 필터, pagination을 그대로 쿼리로 전달한다', async () => {
    const get = jest.fn().mockResolvedValue(serverPage);
    const api = createOfferCouponApi(fakeClient({ get }));
    const signal = new AbortController().signal;

    await api.listCoupons(
      {
        issuedFrom: '2026-08-01T00:00:00',
        issuedTo: '2026-08-31T23:59:59',
        limit: 20,
        page: 2,
        status: 'ISSUED',
      },
      signal,
    );

    expect(get).toHaveBeenCalledWith('/coupons', {
      params: {
        issuedFrom: '2026-08-01T00:00:00',
        issuedTo: '2026-08-31T23:59:59',
        limit: 20,
        page: 2,
        status: 'ISSUED',
      },
      signal,
    });
  });

  test('서버 페이지 봉투(totalElements/totalPages/hasNext)를 그대로 반환한다', async () => {
    const api = createOfferCouponApi(fakeClient({ get: jest.fn().mockResolvedValue(serverPage) }));

    const pageResult = await api.listCoupons();

    expect(pageResult).toEqual(serverPage);
    expect(pageResult.totalElements).toBe(42);
    expect(pageResult.hasNext).toBe(true);
    expect(pageResult.totalPages).toBe(3);
  });

  test('파라미터를 생략하면 빈 쿼리로 호출한다', async () => {
    const get = jest.fn().mockResolvedValue(serverPage);
    const api = createOfferCouponApi(fakeClient({ get }));

    await api.listCoupons();

    expect(get).toHaveBeenCalledWith('/coupons', { params: {}, signal: undefined });
  });
});

describe('offerCouponApi.issueCoupon', () => {
  test('전달받은 offerId 로 body 없이 POST 하고 signal 을 넘긴다', async () => {
    const post = jest.fn().mockResolvedValue(coupon({ offerId: 777 }));
    const api = createOfferCouponApi(fakeClient({ post }));
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
    const api = createOfferCouponApi(fakeClient({ post }));

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
    const api = createOfferCouponApi(fakeClient({ post }));

    const request = api.issueCoupon(401);

    await expect(request).rejects.toMatchObject({ code, status });
    expect(post).toHaveBeenCalledTimes(1);
  });
});
