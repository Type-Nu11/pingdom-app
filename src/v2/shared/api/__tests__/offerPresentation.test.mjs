import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError } from '../ApiError.ts';
import {
  createOffersQueryOptions,
  offerCouponQueryKeys,
} from '../../../features/offers-coupons/hooks/useOffersCoupons.ts';
import { createIssueCouponMutationOptions } from '../../../features/offers-coupons/hooks/useOffersCoupons.ts';
import {
  classifyConflictCause,
  formatOfferEligibility,
  formatOfferInventory,
  formatOfferPeriod,
  formatOfferValidity,
  selectCouponCtaState,
  selectPlaceOffers,
  toOfferView,
} from '../../../features/offers-coupons/model/offerPresentation.ts';

const t = (key, options) => (options && 'count' in options ? `${key}:${options.count}` : key);

const baseOffer = {
  id: 401,
  placeId: 17,
  title: 'Deal A',
  description: 'Ten percent off any dessert.',
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
};

const readyOffers = (data) => ({ data, error: null, isError: false, isPending: false });
const idleIssue = { data: undefined, error: null, isError: false, isPending: false, isSuccess: false };

test('placeId is passed into the Offer list query', async () => {
  const calls = [];
  const options = createOffersQueryOptions(
    { placeId: 17 },
    { listOffers: async (params, signal) => { calls.push({ params, signal }); return { offers: [] }; } },
  );
  assert.deepEqual(options.queryKey, offerCouponQueryKeys.offers({ placeId: 17 }));
  await options.queryFn({ signal: undefined });
  assert.deepEqual(calls[0].params, { placeId: 17 });
});

test('issue mutation is called with the real offerId', async () => {
  const calls = [];
  const options = createIssueCouponMutationOptions({
    issueCoupon: async (offerId) => { calls.push(offerId); return { id: 1 }; },
  });
  await options.mutationFn(401);
  assert.deepEqual(calls, [401]);
});

test('selectPlaceOffers keeps server order and normalizes nullable stock', () => {
  const offers = selectPlaceOffers({
    offers: [
      { ...baseOffer, id: 2, title: 'B' },
      { ...baseOffer, id: 1, title: 'A', inventoryPolicy: 'UNLIMITED', totalQuantity: null, remainingQuantity: null },
    ],
  });
  assert.deepEqual(offers.map((offer) => offer.id), [2, 1]);
  assert.equal(offers[1].remainingQuantity, null);
  assert.equal(offers[1].inventoryPolicy, 'UNLIMITED');
});

test('toOfferView drops unknown enum values and non-finite numbers', () => {
  const view = toOfferView({
    ...baseOffer,
    eligibilityPolicy: 'SOMETHING_NEW',
    inventoryPolicy: null,
    expiryPolicy: undefined,
    couponValidityDays: null,
  });
  assert.equal(view.eligibilityPolicy, null);
  assert.equal(view.inventoryPolicy, null);
  assert.equal(view.expiryPolicy, null);
  assert.equal(view.couponValidityDays, null);
});

test('CTA state machine distinguishes every state', () => {
  assert.equal(
    selectCouponCtaState({
      offers: { data: undefined, error: null, isError: false, isPending: true },
      issue: idleIssue,
      selectedOfferId: null,
    }).kind,
    'offer-loading',
  );

  assert.equal(
    selectCouponCtaState({
      offers: { data: undefined, error: new ApiError('x', { status: 500 }), isError: true, isPending: false },
      issue: idleIssue,
      selectedOfferId: null,
    }).kind,
    'offer-error',
  );

  assert.equal(
    selectCouponCtaState({
      offers: { data: undefined, error: new ApiError('x', { status: 401 }), isError: true, isPending: false },
      issue: idleIssue,
      selectedOfferId: null,
    }).kind,
    'auth-required',
  );

  assert.equal(
    selectCouponCtaState({
      offers: { data: undefined, error: new ApiError('x', { status: 403 }), isError: true, isPending: false },
      issue: idleIssue,
      selectedOfferId: null,
    }).kind,
    'eligibility-unmet',
  );

  assert.equal(
    selectCouponCtaState({ offers: readyOffers([]), issue: idleIssue, selectedOfferId: null }).kind,
    'no-offer',
  );

  const issuable = selectCouponCtaState({
    offers: readyOffers([toOfferView(baseOffer)]),
    issue: idleIssue,
    selectedOfferId: null,
  });
  assert.equal(issuable.kind, 'issuable');
  assert.equal(issuable.offerId, 401);

  assert.deepEqual(
    selectCouponCtaState({
      offers: readyOffers([toOfferView(baseOffer)]),
      issue: { ...idleIssue, isPending: true },
      selectedOfferId: null,
    }),
    { kind: 'issuing', offerId: 401 },
  );

  const success = selectCouponCtaState({
    offers: readyOffers([]),
    issue: { ...idleIssue, isSuccess: true, data: { id: 501, code: 'abc', expiresAt: '2026-09-01T00:00:00Z' } },
    selectedOfferId: null,
  });
  assert.equal(success.kind, 'issue-success');
  assert.equal(success.coupon.code, 'abc');

  assert.equal(
    selectCouponCtaState({
      offers: readyOffers([toOfferView(baseOffer)]),
      issue: { ...idleIssue, isError: true, error: new ApiError('x', { status: 403 }) },
      selectedOfferId: null,
    }).kind,
    'eligibility-unmet',
  );

  assert.equal(
    selectCouponCtaState({
      offers: readyOffers([toOfferView(baseOffer)]),
      issue: { ...idleIssue, isError: true, error: new ApiError('x', { status: 404 }) },
      selectedOfferId: null,
    }).kind,
    'no-offer',
  );

  const conflict = selectCouponCtaState({
    offers: readyOffers([toOfferView(baseOffer)]),
    issue: { ...idleIssue, isError: true, error: new ApiError('x', { status: 409, code: 'COUPON_ALREADY_ISSUED' }) },
    selectedOfferId: null,
  });
  assert.equal(conflict.kind, 'conflict');
  assert.equal(conflict.cause, 'duplicate');

  const conflictBare = selectCouponCtaState({
    offers: readyOffers([toOfferView(baseOffer)]),
    issue: { ...idleIssue, isError: true, error: new ApiError('x', { status: 409 }) },
    selectedOfferId: null,
  });
  assert.equal(conflictBare.cause, 'unknown');

  const expired = selectCouponCtaState({
    offers: readyOffers([toOfferView(baseOffer)]),
    issue: { ...idleIssue, isError: true, error: new ApiError('x', { status: 410 }) },
    selectedOfferId: null,
  });
  assert.deepEqual([expired.kind, expired.cause], ['conflict', 'window-closed']);
});

test('CTA honors a valid selected offer and falls back to the first otherwise', () => {
  const offers = readyOffers([
    toOfferView({ ...baseOffer, id: 1 }),
    toOfferView({ ...baseOffer, id: 2 }),
  ]);
  assert.equal(selectCouponCtaState({ offers, issue: idleIssue, selectedOfferId: 2 }).offerId, 2);
  assert.equal(selectCouponCtaState({ offers, issue: idleIssue, selectedOfferId: 99 }).offerId, 1);
});

test('classifyConflictCause only reads codes the server actually sent', () => {
  assert.equal(classifyConflictCause(new ApiError('x', { status: 409 })), 'unknown');
  assert.equal(classifyConflictCause(new ApiError('x', { status: 409, code: 'CAPACITY_EXCEEDED' })), 'stock-out');
  assert.equal(classifyConflictCause(new ApiError('x', { status: 409, code: 'ISSUANCE_WINDOW_CLOSED' })), 'window-closed');
  assert.equal(classifyConflictCause(new ApiError('x', { status: 409, code: 'PLACE_ALREADY_EXISTS' })), 'duplicate');
  assert.equal(classifyConflictCause(new ApiError('x', { status: 409, code: 'WEIRD_CODE' })), 'unknown');
});

test('formatters parse dates in the presentation layer with a safe fallback', () => {
  const offer = toOfferView(baseOffer);
  const period = formatOfferPeriod(offer, 'en', t);
  assert.match(period, / ~ /);
  assert.equal(
    formatOfferPeriod({ startsAt: 'not-a-date', endsAt: 'nope' }, 'en', t),
    'placeOffers.detail.periodUnavailable',
  );

  assert.equal(formatOfferInventory(offer, t), 'placeOffers.detail.inventoryRemaining:88');
  assert.equal(
    formatOfferInventory(toOfferView({ ...baseOffer, inventoryPolicy: 'UNLIMITED', remainingQuantity: null }), t),
    'placeOffers.detail.inventoryUnlimited',
  );

  assert.equal(formatOfferEligibility(offer, t), 'placeOffers.detail.eligibilityActiveTravelSchedule');
  assert.equal(
    formatOfferEligibility(toOfferView({ ...baseOffer, eligibilityPolicy: null }), t),
    'placeOffers.detail.eligibilityUnknown',
  );

  assert.equal(formatOfferValidity(offer, 'en', t), 'placeOffers.detail.validityDays:7');
  assert.equal(
    formatOfferValidity(toOfferView({ ...baseOffer, couponValidityDays: null, expiryPolicy: null }), 'en', t),
    'placeOffers.detail.validityUnknown',
  );
});
