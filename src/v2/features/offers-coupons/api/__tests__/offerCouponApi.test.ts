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
