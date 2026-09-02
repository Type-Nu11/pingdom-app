import {
  createStatusViewResolver,
  type AssertNever,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { CouponStatus } from '../api/offerCouponApi';

export type { CouponStatus };

/**
 * The coupon lifecycle as the live contract states it. Sourced from
 * `CouponResponse['status']` in the generated `offersCoupons` types, never
 * written out by hand — the assertion below fails to compile if the server adds
 * a state and this list is not updated.
 */
export const COUPON_STATUSES = ['ISSUED', 'REDEEMED', 'EXPIRED'] as const satisfies
  readonly CouponStatus[];

type AllCouponStatusesAreListed = AssertNever<
  Exclude<CouponStatus, (typeof COUPON_STATUSES)[number]>
>;
export type CouponStatusContractAssertion = AllCouponStatusesAreListed;

/**
 * Label keys live in the shared `myPage.couponBox.status` bundle, which already
 * carries ko and en copy for every coupon state plus the unknown fallback.
 * Screens must read them through this selector rather than interpolating the
 * server value into a key, so an unmapped state cannot render a raw key.
 */
const COUPON_STATUS_PRESENTATIONS: Readonly<Record<CouponStatus, StatusPresentation>> = {
  EXPIRED: { labelKey: 'myPage.couponBox.status.EXPIRED', tone: 'neutral' },
  ISSUED: { labelKey: 'myPage.couponBox.status.ISSUED', tone: 'success' },
  REDEEMED: { labelKey: 'myPage.couponBox.status.REDEEMED', tone: 'neutral' },
};

const COUPON_STATUS_FALLBACK: StatusPresentation = {
  labelKey: 'myPage.couponBox.status.UNKNOWN',
  tone: 'neutral',
};

/**
 * Resolves any server coupon status — including one this build does not know —
 * into a label key, badge tone, and text cue.
 */
export const getCouponStatusView: (
  status: CouponStatus | string | null | undefined,
) => StatusView<CouponStatus> = createStatusViewResolver(
  COUPON_STATUS_PRESENTATIONS,
  COUPON_STATUS_FALLBACK,
);

/**
 * Whether the coupon can still be shown to a merchant. Only `ISSUED` can;
 * anything else — including an unknown state — is treated as not presentable,
 * because presenting a coupon the server may already have consumed is worse
 * than hiding a valid one.
 *
 * This answers "can this coupon be used", never "can a coupon be issued".
 * Issuance is decided from the Offer response and the server's error, see
 * `getOfferIssuanceView`.
 */
export function canPresentCoupon(status: CouponStatus | string | null | undefined): boolean {
  return status === 'ISSUED';
}
