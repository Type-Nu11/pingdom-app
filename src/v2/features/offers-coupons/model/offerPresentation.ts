import {
  createLabelKeyResolver,
  createStatusViewResolver,
  type AssertNever,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { Coupon, Offer, OfferPage } from '../api/offerCouponApi';

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

export type EligibilityPolicy = OfferEligibilityPolicy;
export type InventoryPolicy = OfferInventoryPolicy;
export type ExpiryPolicy = OfferExpiryPolicy;

/**
 * Normalized view of an Offer for the presentation layer. Date fields stay as
 * the raw server strings — they are parsed/formatted only when rendered.
 */
export type OfferView = {
  id: number;
  placeId: number;
  title: string;
  description: string | null;
  benefitDescription: string;
  startsAt: string;
  endsAt: string;
  couponValidityDays: number | null;
  eligibilityPolicy: EligibilityPolicy | null;
  inventoryPolicy: InventoryPolicy | null;
  expiryPolicy: ExpiryPolicy | null;
  totalQuantity: number | null;
  issuedQuantity: number | null;
  remainingQuantity: number | null;
  status: OfferStatus | null;
};

const asEnum = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null;

const asFiniteOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function toOfferView(offer: Offer): OfferView | null {
  const raw = offer;
  const id = asFiniteOrNull(raw.id);
  const placeId = asFiniteOrNull(raw.placeId);
  if (
    id == null
    || placeId == null
    || typeof raw.title !== 'string'
    || typeof raw.benefitDescription !== 'string'
    || typeof raw.startsAt !== 'string'
    || typeof raw.endsAt !== 'string'
  ) {
    return null;
  }
  return {
    id,
    placeId,
    title: raw.title,
    description: typeof raw.description === 'string' && raw.description.trim() ? raw.description : null,
    benefitDescription: raw.benefitDescription,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    couponValidityDays: asFiniteOrNull(raw.couponValidityDays),
    eligibilityPolicy: asEnum(raw.eligibilityPolicy, OFFER_ELIGIBILITY_POLICIES),
    inventoryPolicy: asEnum(raw.inventoryPolicy, OFFER_INVENTORY_POLICIES),
    expiryPolicy: asEnum(raw.expiryPolicy, OFFER_EXPIRY_POLICIES),
    totalQuantity: asFiniteOrNull(raw.totalQuantity),
    issuedQuantity: asFiniteOrNull(raw.issuedQuantity),
    remainingQuantity: asFiniteOrNull(raw.remainingQuantity),
    status: asEnum(raw.status, OFFER_STATUSES),
  };
}

/** Server order is authoritative; do not re-sort. */
export function selectPlaceOffers(page: OfferPage | undefined): OfferView[] {
  return (page?.offers ?? [])
    .map(toOfferView)
    .filter((offer): offer is OfferView => offer !== null);
}

export function isUnlimitedInventory(offer: OfferView): boolean {
  return offer.inventoryPolicy === 'UNLIMITED' || offer.remainingQuantity == null;
}

// ---------------------------------------------------------------------------
// CTA state machine
// ---------------------------------------------------------------------------

export type CouponConflictCause = 'duplicate' | 'window-closed' | 'stock-out' | 'unknown';

export type CouponCtaState =
  | { kind: 'offer-loading' }
  | { kind: 'offer-error'; error: unknown }
  | { kind: 'auth-required'; error?: unknown }
  | { kind: 'no-offer' }
  | { kind: 'issuable'; offerId: number }
  | { kind: 'issuing'; offerId: number | null }
  | { kind: 'issue-success'; coupon: Coupon }
  | { kind: 'issue-error'; error: unknown }
  | { kind: 'issue-not-found'; error: unknown }
  | { kind: 'eligibility-unmet'; error: unknown }
  | { kind: 'conflict'; cause: CouponConflictCause; error: unknown };

type QueryLike<T> = {
  data?: T;
  error?: unknown;
  isError: boolean;
  isPending: boolean;
};

type MutationLike = {
  data?: Coupon;
  error?: unknown;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
};

const DUPLICATE_COUPON_CODES = new Set(['COUPON_ALREADY_ISSUED']);
const STOCK_OUT_COUPON_CODES = new Set(['CAPACITY_EXCEEDED']);
const WINDOW_CLOSED_COUPON_CODES = new Set(['COUPON_EXPIRED', 'RESOURCE_EXPIRED']);

/**
 * Reads the status/code the server actually sent. Mirrors how other V2 models
 * inspect errors (see place-detail `placeDetailPresentation`) rather than
 * relying on `instanceof ApiError` across module boundaries.
 */
function readError(error: unknown): { status?: number; code?: string } {
  if (!error || typeof error !== 'object') return {};
  const record = error as { status?: unknown; code?: unknown };
  return {
    status: typeof record.status === 'number' ? record.status : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
  };
}

export function classifyConflictCause(error: unknown): CouponConflictCause {
  const { code } = readError(error);
  if (!code) return 'unknown';
  const normalized = code.toUpperCase();
  if (DUPLICATE_COUPON_CODES.has(normalized)) return 'duplicate';
  if (STOCK_OUT_COUPON_CODES.has(normalized)) return 'stock-out';
  if (WINDOW_CLOSED_COUPON_CODES.has(normalized)) return 'window-closed';
  return 'unknown';
}

function classifyIssueError(error: unknown): CouponCtaState {
  const { status } = readError(error);
  if (status === 401) return { kind: 'auth-required', error };
  if (status === 403) return { kind: 'eligibility-unmet', error };
  if (status === 404) return { kind: 'issue-not-found', error };
  if (status === 409) return { kind: 'conflict', cause: classifyConflictCause(error), error };
  return { kind: 'issue-error', error };
}

/**
 * Resolves the single CTA state from the Offer query and the issuance mutation.
 * Success and in-flight issuance win over anything the Offer query reports so a
 * mid-flight cache invalidation cannot flip the button back to `issuable`.
 */
export function selectCouponCtaState(input: {
  offers: QueryLike<OfferView[]>;
  issue: MutationLike;
  selectedOfferId: number | null;
}): CouponCtaState {
  const { offers, issue, selectedOfferId } = input;
  const list = offers.data ?? [];
  const activeOfferId = list.some((offer) => offer.id === selectedOfferId)
    ? (selectedOfferId as number)
    : list[0]?.id ?? null;

  if (issue.isSuccess && issue.data) {
    return { kind: 'issue-success', coupon: issue.data };
  }
  if (issue.isPending) {
    // The Offer list can be invalidated mid-flight, so the id may momentarily
    // resolve to nothing. Callers keep their own copy of the Offer being issued.
    return { kind: 'issuing', offerId: activeOfferId };
  }
  if (issue.isError) {
    return classifyIssueError(issue.error);
  }

  if (offers.isPending) return { kind: 'offer-loading' };
  if (offers.isError) {
    const status = readError(offers.error).status;
    if (status === 401) return { kind: 'auth-required', error: offers.error };
    return { kind: 'offer-error', error: offers.error };
  }
  if (list.length === 0 || activeOfferId == null) return { kind: 'no-offer' };
  return { kind: 'issuable', offerId: activeOfferId };
}

// ---------------------------------------------------------------------------
// Presentation formatters (locale-aware, safe fallback on parse failure)
// ---------------------------------------------------------------------------

type Translate = (key: string, options?: Record<string, unknown>) => string;

export function formatOfferDate(value: string, locale: string): string | null {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  try {
    return new Intl.DateTimeFormat(locale || 'en', { dateStyle: 'medium' }).format(
      new Date(timestamp),
    );
  } catch {
    return null;
  }
}

export function formatOfferPeriod(
  offer: Pick<OfferView, 'startsAt' | 'endsAt'>,
  locale: string,
  t: Translate,
): string {
  const start = formatOfferDate(offer.startsAt, locale);
  const end = formatOfferDate(offer.endsAt, locale);
  if (start && end) return `${start} ~ ${end}`;
  if (start || end) return (start ?? end) as string;
  return t('placeOffers.detail.periodUnavailable');
}

export function formatOfferInventory(offer: OfferView, t: Translate): string {
  if (isUnlimitedInventory(offer)) return t('placeOffers.detail.inventoryUnlimited');
  return t('placeOffers.detail.inventoryRemaining', {
    count: offer.remainingQuantity ?? 0,
  });
}

export function formatOfferEligibility(offer: OfferView, t: Translate): string {
  if (offer.eligibilityPolicy === 'ACTIVE_TRAVEL_SCHEDULE') {
    return t('placeOffers.detail.eligibilityActiveTravelSchedule');
  }
  if (offer.eligibilityPolicy === 'PUBLIC') return t('placeOffers.detail.eligibilityPublic');
  return t('placeOffers.detail.eligibilityUnknown');
}

export function formatOfferValidity(offer: OfferView, locale: string, t: Translate): string {
  const parts: string[] = [];
  if (offer.couponValidityDays != null) {
    parts.push(t('placeOffers.detail.validityDays', { count: offer.couponValidityDays }));
  }
  if (offer.expiryPolicy === 'OFFER_END') {
    const end = formatOfferDate(offer.endsAt, locale);
    parts.push(end
      ? t('placeOffers.detail.validityOfferEndOn', { date: end })
      : t('placeOffers.detail.validityOfferEnd'));
  } else if (offer.expiryPolicy === 'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END') {
    parts.push(t('placeOffers.detail.validityCapped'));
  }
  return parts.length ? parts.join(' · ') : t('placeOffers.detail.validityUnknown');
}
