import type { Coupon, CouponStatus, Offer } from '../../offers-coupons';

/**
 * A coupon box row in render order. The coupon list is the source of truth for
 * which rows exist and their status; the offer it points at is looked up
 * separately, so a row whose offer is still loading (or failed) keeps its slot
 * with fallback copy instead of vanishing.
 */
export type CouponBoxEntry = Readonly<{
  couponId: number;
  offerId: number;
  status: CouponStatus;
  title: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
}>;

export type CouponStatusFilter = 'ALL' | 'ISSUED' | 'REDEEMED' | 'EXPIRED';

export const COUPON_STATUS_FILTERS: readonly CouponStatusFilter[] = [
  'ALL',
  'ISSUED',
  'REDEEMED',
  'EXPIRED',
];

/** Only `ISSUED` coupons can be presented for use; every other state is terminal. */
export function isCouponUsable(status: CouponStatus): boolean {
  return status === 'ISSUED';
}

type OfferLookup = ReadonlyMap<number, Offer>;

export function toCouponBoxEntries(
  coupons: readonly Coupon[],
  offersById: OfferLookup,
  fallback: Readonly<{ title: string; description: string }>,
): CouponBoxEntry[] {
  return coupons.map((coupon) => {
    const offer = offersById.get(coupon.offerId);

    return {
      couponId: coupon.id,
      description: offer?.benefitDescription || fallback.description,
      expiresAt: coupon.expiresAt,
      issuedAt: coupon.issuedAt,
      offerId: coupon.offerId,
      redeemedAt: coupon.redeemedAt ?? null,
      status: coupon.status,
      title: offer?.title || fallback.title,
    };
  });
}

export type CouponBoxListState =
  | Readonly<{ entries: CouponBoxEntry[]; kind: 'ready' }>
  | Readonly<{ kind: 'empty' }>
  | Readonly<{ kind: 'error' }>;

/**
 * Separates "the user has no coupons in this view" from "we could not load
 * them". A load failure never renders as an empty box, so a filter with real
 * coupons is not shown as empty when the request fails.
 */
export function toCouponBoxListState(
  couponsFailed: boolean,
  entries: readonly CouponBoxEntry[],
): CouponBoxListState {
  if (couponsFailed) {
    return { kind: 'error' };
  }

  if (entries.length === 0) {
    return { kind: 'empty' };
  }

  return { entries: [...entries], kind: 'ready' };
}

/**
 * Formats a server `date-time` (ISO-8601 local, no offset) for display in the
 * viewer's locale and device timezone. `withTime` is used for the expiry and
 * redemption instants so the expiry boundary stays legible.
 */
export function formatCouponInstant(
  iso: string | null | undefined,
  locale: string,
  { withTime = false }: { withTime?: boolean } = {},
): string {
  if (!iso) {
    return '';
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(parsed);
}

/**
 * A closed date range for display, e.g. the coupon validity period. `weekday`
 * appends the localized short weekday to each end, matching the coupon detail
 * "사용 기간" row. Empty string if either end cannot be parsed.
 */
export function formatCouponDateRange(
  fromIso: string | null | undefined,
  toIso: string | null | undefined,
  locale: string,
  { weekday = false }: { weekday?: boolean } = {},
): string {
  const format = (iso: string | null | undefined): string => {
    if (!iso) {
      return '';
    }
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }
    const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
    if (!weekday) {
      return date;
    }
    const day = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(parsed);
    return `${date} (${day})`;
  };

  const from = format(fromIso);
  const to = format(toIso);
  return from && to ? `${from} ~ ${to}` : from || to;
}
