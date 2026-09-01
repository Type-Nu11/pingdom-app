import type { ApiClient } from '../../../../shared/api';
import { createOfferCouponApi } from '../offerCouponApi';

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

const serverPage = {
  coupons: [
    {
      benefitDescription: '음료 1잔 무료',
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      expiresAt: '2026-09-30T23:59:59',
      id: 1,
      issuedAt: '2026-08-10T09:00:00',
      offerId: 7,
      offerTitle: '관광객 웰컴 음료',
      placeId: 3,
      placeName: '핑덤 카페',
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

describe('offerCouponApi.getCoupon', () => {
  test('couponId로 단건 조회 경로를 호출하고 AbortSignal을 전달한다', async () => {
    const get = jest.fn().mockResolvedValue(serverPage.coupons[0]);
    const api = createOfferCouponApi(fakeClient({ get }));
    const signal = new AbortController().signal;

    const coupon = await api.getCoupon(1, signal);

    expect(get).toHaveBeenCalledWith('/coupons/1', { signal });
    expect(coupon.status).toBe('ISSUED');
  });
});
