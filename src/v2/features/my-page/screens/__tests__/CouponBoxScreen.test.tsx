import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type CouponPage } from '../../../offers-coupons/api/offerCouponApi';
import CouponBoxScreen from '../CouponBoxScreen';

type CouponInput = {
  id: number;
  offerId?: number;
  status?: 'ISSUED' | 'REDEEMED' | 'EXPIRED';
  issuedAt?: string;
  expiresAt?: string;
  redeemedAt?: string | null;
};

function couponPage(coupons: CouponInput[], overrides: Partial<CouponPage> = {}): CouponPage {
  return {
    coupons: coupons.map((coupon) => ({
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      expiresAt: '2027-08-18T23:59:59',
      issuedAt: '2026-08-18T09:00:00',
      offerId: 10,
      redeemedAt: null,
      status: 'ISSUED',
      ...coupon,
    })),
    hasNext: false,
    limit: 20,
    page: 1,
    totalCount: coupons.length,
    totalPages: 1,
    ...overrides,
  } as CouponPage;
}

function offer(id: number, title: string) {
  return { benefitDescription: '4만원 이상 결제 시, 최대 10% 할인', id, placeId: 100, title } as never;
}

describe('CouponBoxScreen', () => {
  test('쿠폰이 없으면 빈 보관함을 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue(couponPage([]));

    await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('보유한 쿠폰이 없어요')).toBeTruthy());
  });

  test('조회 오류는 빈 보관함이 아니라 오류와 재시도로 표시한다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockRejectedValue(new Error('실패'));

    await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('쿠폰을 불러오지 못했어요.')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();
    expect(screen.queryByText('보유한 쿠폰이 없어요')).toBeNull();
  });

  test('ISSUED는 사용 CTA, REDEEMED는 사용 불가 문구를 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue(
      couponPage([
        { id: 1, offerId: 10, status: 'ISSUED' },
        { id: 2, offerId: 20, status: 'REDEEMED', redeemedAt: '2026-08-20T15:00:00' },
      ]),
    );
    jest.spyOn(offerCouponApi, 'getOffer').mockImplementation(async (offerId) =>
      offer(offerId, offerId === 10 ? '생일 할인 쿠폰' : '가입 축하 쿠폰'));

    await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} onUseCoupon={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('생일 할인 쿠폰')).toBeTruthy());
    expect(screen.getByTestId('v2-coupon-card-use')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-card-unusable')).toBeTruthy();
    expect(screen.getAllByTestId('v2-coupon-card-use')).toHaveLength(1);
    // 전체 코드는 목록에 노출하지 않는다.
    expect(screen.queryByText('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBeNull();
  });

  test('상태 탭을 누르면 해당 status로 다시 조회한다', async () => {
    const listCoupons = jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue(couponPage([]));

    const { user } = await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('보유한 쿠폰이 없어요')).toBeTruthy());

    await user.press(screen.getByText('사용 완료'));

    await waitFor(() => expect(listCoupons).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REDEEMED' }),
      expect.anything(),
    ));
    await waitFor(() => expect(screen.getByText('사용 완료한 쿠폰이 없어요')).toBeTruthy());
  });

  test('카드를 누르면 상세로 넘길 수 있게 쿠폰 전체를 넘긴다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue(
      couponPage([{ id: 7, offerId: 10 }]),
    );
    jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer(10, '생일 할인 쿠폰'));
    const onOpenCoupon = jest.fn();

    const { user } = await renderWithProviders(
      <CouponBoxScreen onBack={jest.fn()} onOpenCoupon={onOpenCoupon} />,
    );
    await waitFor(() => expect(screen.getByText('생일 할인 쿠폰')).toBeTruthy());

    await user.press(screen.getByTestId('v2-coupon-card'));

    // 상세 화면은 code/status/일자까지 필요하므로 id만이 아니라 쿠폰 객체를 넘긴다.
    expect(onOpenCoupon).toHaveBeenCalledWith(expect.objectContaining({
      code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      id: 7,
      offerId: 10,
      status: 'ISSUED',
    }));
  });

  test('다음 페이지가 있으면 끝에 도달할 때 이어서 조회한다', async () => {
    const listCoupons = jest.spyOn(offerCouponApi, 'listCoupons').mockImplementation(
      async (params) => couponPage(
        [{ id: params?.page === 2 ? 99 : 1, offerId: 10 }],
        { hasNext: params?.page !== 2, page: params?.page ?? 1, totalPages: 2 },
      ),
    );
    jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer(10, '쿠폰 A'));

    await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId('v2-coupon-box-list')).toBeTruthy());

    fireEvent(screen.getByTestId('v2-coupon-box-list'), 'onEndReached');

    await waitFor(() => expect(listCoupons).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.anything(),
    ));
  });

  test('다음 페이지가 실패하면 끝에 다시 닿아도 같은 요청을 반복하지 않는다', async () => {
    const listCoupons = jest.spyOn(offerCouponApi, 'listCoupons').mockImplementation(
      async (params) => {
        if (params?.page === 2) throw new Error('실패');
        return couponPage([{ id: 1, offerId: 10 }], { hasNext: true, page: 1, totalPages: 2 });
      },
    );
    jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer(10, '쿠폰 A'));

    await renderWithProviders(<CouponBoxScreen onBack={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId('v2-coupon-box-list')).toBeTruthy());

    fireEvent(screen.getByTestId('v2-coupon-box-list'), 'onEndReached');
    await waitFor(() => expect(screen.getByText('쿠폰을 더 불러오지 못했어요.')).toBeTruthy());

    const callsAfterFailure = listCoupons.mock.calls.length;
    fireEvent(screen.getByTestId('v2-coupon-box-list'), 'onEndReached');
    fireEvent(screen.getByTestId('v2-coupon-box-list'), 'onEndReached');

    // 실패 후에는 자동 재요청 없이 명시적 재시도 버튼만 남는다.
    expect(listCoupons.mock.calls).toHaveLength(callsAfterFailure);
    expect(screen.getByText('더 불러오기')).toBeTruthy();
  });
});
