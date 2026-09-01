import {
  createLabelKeyResolver,
  createStatusViewResolver,
  type AssertNever,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { Offer } from '../api/offerCouponApi';

/**
 * Offer enums, taken from the generated `OfferResponse`. Every field on that
 * schema is optional upstream, so each alias strips the `undefined` the
 * generator adds and the resolvers below treat "absent" the same as "unknown".
 */
export type OfferStatus = NonNullable<Offer['status']>;
export type OfferEligibilityPolicy = NonNullable<Offer['eligibilityPolicy']>;
export type OfferInventoryPolicy = NonNullable<Offer['inventoryPolicy']>;
export type OfferExpiryPolicy = NonNullable<Offer['expiryPolicy']>;

export const OFFER_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED'] as const satisfies
  readonly OfferStatus[];
export const OFFER_ELIGIBILITY_POLICIES = ['ACTIVE_TRAVEL_SCHEDULE', 'PUBLIC'] as const satisfies
  readonly OfferEligibilityPolicy[];
export const OFFER_INVENTORY_POLICIES = ['LIMITED', 'UNLIMITED'] as const satisfies
  readonly OfferInventoryPolicy[];
export const OFFER_EXPIRY_POLICIES = [
  'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END',
  'ISSUE_PLUS_DAYS',
  'OFFER_END',
] as const satisfies readonly OfferExpiryPolicy[];

type AllOfferStatusesAreListed = AssertNever<
  Exclude<OfferStatus, (typeof OFFER_STATUSES)[number]>
>;
type AllOfferEligibilityPoliciesAreListed = AssertNever<
  Exclude<OfferEligibilityPolicy, (typeof OFFER_ELIGIBILITY_POLICIES)[number]>
>;
type AllOfferInventoryPoliciesAreListed = AssertNever<
  Exclude<OfferInventoryPolicy, (typeof OFFER_INVENTORY_POLICIES)[number]>
>;
type AllOfferExpiryPoliciesAreListed = AssertNever<
  Exclude<OfferExpiryPolicy, (typeof OFFER_EXPIRY_POLICIES)[number]>
>;

export type OfferContractAssertions = [
  AllOfferStatusesAreListed,
  AllOfferEligibilityPoliciesAreListed,
  AllOfferInventoryPoliciesAreListed,
  AllOfferExpiryPoliciesAreListed,
];

const OFFER_STATUS_PRESENTATIONS: Readonly<Record<OfferStatus, StatusPresentation>> = {
  CLOSED: { labelKey: 'offer.statuses.CLOSED', tone: 'neutral' },
  DRAFT: { labelKey: 'offer.statuses.DRAFT', tone: 'neutral' },
  PUBLISHED: { labelKey: 'offer.statuses.PUBLISHED', tone: 'success' },
};

/**
 * `DRAFT` and `CLOSED` are merchant-side states. The tourist API only returns
 * issuable offers, so they are mapped for completeness rather than displayed on
 * their own; see `getOfferIssuanceView` for what the tourist actually sees.
 */
export const getOfferStatusView: (
  status: OfferStatus | string | null | undefined,
) => StatusView<OfferStatus> = createStatusViewResolver(
  OFFER_STATUS_PRESENTATIONS,
  { labelKey: 'offer.statuses.UNKNOWN', tone: 'neutral' },
);

export const getOfferEligibilityLabelKey = createLabelKeyResolver<OfferEligibilityPolicy>(
  {
    ACTIVE_TRAVEL_SCHEDULE: 'offer.eligibility.ACTIVE_TRAVEL_SCHEDULE',
    PUBLIC: 'offer.eligibility.PUBLIC',
  },
  'offer.eligibility.UNKNOWN',
);

export const getOfferInventoryLabelKey = createLabelKeyResolver<OfferInventoryPolicy>(
  {
    LIMITED: 'offer.inventory.LIMITED',
    UNLIMITED: 'offer.inventory.UNLIMITED',
  },
  'offer.inventory.UNKNOWN',
);

export const getOfferExpiryLabelKey = createLabelKeyResolver<OfferExpiryPolicy>(
  {
    ISSUE_PLUS_DAYS: 'offer.expiry.ISSUE_PLUS_DAYS',
    ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: 'offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END',
    OFFER_END: 'offer.expiry.OFFER_END',
  },
  'offer.expiry.UNKNOWN',
);

/** Why the issue CTA is disabled, when the Offer response alone is enough to tell. */
export type OfferIssuanceBlockReason =
  | 'NOT_PUBLISHED'
  | 'NOT_STARTED'
  | 'ENDED'
  | 'SOLD_OUT';

export type OfferRemainingView = Readonly<{
  /** `offer.remaining.*` key describing the count, or its absence. */
  labelKey: string;
  /**
   * `null` means unlimited stock or a server that sent no number. It is never
   * substituted with `0`, which would read as sold out.
   */
  remainingQuantity: number | null;
  totalQuantity: number | null;
  inventoryPolicy: OfferInventoryPolicy | null;
}>;

export type OfferIssuanceView = Readonly<{
  /** `false` only when the Offer response itself rules issuance out. */
  canIssue: boolean;
  blockedBy: OfferIssuanceBlockReason | null;
  ctaLabelKey: string;
  statusView: StatusView<OfferStatus>;
  remaining: OfferRemainingView;
  eligibilityLabelKey: string;
  expiryLabelKey: string;
}>;

const CTA_LABEL_KEYS: Readonly<Record<OfferIssuanceBlockReason, string>> = {
  ENDED: 'offer.cta.ended',
  NOT_PUBLISHED: 'offer.cta.unavailable',
  NOT_STARTED: 'offer.cta.notStarted',
  SOLD_OUT: 'offer.cta.soldOut',
};

/** Parses a server ISO instant, returning `null` rather than a guess. */
function toEpoch(iso: string | null | undefined): number | null {
  if (typeof iso !== 'string') {
    return null;
  }

  const epoch = Date.parse(iso);
  return Number.isNaN(epoch) ? null : epoch;
}

function resolveRemaining(offer: Offer): OfferRemainingView {
  const inventoryPolicy = offer.inventoryPolicy ?? null;
  const remainingQuantity = offer.remainingQuantity ?? null;
  const totalQuantity = offer.totalQuantity ?? null;

  const labelKey = inventoryPolicy === 'UNLIMITED'
    ? 'offer.remaining.unlimited'
    : remainingQuantity === null
      ? 'offer.remaining.unknown'
      : 'offer.remaining.limited';

  return { inventoryPolicy, labelKey, remainingQuantity, totalQuantity };
}

/**
 * Decides whether the issue CTA can be offered, from the Offer response alone.
 *
 * It never inspects coupons: whether the tourist already holds one, and whether
 * they are eligible, is the server's answer to `POST /offers/{id}/coupons`, and
 * that error drives the message the user sees.
 *
 * The function only blocks on facts the server actually stated. An unknown or
 * absent status, an unparseable date, and a `null` quantity all leave the CTA
 * enabled so the request can be made and the server can decide — a build that
 * has not caught up with a new server value must not lock the user out.
 *
 * `now` is passed in so the selector stays pure and testable.
 */
export function getOfferIssuanceView(offer: Offer, now: string): OfferIssuanceView {
  const statusView = getOfferStatusView(offer.status);
  const remaining = resolveRemaining(offer);

  const blockedBy = resolveBlockReason(offer, remaining, now);

  return {
    blockedBy,
    canIssue: blockedBy === null,
    ctaLabelKey: blockedBy === null ? 'offer.cta.issue' : CTA_LABEL_KEYS[blockedBy],
    eligibilityLabelKey: getOfferEligibilityLabelKey(offer.eligibilityPolicy),
    expiryLabelKey: getOfferExpiryLabelKey(offer.expiryPolicy),
    remaining,
    statusView,
  };
}

function resolveBlockReason(
  offer: Offer,
  remaining: OfferRemainingView,
  now: string,
): OfferIssuanceBlockReason | null {
  // Only a status the contract knows can rule issuance out; an unrecognised one
  // is left to the server.
  if (offer.status === 'DRAFT' || offer.status === 'CLOSED') {
    return 'NOT_PUBLISHED';
  }

  const nowEpoch = toEpoch(now);
  const startsAt = toEpoch(offer.startsAt);
  const endsAt = toEpoch(offer.endsAt);

  if (nowEpoch !== null && startsAt !== null && nowEpoch < startsAt) {
    return 'NOT_STARTED';
  }

  if (nowEpoch !== null && endsAt !== null && nowEpoch > endsAt) {
    return 'ENDED';
  }

  // Stock only blocks when the server said the offer is limited *and* gave a
  // number. `null` under a LIMITED policy means "not reported", not "none left".
  if (
    remaining.inventoryPolicy === 'LIMITED'
    && remaining.remainingQuantity !== null
    && remaining.remainingQuantity <= 0
  ) {
    return 'SOLD_OUT';
  }

  return null;
}
