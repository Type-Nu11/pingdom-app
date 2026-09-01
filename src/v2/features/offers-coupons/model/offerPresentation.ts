import type { Coupon, Offer, OfferPage } from '../api/offerCouponApi';

/**
 * The live server (`/v3/api-docs`) returns policy fields the generated contract
 * predates. Widen them here in the presentation layer instead of regenerating
 * the shared API types, and never assume they are present.
 */
export type EligibilityPolicy = 'ACTIVE_TRAVEL_SCHEDULE' | 'PUBLIC';
export type InventoryPolicy = 'LIMITED' | 'UNLIMITED';
export type ExpiryPolicy =
  | 'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END'
  | 'ISSUE_PLUS_DAYS'
  | 'OFFER_END';

type RawOffer = Offer & Partial<{
  eligibilityPolicy: EligibilityPolicy | string | null;
  inventoryPolicy: InventoryPolicy | string | null;
  expiryPolicy: ExpiryPolicy | string | null;
  totalQuantity: number | null;
  issuedQuantity: number | null;
  remainingQuantity: number | null;
  couponValidityDays: number | null;
}>;

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
};

const ELIGIBILITY_POLICIES: readonly EligibilityPolicy[] = ['ACTIVE_TRAVEL_SCHEDULE', 'PUBLIC'];
const INVENTORY_POLICIES: readonly InventoryPolicy[] = ['LIMITED', 'UNLIMITED'];
const EXPIRY_POLICIES: readonly ExpiryPolicy[] = [
  'ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END',
  'ISSUE_PLUS_DAYS',
  'OFFER_END',
];

const asEnum = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null;

const asFiniteOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export function toOfferView(offer: Offer): OfferView {
  const raw = offer as RawOffer;
  return {
    id: raw.id,
    placeId: raw.placeId,
    title: raw.title,
    description: typeof raw.description === 'string' && raw.description.trim() ? raw.description : null,
    benefitDescription: raw.benefitDescription,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
    couponValidityDays: asFiniteOrNull(raw.couponValidityDays),
    eligibilityPolicy: asEnum(raw.eligibilityPolicy, ELIGIBILITY_POLICIES),
    inventoryPolicy: asEnum(raw.inventoryPolicy, INVENTORY_POLICIES),
    expiryPolicy: asEnum(raw.expiryPolicy, EXPIRY_POLICIES),
    totalQuantity: asFiniteOrNull(raw.totalQuantity),
    issuedQuantity: asFiniteOrNull(raw.issuedQuantity),
    remainingQuantity: asFiniteOrNull(raw.remainingQuantity),
  };
}

/** Server order is authoritative; do not re-sort. */
export function selectPlaceOffers(page: OfferPage | undefined): OfferView[] {
  return (page?.offers ?? []).map(toOfferView);
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

const includesAny = (haystack: string, needles: readonly string[]): boolean =>
  needles.some((needle) => haystack.includes(needle));

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
  if (includesAny(normalized, ['ALREADY_ISSUED', 'ALREADY_EXISTS', 'DUPLICATE'])) {
    return 'duplicate';
  }
  if (includesAny(normalized, ['CAPACITY', 'SOLD_OUT', 'STOCK', 'EXHAUSTED', 'QUANTITY'])) {
    return 'stock-out';
  }
  if (includesAny(normalized, ['WINDOW', 'CLOSED', 'EXPIRED', 'NOT_ISSUABLE', 'ENDED'])) {
    return 'window-closed';
  }
  return 'unknown';
}

function classifyIssueError(error: unknown): CouponCtaState {
  const { status } = readError(error);
  if (status === 401) return { kind: 'auth-required', error };
  if (status === 403) return { kind: 'eligibility-unmet', error };
  if (status === 404) return { kind: 'no-offer' };
  if (status === 409) return { kind: 'conflict', cause: classifyConflictCause(error), error };
  if (status === 410) return { kind: 'conflict', cause: 'window-closed', error };
  return { kind: 'offer-error', error };
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
    if (status === 403) return { kind: 'eligibility-unmet', error: offers.error };
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
