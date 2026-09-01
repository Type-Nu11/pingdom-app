import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../../../../shared/api';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type Coupon } from '../../../offers-coupons';
import { placeDetailApi } from '../../../place-detail';
import CouponDetailContainer from '../CouponDetailContainer';

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    expiresAt: '2027-08-18T23:59:59',
    id: 1,
    issuedAt: '2026-08-18T09:00:00',
    offerId: 10,
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  };
}

function offer() {
  return {
    benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
    couponValidityDays: 30,
    description: '매장 방문 · 핑덤 예약 전용',
    eligibilityPolicy: 'ACTIVE_TRAVEL_SCHEDULE',
    endsAt: '2027-08-18T23:59:59',
    id: 10,
    placeId: 100,
    startsAt: '2026-08-18T09:00:00',
    title: '생일 10% 할인 쿠폰',
  } as const;
}

function mockResources(couponValue: Coupon = coupon()) {
  jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({
    coupons: [couponValue],
    hasNext: false,
    limit: 100,
    page: 1,
    totalElements: 1,
    totalPages: 1,
  });
  jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());
  jest.spyOn(placeDetailApi, 'getPlaceDetail').mockResolvedValue({
    id: 100,
    name: '대성반점',
  } as never);
}

describe('CouponDetailContainer', () => {
  test('목록에서 받은 쿠폰과 Offer·Place 조회로 상세를 그린다', async () => {
    mockResources();

    await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(offerCouponApi.getOffer).toHaveBeenCalledWith(10, expect.anything());
    expect(placeDetailApi.getPlaceDetail).toHaveBeenCalledWith(100, expect.anything());
    await waitFor(() => expect(screen.getAllByText('대성반점')).toHaveLength(2));
    expect(screen.getByText('4만원 이상 결제 시, 최대 10% 할인')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-qr')).toBeTruthy();
    // 매장 사용 처리 API가 대시 포함 UUID를 요구하므로, 화면 코드도 원본 그대로 읽혀야 한다.
    const codeText = screen.getByTestId('v2-coupon-qr-code');
    expect(codeText).toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
    // 스크린리더 라벨은 전체 코드를 읽지 않고 끝 네 자리만 알려준다.
    expect(codeText.props.accessibilityLabel).toBe('쿠폰 코드, 끝 네 자리 AFA6');
    expect(codeText.props.accessibilityLabel).not.toContain('3FA85F64');
  });

  test('쿠폰 정보 행을 상점주가 등록한 Offer 값으로 채운다', async () => {
    mockResources();

    await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(screen.getByText('사용 가능 매장')).toBeTruthy();
    expect(screen.getByText('매장 방문 · 핑덤 예약 전용')).toBeTruthy();
    expect(screen.getByText('2026.08.18(화) ~ 2027.08.18(수)')).toBeTruthy();
    expect(screen.getByText('발급 후 30일')).toBeTruthy();
    expect(screen.getByText('진행 중인 여행 일정이 있는 계정')).toBeTruthy();
  });

  test('종료된 Offer를 조회할 수 없어도 lifecycle과 QR은 유지한다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({
      coupons: [coupon()], hasNext: false, limit: 100, page: 1, totalElements: 1, totalPages: 1,
    });
    jest.spyOn(offerCouponApi, 'getOffer').mockRejectedValue(new Error('404'));

    await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-qr')).toBeTruthy());
    expect(screen.getByText('쿠폰')).toBeTruthy();
    expect(screen.queryByText('사용 가능 매장')).toBeNull();
    expect(screen.queryByText('행사 기간')).toBeNull();
    expect(screen.queryByTestId('v2-coupon-detail-reserve')).toBeNull();
  });

  test('ISSUED 쿠폰은 예약 CTA로 Offer의 placeId를 넘긴다', async () => {
    mockResources();
    const onReserve = jest.fn();
    const { user } = await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={onReserve} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-reserve')).toBeTruthy());
    await user.press(screen.getByTestId('v2-coupon-detail-reserve'));
    expect(onReserve).toHaveBeenCalledWith(100);
  });

  test('REDEEMED 쿠폰은 QR을 감추고 사용 시각을 알려준다', async () => {
    mockResources(coupon({ redeemedAt: '2026-08-20T15:00:00', status: 'REDEEMED' }));
    await renderWithProviders(
      <CouponDetailContainer
        couponId={1}
        onBack={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(screen.getByTestId('v2-coupon-detail-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
    expect(screen.queryByTestId('v2-coupon-detail-reserve')).toBeNull();
  });

  test('EXPIRED 쿠폰도 QR을 감추고 쿠폰 정보는 유지한다', async () => {
    mockResources(coupon({ status: 'EXPIRED' }));
    await renderWithProviders(
      <CouponDetailContainer
        couponId={1}
        onBack={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(screen.getByTestId('v2-coupon-detail-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
    expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy();
  });

  test('redeemedAt이 없어도 사용 완료 안내를 보여준다', async () => {
    mockResources(coupon({ redeemedAt: null, status: 'REDEEMED' }));
    await renderWithProviders(
      <CouponDetailContainer
        couponId={1}
        onBack={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('이미 사용한 쿠폰이에요')).toBeTruthy());
  });

  test('장소 조회가 실패하면 매장명을 지어내지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({
      coupons: [coupon()], hasNext: false, limit: 100, page: 1, totalElements: 1, totalPages: 1,
    });
    jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockRejectedValue(new Error('404'));

    await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(screen.queryByText('사용 가능 매장')).toBeNull();
  });

  test('couponId를 최신 목록에서 찾지 못하면 조회 오류를 표시한다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({
      coupons: [], hasNext: false, limit: 100, page: 1, totalElements: 0, totalPages: 1,
    });

    await renderWithProviders(
      <CouponDetailContainer couponId={404} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('쿠폰 정보를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
  });

  test('최신 상태 조회 네트워크 오류는 오래된 QR 대신 재시도를 제공한다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockRejectedValue(
      new ApiError('offline detail', { isNetworkError: true }),
    );

    const { user } = await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('연결에 문제가 있습니다')).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
    expect(screen.queryByText('offline detail')).toBeNull();
    await user.press(screen.getByText('다시 시도'));
    expect(offerCouponApi.listCoupons).toHaveBeenCalledTimes(2);
  });

  test('최신 상태 조회 401은 로그인 복구 CTA로 연결한다', async () => {
    jest.spyOn(offerCouponApi, 'listCoupons').mockRejectedValue(
      new ApiError('expired token detail', { code: 'TOKEN_EXPIRED', status: 401 }),
    );
    const onSignIn = jest.fn();
    const { user } = await renderWithProviders(
      <CouponDetailContainer
        couponId={1}
        onBack={jest.fn()}
        onReserve={jest.fn()}
        onSignIn={onSignIn}
      />,
    );

    await waitFor(() => expect(screen.getByText('로그인이 필요합니다')).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
    expect(screen.queryByText('expired token detail')).toBeNull();
    await user.press(screen.getByText('다시 로그인'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  test('영어 locale에서 QR 안내와 만료 시각을 표시한다', async () => {
    mockResources(coupon({ status: 'EXPIRED' }));

    await renderWithProviders(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
      { language: 'en' },
    );

    await waitFor(() => expect(screen.getByText(/This coupon expired on/)).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-qr')).toBeNull();
  });
});
