import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { ApiError } from '../../../../shared/api/ApiError';
import { offerCouponApi } from '../../api/offerCouponApi';
import PlaceCouponCta from '../PlaceCouponCta';

const OFFER = {
  id: 401,
  placeId: 17,
  title: '생일 10% 할인 쿠폰',
  description: '생일인 여행자에게 드리는 할인 쿠폰입니다.',
  benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
  status: 'PUBLISHED',
  startsAt: '2026-08-18T00:00:00Z',
  endsAt: '2027-08-18T00:00:00Z',
  totalQuantity: 100,
  issuedQuantity: 12,
  remainingQuantity: 88,
  couponValidityDays: 365,
  eligibilityPolicy: 'ACTIVE_TRAVEL_SCHEDULE',
  inventoryPolicy: 'LIMITED',
  expiryPolicy: 'ISSUE_PLUS_DAYS',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const SECOND_OFFER = { ...OFFER, id: 402, title: '웰컴 음료 쿠폰', benefitDescription: '음료 1잔 무료' };

const offerPage = (offers: unknown[]) => ({
  offers,
  page: 1,
  limit: 20,
  totalCount: offers.length,
  totalPages: 1,
  hasNext: false,
} as never);

const COUPON = {
  id: 501,
  offerId: 401,
  code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  status: 'ISSUED',
  issuedAt: '2026-08-18T00:00:00Z',
  expiresAt: '2027-08-18T00:00:00Z',
  redeemedAt: null,
};

describe('PlaceCouponCta', () => {
  test('발급 가능한 Offer의 혜택과 CTA를 보여준다 (ko)', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));

    await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await waitFor(() => expect(screen.getByText('생일 10% 할인 쿠폰')).toBeTruthy());
    expect(screen.getByText('4만원 이상 결제 시, 최대 10% 할인')).toBeTruthy();
    expect(screen.getByLabelText('생일 10% 할인 쿠폰 쿠폰 받기')).toBeTruthy();
  });

  test('English copy renders for the issuable state', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));

    await renderWithProviders(<PlaceCouponCta placeId={17} />, { language: 'en' });

    await waitFor(() => expect(screen.getByText('Get coupon')).toBeTruthy());
  });

  test('발급 가능한 Offer가 없으면 빈 상태를 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([]));

    await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await waitFor(() => expect(screen.getByText('받을 수 있는 쿠폰이 없습니다')).toBeTruthy());
  });

  test('발급 성공 시 쿠폰 코드와 내 쿠폰 이동 버튼을 노출한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    const issueSpy = jest.spyOn(offerCouponApi, 'issueCoupon').mockResolvedValue(COUPON as never);
    const onViewMyCoupons = jest.fn();

    const { user } = await renderWithProviders(
      <PlaceCouponCta onViewMyCoupons={onViewMyCoupons} placeId={17} />,
    );

    const cta = await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기');
    await user.press(cta);

    await waitFor(() => expect(screen.getByText('쿠폰이 발급되었습니다')).toBeTruthy());
    expect(issueSpy).toHaveBeenCalledWith(401);
    expect(screen.getByText(COUPON.code)).toBeTruthy();
    await user.press(screen.getByLabelText('내 쿠폰 보기'));
    expect(onViewMyCoupons).toHaveBeenCalled();
  });

  test('발급 중 중복 탭을 막는다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    let resolveIssue!: (value: unknown) => void;
    const issueSpy = jest
      .spyOn(offerCouponApi, 'issueCoupon')
      .mockImplementation(() => new Promise((resolve) => { resolveIssue = resolve; }) as never);

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);

    const cta = await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기');
    await user.press(cta);
    await user.press(cta);
    await user.press(cta);

    expect(issueSpy).toHaveBeenCalledTimes(1);
    resolveIssue(COUPON);
    await waitFor(() => expect(screen.getByText('쿠폰이 발급되었습니다')).toBeTruthy());
  });

  test('409 중복 발급은 원인별 문구와 내 쿠폰 이동을 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    jest
      .spyOn(offerCouponApi, 'issueCoupon')
      .mockRejectedValue(new ApiError('conflict', { status: 409, code: 'COUPON_ALREADY_ISSUED' }));
    const onViewMyCoupons = jest.fn();

    const { user } = await renderWithProviders(
      <PlaceCouponCta onViewMyCoupons={onViewMyCoupons} placeId={17} />,
    );

    const cta = await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기');
    await user.press(cta);

    await waitFor(() => expect(screen.getByText('이미 발급받은 쿠폰입니다.')).toBeTruthy());
    expect(cta.props.accessibilityState.disabled).toBe(true);

    await user.press(screen.getByLabelText('내 쿠폰 보기'));
    expect(onViewMyCoupons).toHaveBeenCalled();
  });

  test('발급 POST 일반 오류의 재시도는 Offer 조회가 아니라 발급 요청을 다시 호출한다', async () => {
    const listSpy = jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    let resolveRetry!: (value: unknown) => void;
    const issueSpy = jest
      .spyOn(offerCouponApi, 'issueCoupon')
      .mockRejectedValueOnce(new ApiError('server error', { status: 500 }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveRetry = resolve; }) as never);

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await user.press(await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기'));
    await user.press(await screen.findByText('다시 시도'));

    expect(issueSpy).toHaveBeenCalledTimes(2);
    expect(issueSpy).toHaveBeenNthCalledWith(2, 401);
    expect(listSpy).toHaveBeenCalledTimes(1);
    resolveRetry(COUPON);
    await waitFor(() => expect(screen.getByText('쿠폰이 발급되었습니다')).toBeTruthy());
  });

  test('발급 POST 404는 정상 빈 목록과 다른 상태를 보여준다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    jest
      .spyOn(offerCouponApi, 'issueCoupon')
      .mockRejectedValue(new ApiError('not found', { status: 404, code: 'OFFER_NOT_FOUND' }));

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);

    const cta = await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기');
    await user.press(cta);

    await waitFor(() => expect(screen.getByText('이 혜택은 더 이상 발급할 수 없습니다.')).toBeTruthy());
    expect(screen.queryByText('받을 수 있는 쿠폰이 없습니다')).toBeNull();
    expect(cta.props.accessibilityState.disabled).toBe(true);
  });

  test('Offer 목록 403은 발급 조건이 아니라 목록 접근 권한 오류로 안내한다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockRejectedValue(
      new ApiError('forbidden detail', { code: 'ACCESS_DENIED', status: 403 }),
    );

    await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await waitFor(() => expect(screen.getByText('권한이 필요합니다')).toBeTruthy());
    expect(screen.queryByText('발급 조건을 충족하지 않습니다')).toBeNull();
    expect(screen.queryByText('forbidden detail')).toBeNull();
  });

  test('코드 없는 발급 409는 원인을 단정하지 않는다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER]));
    jest.spyOn(offerCouponApi, 'issueCoupon').mockRejectedValue(
      new ApiError('server conflict detail', { status: 409 }),
    );

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);
    await user.press(await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기'));

    await waitFor(() => expect(screen.getByText(/쿠폰을 발급하지 못했습니다/)).toBeTruthy());
    expect(screen.queryByText(/이미 발급|재고|기간이 종료/)).toBeNull();
    expect(screen.queryByText('server conflict detail')).toBeNull();
  });

  test('다른 Offer를 고르면 이전 Offer의 발급 실패 상태가 초기화된다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER, SECOND_OFFER]));
    jest
      .spyOn(offerCouponApi, 'issueCoupon')
      .mockRejectedValue(new ApiError('conflict', { status: 409, code: 'COUPON_ALREADY_ISSUED' }));

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await user.press(await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기'));
    await waitFor(() => expect(screen.getByText('이미 발급받은 쿠폰입니다.')).toBeTruthy());

    await user.press(screen.getByLabelText('웰컴 음료 쿠폰'));

    const nextCta = await screen.findByLabelText('웰컴 음료 쿠폰 쿠폰 받기');
    expect(nextCta.props.accessibilityState.disabled).toBe(false);
    expect(screen.queryByText('이미 발급받은 쿠폰입니다.')).toBeNull();
  });

  test('Offer가 여러 개면 발급 성공 후 다른 쿠폰을 이어서 받을 수 있다', async () => {
    jest.spyOn(offerCouponApi, 'listOffers').mockResolvedValue(offerPage([OFFER, SECOND_OFFER]));
    jest.spyOn(offerCouponApi, 'issueCoupon').mockResolvedValue(COUPON as never);

    const { user } = await renderWithProviders(<PlaceCouponCta placeId={17} />);

    await user.press(await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기'));
    await waitFor(() => expect(screen.getByText('쿠폰이 발급되었습니다')).toBeTruthy());

    await user.press(screen.getByLabelText('다른 쿠폰 받기'));

    expect(await screen.findByLabelText('생일 10% 할인 쿠폰 쿠폰 받기')).toBeTruthy();
    expect(screen.queryByText('쿠폰이 발급되었습니다')).toBeNull();
  });
});
