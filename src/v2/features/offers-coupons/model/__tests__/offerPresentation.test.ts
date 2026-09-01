import type { Offer } from '../../api/offerCouponApi';
import {
  getOfferEligibilityLabelKey,
  getOfferExpiryLabelKey,
  getOfferInventoryLabelKey,
  getOfferIssuanceView,
  getOfferStatusView,
  OFFER_ELIGIBILITY_POLICIES,
  OFFER_EXPIRY_POLICIES,
  OFFER_INVENTORY_POLICIES,
  OFFER_STATUSES,
} from '../offerPresentation';

const NOW = '2026-09-01T12:00:00Z';

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    benefitDescription: '음료 1잔 무료',
    couponValidityDays: 7,
    eligibilityPolicy: 'PUBLIC',
    endsAt: '2026-12-31T23:59:59Z',
    expiryPolicy: 'ISSUE_PLUS_DAYS',
    id: 1,
    inventoryPolicy: 'UNLIMITED',
    issuedQuantity: 3,
    placeId: 10,
    remainingQuantity: null,
    startsAt: '2026-01-01T00:00:00Z',
    status: 'PUBLISHED',
    title: '관광객 웰컴 음료',
    totalQuantity: null,
    ...overrides,
  };
}

describe('offer contract lists', () => {
  it('match the generated OfferResponse enums exactly', () => {
    expect([...OFFER_STATUSES].sort()).toEqual(['CLOSED', 'DRAFT', 'PUBLISHED']);
    expect([...OFFER_ELIGIBILITY_POLICIES].sort()).toEqual(['ACTIVE_TRAVEL_SCHEDULE', 'PUBLIC']);
    expect([...OFFER_INVENTORY_POLICIES].sort()).toEqual(['LIMITED', 'UNLIMITED']);
    expect([...OFFER_EXPIRY_POLICIES].sort()).toEqual([
      'ISSUE_PLUS_DAYS',
      'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END',
      'OFFER_END',
    ]);
  });
});

describe('policy label keys', () => {
  it.each(OFFER_ELIGIBILITY_POLICIES)('maps eligibility %s', (policy) => {
    expect(getOfferEligibilityLabelKey(policy)).toBe(`offer.eligibility.${policy}`);
  });

  it.each(OFFER_INVENTORY_POLICIES)('maps inventory %s', (policy) => {
    expect(getOfferInventoryLabelKey(policy)).toBe(`offer.inventory.${policy}`);
  });

  it.each(OFFER_EXPIRY_POLICIES)('maps expiry %s', (policy) => {
    expect(getOfferExpiryLabelKey(policy)).toBe(`offer.expiry.${policy}`);
  });

  it('falls back for unknown and absent policies', () => {
    expect(getOfferEligibilityLabelKey('NEW_POLICY')).toBe('offer.eligibility.UNKNOWN');
    expect(getOfferInventoryLabelKey(undefined)).toBe('offer.inventory.UNKNOWN');
    expect(getOfferExpiryLabelKey(null)).toBe('offer.expiry.UNKNOWN');
  });
});

describe('getOfferStatusView', () => {
  it.each(OFFER_STATUSES)('maps %s', (status) => {
    expect(getOfferStatusView(status).labelKey).toBe(`offer.statuses.${status}`);
  });

  it('falls back for an unknown status', () => {
    expect(getOfferStatusView('ARCHIVED').labelKey).toBe('offer.statuses.UNKNOWN');
    expect(getOfferStatusView('ARCHIVED').known).toBe(false);
  });
});

describe('getOfferIssuanceView', () => {
  it('allows issuing a published, in-window, unlimited offer', () => {
    const view = getOfferIssuanceView(offer(), NOW);

    expect(view.canIssue).toBe(true);
    expect(view.blockedBy).toBeNull();
    expect(view.ctaLabelKey).toBe('offer.cta.issue');
    expect(view.eligibilityLabelKey).toBe('offer.eligibility.PUBLIC');
    expect(view.expiryLabelKey).toBe('offer.expiry.ISSUE_PLUS_DAYS');
  });

  it.each(['DRAFT', 'CLOSED'] as const)('blocks the merchant-side status %s', (status) => {
    const view = getOfferIssuanceView(offer({ status }), NOW);

    expect(view.canIssue).toBe(false);
    expect(view.blockedBy).toBe('NOT_PUBLISHED');
    expect(view.ctaLabelKey).toBe('offer.cta.unavailable');
  });

  it('blocks before the offer starts and after it ends', () => {
    expect(getOfferIssuanceView(offer({ startsAt: '2026-10-01T00:00:00Z' }), NOW).blockedBy)
      .toBe('NOT_STARTED');
    expect(getOfferIssuanceView(offer({ endsAt: '2026-08-01T00:00:00Z' }), NOW).blockedBy)
      .toBe('ENDED');
  });

  it('blocks a LIMITED offer the server reported as empty', () => {
    const view = getOfferIssuanceView(
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: 0, totalQuantity: 50 }),
      NOW,
    );

    expect(view.blockedBy).toBe('SOLD_OUT');
    expect(view.ctaLabelKey).toBe('offer.cta.soldOut');
  });

  it('does not read a missing LIMITED quantity as sold out', () => {
    const view = getOfferIssuanceView(
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: null, totalQuantity: 50 }),
      NOW,
    );

    expect(view.canIssue).toBe(true);
    expect(view.remaining.remainingQuantity).toBeNull();
    expect(view.remaining.labelKey).toBe('offer.remaining.unknown');
  });

  it('keeps nullable quantities null instead of substituting 0', () => {
    const view = getOfferIssuanceView(offer(), NOW);

    expect(view.remaining.remainingQuantity).toBeNull();
    expect(view.remaining.totalQuantity).toBeNull();
    expect(view.remaining.labelKey).toBe('offer.remaining.unlimited');
  });

  it('reports a LIMITED count as-is', () => {
    const view = getOfferIssuanceView(
      offer({ inventoryPolicy: 'LIMITED', remainingQuantity: 4, totalQuantity: 50 }),
      NOW,
    );

    expect(view.remaining.labelKey).toBe('offer.remaining.limited');
    expect(view.remaining.remainingQuantity).toBe(4);
    expect(view.remaining.totalQuantity).toBe(50);
  });

  it('leaves the CTA enabled for a status this build does not know', () => {
    // The tourist API only returns issuable offers; the server, not a stale
    // client build, decides whether issuing succeeds.
    const view = getOfferIssuanceView(offer({ status: 'ARCHIVED' as never }), NOW);

    expect(view.canIssue).toBe(true);
    expect(view.statusView.known).toBe(false);
    expect(view.statusView.labelKey).toBe('offer.statuses.UNKNOWN');
  });

  it('does not block on absent or unparseable dates', () => {
    expect(getOfferIssuanceView(offer({ endsAt: undefined, startsAt: undefined }), NOW).canIssue)
      .toBe(true);
    expect(getOfferIssuanceView(offer({ endsAt: 'not-a-date' }), NOW).canIssue).toBe(true);
    expect(getOfferIssuanceView(offer(), 'not-a-date').canIssue).toBe(true);
  });

  it('is pure: the same offer and instant always give the same view', () => {
    expect(getOfferIssuanceView(offer(), NOW)).toEqual(getOfferIssuanceView(offer(), NOW));
  });
});
