import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
import { ApiError } from '../../../../shared/api';
import {
  offerCouponApi,
  registerOfferCouponResources,
  type Coupon,
} from '../../../offers-coupons';
import CouponDetailContainer from '../CouponDetailContainer';

async function renderCouponDetail(ui: React.ReactElement) {
  const i18n = await createTestI18n('ko');
  registerOfferCouponResources(i18n);
  return renderWithProviders(ui, { i18n });
}

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
    code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    expiresAt: '2027-08-18T23:59:59',
    id: 1,
    issuedAt: '2026-08-18T09:00:00',
    offerId: 10,
    offerTitle: '생일 10% 할인 쿠폰',
    placeId: 100,
    placeName: '대성반점',
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  } as Coupon;
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
  } as never;
}

function mockCoupon(overrides: Partial<Coupon> = {}) {
  jest.spyOn(offerCouponApi, 'getCoupon').mockResolvedValue(coupon(overrides));
  jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());
}

describe('CouponDetailContainer', () => {
  test('쿠폰 응답 전에는 존재하지 않는 offerId로 조회하지 않는다', async () => {
    let resolveCoupon: ((value: Coupon) => void) | undefined;
    jest.spyOn(offerCouponApi, 'getCoupon').mockImplementation(() => new Promise((resolve) => {
      resolveCoupon = resolve;
    }));
    const getOffer = jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    expect(getOffer).not.toHaveBeenCalled();
    resolveCoupon?.(coupon());
    await waitFor(() => expect(getOffer).toHaveBeenCalledWith(10, expect.anything()));
    expect(getOffer).not.toHaveBeenCalledWith(0, expect.anything());
  });

  test('쿠폰 조회가 알 수 없는 오류면 재시도로 표시한다', async () => {
    jest.spyOn(offerCouponApi, 'getCoupon').mockRejectedValue(new Error('실패'));

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('요청을 처리하지 못했습니다')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  test('내 쿠폰이 아니거나 사라진 쿠폰(404)은 목록으로 돌아가기로 안내한다', async () => {
    jest.spyOn(offerCouponApi, 'getCoupon').mockRejectedValue(
      new ApiError('not found', { status: 404, code: 'COUPON_NOT_FOUND' }),
    );
    const onBack = jest.fn();

    const { user } = await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={onBack} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('항목을 찾을 수 없습니다')).toBeTruthy());
    expect(screen.queryByText('다시 시도')).toBeNull();
    await user.press(screen.getByText('뒤로 가기'));
    expect(onBack).toHaveBeenCalled();
  });

  test('매장명·쿠폰명·혜택·기간과 바코드를 보여준다', async () => {
    mockCoupon();

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    // 티켓 헤더와 "사용 가능 매장" 행 양쪽에 매장명이 나온다.
    expect(screen.getAllByText('대성반점')).toHaveLength(2);
    expect(screen.getByText('4만원 이상 결제 시, 최대 10% 할인')).toBeTruthy();
    expect(screen.getByText('결제 전 매장 직원에게 바코드를 보여주세요')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-barcode')).toBeTruthy();
    // 매장 사용 처리 API가 대시 포함 UUID를 요구하므로, 화면 코드도 원본 그대로 읽혀야 한다.
    expect(screen.getByTestId('v2-coupon-barcode-code'))
      .toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
  });

  test('쿠폰 정보 행을 상점주가 등록한 offer 값으로 채운다', async () => {
    mockCoupon();

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('쿠폰 정보')).toBeTruthy());
    expect(screen.getByText('사용 가능 매장')).toBeTruthy();
    expect(screen.getByText('매장 방문 · 핑덤 예약 전용')).toBeTruthy();
    // 행사 기간은 offer의 startsAt~endsAt이고 요일까지 붙는다.
    expect(screen.getByText('2026.08.18(화) ~ 2027.08.18(수)')).toBeTruthy();
    expect(screen.getByText('발급 후 30일')).toBeTruthy();
    expect(screen.getByText('진행 중인 여행 일정이 있는 계정')).toBeTruthy();
    expect(screen.getByText('유의사항')).toBeTruthy();
  });

  test('서버가 값을 주지 않은 행은 지어내지 않고 아예 빼버린다', async () => {
    jest.spyOn(offerCouponApi, 'getCoupon').mockResolvedValue(coupon({ placeName: null }));
    // 상점주가 offer를 종료하면 /offers/{id}가 404다. 부가 행만 빠져야 한다.
    jest.spyOn(offerCouponApi, 'getOffer').mockRejectedValue(new Error('404'));

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('쿠폰 정보')).toBeTruthy());
    expect(screen.queryByText('사용 가능 매장')).toBeNull();
    expect(screen.queryByText('사용처')).toBeNull();
    expect(screen.queryByText('행사 기간')).toBeNull();
    expect(screen.queryByText('발급 대상')).toBeNull();
  });

  test('유의사항 번역이 없어도 화면이 죽지 않는다', async () => {
    mockCoupon();

    // 번역이 비면 i18next가 키 문자열을 그대로 돌려주므로 배열이 아닐 수 있다.
    const { i18n } = await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );
    i18n.addResourceBundle('ko', 'translation', {
      myPage: { couponDetail: { notices: undefined } },
    }, true, true);

    await waitFor(() => expect(screen.getByText('유의사항')).toBeTruthy());
    expect(screen.getByText('쿠폰 정보')).toBeTruthy();
  });

  test('ISSUED 쿠폰은 예약 CTA로 offer의 placeId를 넘긴다', async () => {
    mockCoupon();
    const onReserve = jest.fn();

    const { user } = await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={onReserve} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-reserve')).toBeTruthy());
    await user.press(screen.getByTestId('v2-coupon-detail-reserve'));

    expect(onReserve).toHaveBeenCalledWith(100);
  });

  test('REDEEMED 쿠폰은 바코드를 감추고 사용 시각을 알려준다', async () => {
    mockCoupon({ redeemedAt: '2026-08-20T15:00:00', status: 'REDEEMED' });

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-unavailable')).toBeTruthy());
    // 이미 쓴 쿠폰을 매장에 제시할 수 없어야 한다.
    expect(screen.queryByTestId('v2-coupon-barcode')).toBeNull();
    expect(screen.queryByTestId('v2-coupon-barcode-code')).toBeNull();
    expect(screen.queryByText('결제 전 매장 직원에게 바코드를 보여주세요')).toBeNull();
    expect(screen.queryByTestId('v2-coupon-detail-reserve')).toBeNull();
  });

  test('EXPIRED 쿠폰도 바코드를 감추고 만료 시각을 알려준다', async () => {
    mockCoupon({ status: 'EXPIRED' });

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-unavailable')).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-barcode')).toBeNull();
    // 어떤 쿠폰이었는지는 계속 보여준다.
    expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy();
  });

  test('redeemedAt이 없어도 사용 완료 안내를 보여준다', async () => {
    mockCoupon({ redeemedAt: null, status: 'REDEEMED' });

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('이미 사용한 쿠폰이에요')).toBeTruthy());
  });

  test('매장명이 없으면 지어내지 않고 그 줄을 빼버린다', async () => {
    mockCoupon({ placeName: null });

    await renderCouponDetail(
      <CouponDetailContainer couponId={1} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    // 매장명을 모르면 티켓 헤더의 매장 줄은 아예 그리지 않고, 쿠폰명 하나만 남는다.
    await waitFor(() => expect(screen.getAllByText('생일 10% 할인 쿠폰')).toHaveLength(1));
    // 매장명을 지어내지 않으므로 "사용 가능 매장" 행 자체가 사라진다.
    expect(screen.queryByText('사용 가능 매장')).toBeNull();
    expect(screen.queryByText('쿠폰 정보를 불러오지 못했어요.')).toBeNull();
  });
});
