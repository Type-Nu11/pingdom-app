import React from 'react';
import { act, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../../../../shared/api';
import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
import { offerCouponApi, type Coupon, type Offer } from '../../api/offerCouponApi';
import { registerOfferCouponResources } from '../../i18n/offerCouponResources';
import PlaceCouponOffers from '../PlaceCouponOffers';

async function renderOffers(ui: React.ReactElement) {
  const i18n = await createTestI18n('ko');
  registerOfferCouponResources(i18n);
  return renderWithProviders(ui, { i18n });
}

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    benefitDescription: '음료 1잔 무료',
    couponValidityDays: 30,
    description: '관광객 웰컴 혜택',
    eligibilityPolicy: 'ACTIVE_TRAVEL_SCHEDULE',
    endsAt: '2026-09-30T23:59:59',
    id: 7,
    inventoryPolicy: 'LIMITED',
    placeId: 100,
    remainingQuantity: 3,
    startsAt: '2026-09-01T09:00:00',
    status: 'PUBLISHED',
    title: '웰컴 음료 쿠폰',
    ...overrides,
  };
}

function offerPage(offers: Offer[]) {
  return {
    hasNext: false,
    limit: 20,
    offers,
    page: 1,
    totalElements: offers.length,
    totalPages: 1,
  };
}

function issuedCoupon(): Coupon {
  return {
    code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    expiresAt: '2026-09-30T23:59:59',
    id: 1,
    issuedAt: '2026-09-01T09:00:00',
    offerId: 7,
    redeemedAt: null,
    status: 'ISSUED',
  };
}

describe('PlaceCouponOffers', () => {
  test('placeId로 Offer를 조회하고 서버 순서를 유지해 조건·기간·재고를 표시한다', async () => {
    const listOffers = jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(
      offerPage([
        offer({ id: 8, title: '첫 번째 Offer' }),
        offer({ id: 7, inventoryPolicy: 'UNLIMITED', remainingQuantity: null, title: '두 번째 Offer' }),
      ]),
    );

    await renderOffers(<PlaceCouponOffers placeId={100} />);

    await waitFor(() => expect(screen.getByText('첫 번째 Offer')).toBeTruthy());
    expect(listOffers).toHaveBeenCalledWith(
      { limit: 20, placeId: 100 },
      expect.anything(),
    );
    expect(screen.getAllByTestId(/v2-place-coupon-offer-/).map((node) => node.props.testID))
      .toEqual(['v2-place-coupon-offer-8', 'v2-place-coupon-offer-7']);
    expect(screen.getByText('3개 남음')).toBeTruthy();
    expect(screen.getByText('수량 제한 없음')).toBeTruthy();
    expect(screen.getAllByText('진행 중인 여행 일정이 필요합니다')).toHaveLength(2);
  });

  test('정상 빈 Offer 목록은 오류가 아닌 빈 상태다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([]));

    await renderOffers(<PlaceCouponOffers placeId={100} />);

    await waitFor(() => expect(screen.getByText('발급 가능한 Offer가 없습니다')).toBeTruthy());
    expect(screen.queryByText('다시 시도')).toBeNull();
  });

  test('Offer 조회 401은 기존 로그인 복구 CTA로 연결한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockRejectedValue(
      new ApiError('token leaked', { code: 'TOKEN_EXPIRED', status: 401 }),
    );
    const onSignIn = jest.fn();
    const { user } = await renderOffers(
      <PlaceCouponOffers onSignIn={onSignIn} placeId={100} />,
    );

    await waitFor(() => expect(screen.getByText('로그인이 필요합니다')).toBeTruthy());
    await user.press(screen.getByText('다시 로그인'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('token leaked')).toBeNull();
  });

  test('발급 중 빠른 연속 탭에도 같은 Offer를 한 번만 요청한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([offer()]));
    let resolveIssue: ((coupon: Coupon) => void) | undefined;
    const issueCoupon = jest.spyOn(offerCouponApi, 'issueCoupon').mockImplementation(
      () => new Promise((resolve) => { resolveIssue = resolve; }),
    );
    const { user } = await renderOffers(<PlaceCouponOffers placeId={100} />);

    await waitFor(() => expect(screen.getByText('웰컴 음료 쿠폰')).toBeTruthy());
    const issueButton = screen.getByTestId('v2-place-coupon-issue-7');
    await user.press(issueButton);
    await user.press(issueButton);
    expect(issueCoupon).toHaveBeenCalledTimes(1);
    expect(issueCoupon).toHaveBeenCalledWith(7);

    await act(async () => resolveIssue?.(issuedCoupon()));
    await waitFor(() => expect(screen.getByText('쿠폰을 발급했습니다')).toBeTruthy());
  });

  test('코드 없는 발급 409는 원인을 단정하지 않고 보관함 확인을 제공한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([offer()]));
    jest.spyOn(offerCouponApi, 'issueCoupon').mockRejectedValue(
      new ApiError('server detail', { status: 409 }),
    );
    const onViewWallet = jest.fn();
    const { user } = await renderOffers(
      <PlaceCouponOffers onViewWallet={onViewWallet} placeId={100} />,
    );

    await waitFor(() => expect(screen.getByTestId('v2-place-coupon-issue-7')).toBeTruthy());
    await user.press(screen.getByTestId('v2-place-coupon-issue-7'));
    await waitFor(() => expect(screen.getByText('발급하지 못했습니다')).toBeTruthy());
    expect(screen.queryByText(/품절|만료|중복/)).toBeNull();
    await user.press(screen.getByText('보관함 확인'));
    expect(onViewWallet).toHaveBeenCalledTimes(1);
  });
});
