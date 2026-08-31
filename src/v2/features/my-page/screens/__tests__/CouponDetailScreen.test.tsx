import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type Coupon } from '../../../offers-coupons';
import { placeDetailApi } from '../../../place-detail/api/placeDetailApi';
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
  } as Coupon;
}

function offer() {
  return {
    benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
    description: '매장 방문 전용',
    id: 10,
    placeId: 100,
    title: '생일 10% 할인 쿠폰',
  } as never;
}

function place() {
  return { address: '진주시', id: 100, name: '대성반점', thumbnailUrl: null } as never;
}

function mockOfferAndPlace() {
  jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());
  jest.spyOn(placeDetailApi, 'getPlaceDetail').mockResolvedValue(place());
}

describe('CouponDetailContainer', () => {
  test('offer 조회 실패는 오류와 재시도로 표시한다', async () => {
    jest.spyOn(offerCouponApi, 'getOffer').mockRejectedValue(new Error('실패'));

    await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('쿠폰 정보를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  test('매장명·쿠폰명·혜택·기간과 바코드를 보여준다', async () => {
    mockOfferAndPlace();

    await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={jest.fn()} />,
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

  test('쿠폰 정보 행과 유의사항을 보여준다', async () => {
    mockOfferAndPlace();

    await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    await waitFor(() => expect(screen.getByText('쿠폰 정보')).toBeTruthy());
    expect(screen.getByText('사용 가능 매장')).toBeTruthy();
    expect(screen.getByText('사용처')).toBeTruthy();
    expect(screen.getByText('사용 기간')).toBeTruthy();
    expect(screen.getByText('사용 조건')).toBeTruthy();
    expect(screen.getByText('제외 대상')).toBeTruthy();
    expect(screen.getByText('유의사항')).toBeTruthy();
    expect(screen.getByText('쿠폰은 계정당 1회만 사용할 수 있어요.')).toBeTruthy();
    // 사용 기간 행은 요일까지 붙여 보여준다.
    expect(screen.getByText(/\(화\).*~.*\(수\)/)).toBeTruthy();
  });

  test('유의사항 번역이 없어도 화면이 죽지 않는다', async () => {
    mockOfferAndPlace();

    // 번역이 비면 i18next가 키 문자열을 그대로 돌려주므로 배열이 아닐 수 있다.
    const { i18n } = await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={jest.fn()} />,
    );
    i18n.addResourceBundle('ko', 'translation', {
      myPage: { couponDetail: { notices: undefined } },
    }, true, true);

    await waitFor(() => expect(screen.getByText('유의사항')).toBeTruthy());
    expect(screen.getByText('쿠폰 정보')).toBeTruthy();
  });

  test('ISSUED 쿠폰은 예약 CTA로 offer의 placeId를 넘긴다', async () => {
    mockOfferAndPlace();
    const onReserve = jest.fn();

    const { user } = await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={onReserve} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-reserve')).toBeTruthy());
    await user.press(screen.getByTestId('v2-coupon-detail-reserve'));

    expect(onReserve).toHaveBeenCalledWith(100);
  });

  test('REDEEMED 쿠폰은 예약 CTA 대신 사용 불가 문구를 보여준다', async () => {
    mockOfferAndPlace();

    await renderWithProviders(
      <CouponDetailContainer
        coupon={coupon({ redeemedAt: '2026-08-20T15:00:00', status: 'REDEEMED' })}
        onBack={jest.fn()}
        onReserve={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-coupon-detail-unavailable')).toBeTruthy());
    expect(screen.queryByTestId('v2-coupon-detail-reserve')).toBeNull();
  });

  test('place 조회가 실패해도 화면은 유지하고 매장명을 지어내지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'getOffer').mockResolvedValue(offer());
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockRejectedValue(new Error('실패'));

    await renderWithProviders(
      <CouponDetailContainer coupon={coupon()} onBack={jest.fn()} onReserve={jest.fn()} />,
    );

    // 매장명을 모르면 티켓 헤더의 매장 줄은 아예 그리지 않고, 쿠폰명 하나만 남는다.
    await waitFor(() => expect(screen.getAllByText('생일 10% 할인 쿠폰')).toHaveLength(1));
    // "사용 가능 매장" 행만 안내 문구로 대체한다.
    expect(screen.getByText('가맹 매장')).toBeTruthy();
    expect(screen.queryByText('쿠폰 정보를 불러오지 못했어요.')).toBeNull();
  });
});
