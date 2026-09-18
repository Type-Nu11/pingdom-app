import type { OffersCouponsSchema } from '../../../../shared/api/offersCouponsContract';

export const offerFixture = {
  id: 401,
  placeId: 17,
  title: 'Mock tourist-only deal',
  description: 'Synthetic offer for UI development.',
  benefitDescription: '10% off',
  status: 'PUBLISHED',
  startsAt: '2026-07-01T00:00:00Z',
  endsAt: '2026-08-31T14:59:59Z',
  totalQuantity: 100,
  issuedQuantity: 12,
  remainingQuantity: 88,
  couponValidityDays: 7,
  eligibilityPolicy: 'ACTIVE_TRAVEL_SCHEDULE',
  inventoryPolicy: 'LIMITED',
  expiryPolicy: 'ISSUE_PLUS_DAYS',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-23T05:30:00Z',
} satisfies OffersCouponsSchema<'OfferResponse'>;

export const offerPageFixture = {
  offers: [offerFixture],
  page: 1,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
} satisfies OffersCouponsSchema<'OfferPageResponse'>;

export const couponFixture = {
  id: 501,
  offerId: 401,
  code: '00000000-0000-4000-8000-000000000501',
  status: 'ISSUED',
  issuedAt: '2026-07-23T05:30:00Z',
  expiresAt: '2026-07-30T05:30:00Z',
  redeemedAt: null,
} satisfies OffersCouponsSchema<'CouponResponse'>;

export const expiredCouponFixture = {
  ...couponFixture,
  id: 502,
  code: '00000000-0000-4000-8000-000000000502',
  status: 'EXPIRED',
  expiresAt: '2026-07-22T05:30:00Z',
} satisfies OffersCouponsSchema<'CouponResponse'>;

export const couponPageFixture = {
  coupons: [couponFixture, expiredCouponFixture],
  page: 1,
  limit: 20,
  totalElements: 2,
  totalPages: 1,
  hasNext: false,
} satisfies OffersCouponsSchema<'CouponPageResponse'>;

export const emptyOfferPageFixture = { ...offerPageFixture, offers: [], totalElements: 0, totalPages: 0 };
export const emptyCouponPageFixture = { ...couponPageFixture, coupons: [], totalElements: 0, totalPages: 0 };
