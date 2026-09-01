import type { Coupon, CouponStatus } from '../../offers-coupons';

/**
 * A coupon box row in render order. The coupon list is the source of truth for
 * which rows exist and their status; the offer and place it points at are looked
 * up separately, so a row whose lookups are still loading (or failed) keeps its
 * slot with fallback copy instead of vanishing.
 */
export type CouponBoxEntry = Readonly<{
  couponId: number;
  offerId: number;
  status: CouponStatus;
  /** Undefined while the place is unknown — a placeholder would misread as real. */
  placeName: string | undefined;
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

/**
 * `GET /coupons` embeds the offer title, benefit and place name, so a row needs
 * no per-coupon lookup. `fallback` covers the fields the server marks nullable.
 */
export function toCouponBoxEntries(
  coupons: readonly Coupon[],
  fallback: Readonly<{ title: string; description: string }>,
): CouponBoxEntry[] {
  return coupons.map((coupon) => ({
    couponId: coupon.id,
    description: coupon.benefitDescription || fallback.description,
    expiresAt: coupon.expiresAt,
    issuedAt: coupon.issuedAt,
    offerId: coupon.offerId,
    placeName: coupon.placeName ?? undefined,
    redeemedAt: coupon.redeemedAt ?? null,
    status: coupon.status,
    title: coupon.offerTitle || fallback.title,
  }));
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
 * The offer period as the design writes it: `2026.08.18 ~ 2027.08.18`, or
 * `26.08.18~27.08.18` when `compact`. Digits and separators are fixed because
 * the design specifies them; only the weekday name follows the viewer's locale.
 * Returns an empty string when neither end parses.
 */
export function formatOfferPeriod(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
  locale: string,
  { compact = false, weekday = false }: { compact?: boolean; weekday?: boolean } = {},
): string {
  const format = (iso: string | null | undefined): string => {
    if (!iso) {
      return '';
    }
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    const year = compact
      ? String(parsed.getFullYear()).slice(-2)
      : String(parsed.getFullYear());
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const date = `${year}.${month}.${day}`;

    if (!weekday) {
      return date;
    }

    return `${date}(${new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(parsed)})`;
  };

  const from = format(startIso);
  const to = format(endIso);
  const separator = compact ? '~' : ' ~ ';
  return from && to ? `${from}${separator}${to}` : from || to;
}

