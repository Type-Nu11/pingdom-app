import {
  COUPON_STATUSES,
  getCouponStatusView,
  getOfferEligibilityLabelKey,
  getOfferExpiryLabelKey,
  getOfferInventoryLabelKey,
  getOfferStatusView,
  OFFER_ELIGIBILITY_POLICIES,
  OFFER_EXPIRY_POLICIES,
  OFFER_INVENTORY_POLICIES,
  OFFER_STATUSES,
} from '../../../features/offers-coupons';
import { PAYMENT_STATUSES } from '../../../features/payments/model/payment.types';
import { getPaymentStatusView } from '../../../features/payments/model/paymentPresentation';
import {
  getReservationStatusView,
  RESERVATION_STATUSES,
} from '../../../features/reservations/model/reservationPresentation';
import { reservationResources } from '../../../features/reservations/i18n/reservationResources';
import { resources } from '../resources';

/**
 * Every label key a status selector can return has to resolve to real ko and en
 * copy — including the fallback keys, which are the ones a user sees when the
 * server ships a state this build has never heard of.
 */
const BUNDLES = {
  en: { ...resources.en.translation, ...reservationResources.en },
  ko: { ...resources.ko.translation, ...reservationResources.ko },
} as const;

function lookup(language: keyof typeof BUNDLES, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (node, segment) => (
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[segment]
        : undefined
    ),
    BUNDLES[language],
  );
}

const UNKNOWN_SERVER_VALUE = 'A_STATE_THIS_BUILD_HAS_NEVER_SEEN';

const LABEL_KEYS: readonly string[] = [
  ...COUPON_STATUSES.map((status) => getCouponStatusView(status).labelKey),
  getCouponStatusView(UNKNOWN_SERVER_VALUE).labelKey,
  ...OFFER_STATUSES.map((status) => getOfferStatusView(status).labelKey),
  getOfferStatusView(UNKNOWN_SERVER_VALUE).labelKey,
  ...OFFER_ELIGIBILITY_POLICIES.map(getOfferEligibilityLabelKey),
  getOfferEligibilityLabelKey(UNKNOWN_SERVER_VALUE),
  ...OFFER_INVENTORY_POLICIES.map(getOfferInventoryLabelKey),
  getOfferInventoryLabelKey(UNKNOWN_SERVER_VALUE),
  ...OFFER_EXPIRY_POLICIES.map(getOfferExpiryLabelKey),
  getOfferExpiryLabelKey(UNKNOWN_SERVER_VALUE),
  ...RESERVATION_STATUSES.map((status) => getReservationStatusView(status).labelKey),
  getReservationStatusView(UNKNOWN_SERVER_VALUE).labelKey,
  ...PAYMENT_STATUSES.map((status) => getPaymentStatusView(status).labelKey),
  getPaymentStatusView(UNKNOWN_SERVER_VALUE).labelKey,
  'offer.cta.ended',
  'offer.cta.issue',
  'offer.cta.notStarted',
  'offer.cta.soldOut',
  'offer.cta.unavailable',
  'offer.remaining.unknown',
  'offer.remaining.unlimited',
];

describe('status label keys', () => {
  it.each(LABEL_KEYS)('%s resolves to Korean and English copy', (key) => {
    for (const language of ['en', 'ko'] as const) {
      const value = lookup(language, key);
      expect(typeof value).toBe('string');
      expect(value).not.toBe('');
    }
  });

  it('resolves the counted remaining-quantity key in both plural forms', () => {
    for (const language of ['en', 'ko'] as const) {
      expect(typeof lookup(language, 'offer.remaining.limited_one')).toBe('string');
      expect(typeof lookup(language, 'offer.remaining.limited_other')).toBe('string');
    }
  });
});
