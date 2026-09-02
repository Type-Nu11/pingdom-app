import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type Offer, type OfferPage } from '../../../offers-coupons/api/offerCouponApi';
import { placeDetailApi } from '../..';
import PlaceDetailScreen from '../../screens/PlaceDetailScreen';

const PLACE_ID = 100;

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    benefitDescription: '음료 1잔 무료',
    couponValidityDays: 7,
    eligibilityPolicy: 'PUBLIC',
    endsAt: '2099-12-31T23:59:59',
    expiryPolicy: 'OFFER_END',
    id: 1,
    inventoryPolicy: 'UNLIMITED',
    issuedQuantity: 0,
    placeId: PLACE_ID,
    remainingQuantity: null,
    startsAt: '2020-01-01T00:00:00',
    status: 'PUBLISHED',
    title: '관광객 웰컴 음료',
    totalQuantity: null,
    ...overrides,
  };
}

function offerPage(offers: Offer[]): OfferPage {
  return {
    hasNext: false,
    limit: 1,
    offers,
    page: 1,
    totalElements: offers.length,
    totalPages: 1,
  };
}

function renderPlaceDetail() {
  const navigation = { goBack: jest.fn() } as never;
  const route = { params: { placeId: PLACE_ID } } as never;

  return renderWithProviders(<PlaceDetailScreen navigation={navigation} route={route} />);
}

describe('place detail coupon CTA', () => {
  beforeEach(() => {
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockResolvedValue({
      address: '대구광역시 중구',
      id: PLACE_ID,
      name: '대성반점',
      operatingStatus: 'OPEN',
    } as never);
  });

  test('발급 가능한 Offer는 발급 CTA와 정책 문구를 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([offer()]));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByTestId('v2-place-offer-cta')).toBeTruthy());
    expect(screen.getByText('쿠폰 받기')).toBeTruthy();
    expect(screen.getByText('음료 1잔 무료')).toBeTruthy();
    expect(screen.getByTestId('v2-place-offer-remaining')).toHaveTextContent('수량 제한 없음');
    expect(screen.getByText('누구나')).toBeTruthy();
    expect(screen.getByText(/발급 후 7일 이내 사용/)).toBeTruthy();
  });

  test('상태 배지는 색과 함께 읽히는 텍스트 레이블을 제공한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([offer()]));

    await renderPlaceDetail();

    // The accessible name is the status copy alone; no tone glyph leaks into it.
    await waitFor(() => expect(screen.getByLabelText('받을 수 있음')).toBeTruthy());
  });

  test('서버가 보고한 품절은 CTA 문구로 구분한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: 0, totalQuantity: 30 }),
    ]));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByText('수량 모두 소진')).toBeTruthy());
    expect(screen.queryByText('쿠폰 받기')).toBeNull();
  });

  test('LIMITED 재고의 남은 수량이 null이면 품절로 읽지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: null, totalQuantity: 30 }),
    ]));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByText('쿠폰 받기')).toBeTruthy());
    expect(screen.getByTestId('v2-place-offer-remaining')).toHaveTextContent('남은 수량 미제공');
  });

  test('남은 수량이 있으면 수치를 그대로 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: 4, totalQuantity: 30 }),
    ]));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByTestId('v2-place-offer-remaining'))
      .toHaveTextContent('4개 남음'));
  });

  test('발급 가능한 Offer가 없으면 CTA를 렌더링하지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([]));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByText('대성반점')).toBeTruthy());
    expect(screen.queryByTestId('v2-place-offer-cta')).toBeNull();
  });

  test('Offer 조회 실패는 장소 상세를 막지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockRejectedValue(new Error('실패'));

    await renderPlaceDetail();

    await waitFor(() => expect(screen.getByText('대성반점')).toBeTruthy());
    expect(screen.queryByTestId('v2-place-offer-cta')).toBeNull();
  });
});
