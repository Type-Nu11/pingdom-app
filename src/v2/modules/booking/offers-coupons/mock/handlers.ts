import { ApiError } from '../../../../shared/api/ApiError';
import type { MockHandler } from '../../../../shared/api/mock/handlers';
import { couponFixture, couponPageFixture, emptyCouponPageFixture, emptyOfferPageFixture, offerFixture, offerPageFixture } from './fixtures';

export const offerCouponMockHandlers = [
  { method: 'GET', path: '/offers', resolve: ({ scenario }) => scenario === 'empty' ? emptyOfferPageFixture : offerPageFixture },
  { method: 'GET', path: /^\/offers\/\d+$/, resolve: ({ path, scenario }) => {
    if (scenario === 'empty') throw new ApiError(`No mock response registered for ${path}`, { code: 'PLACE_NOT_FOUND', status: 404 });
    return offerFixture;
  } },
  { method: 'GET', path: '/coupons', resolve: ({ scenario }) => scenario === 'empty' ? emptyCouponPageFixture : couponPageFixture },
  { method: 'POST', path: /^\/offers\/\d+\/coupons$/, resolve: () => couponFixture },
  { method: 'POST', path: '/merchant-owner/offers/coupons/redeem', resolve: () => ({ ...couponFixture, status: 'REDEEMED', redeemedAt: '2026-07-23T05:35:00Z' }) },
] satisfies readonly MockHandler[];
