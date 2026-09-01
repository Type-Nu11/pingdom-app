import { getApiErrorUx, type ApiErrorUxKind } from '../../../shared/api/getApiErrorUx';

/**
 * Screen that is showing the error. The common classification in
 * {@link getApiErrorUx} is surface-agnostic; the copy and the offered CTA are
 * not, so the feature layer owns that decision here.
 *
 * - `placeCta`   장소 상세의 Coupon 발급 CTA (issueCoupon / getOffer)
 * - `wallet`     내 Coupon 보관함 (listMyCoupons)
 * - `redeem`     현장 제시 · Merchant 사용 처리 (redeemCoupon)
 */
export type OfferCouponSurface = 'placeCta' | 'redeem' | 'wallet';

export type OfferCouponErrorCta = 'back' | 'none' | 'retry' | 'signIn' | 'viewWallet';

/**
 * Why the request failed, resolved to the most specific cause we can defend.
 * A bare `409` without a stable `ErrorResponse.code` stays `unconfirmedConflict`
 * — we never upgrade it to `soldOut` / `expired` / `alreadyIssued` by guessing.
 */
export type OfferCouponErrorReason =
  | 'alreadyIssued'
  | 'alreadyRedeemed'
  | 'authentication'
  | 'expired'
  | 'forbidden'
  | 'generic'
  | 'ineligible'
  | 'network'
  | 'notFound'
  | 'soldOut'
  | 'unconfirmedConflict'
  | 'updateRequired'
  | 'validation';

export type OfferCouponErrorUx = {
  cta: OfferCouponErrorCta;
  /** i18n key for the CTA label, or `null` when `cta` is `none`. */
  ctaLabelKey: string | null;
  /** i18n key. Resolves to user-safe copy — never the raw server message. */
  descriptionKey: string;
  kind: ApiErrorUxKind;
  reason: OfferCouponErrorReason;
  /** Retrying the same request can plausibly succeed with no user change. */
  retryable: boolean;
  /** i18n key. Resolves to user-safe copy — never the raw server message. */
  titleKey: string;
};

const CTA_LABEL_KEYS: Record<Exclude<OfferCouponErrorCta, 'none'>, string> = {
  back: 'offerCoupon.error.actions.back',
  retry: 'offerCoupon.error.actions.retry',
  signIn: 'offerCoupon.error.actions.signIn',
  viewWallet: 'offerCoupon.error.actions.viewWallet',
};

function resolveConflictReason(code: string | undefined): OfferCouponErrorReason {
  switch (code) {
    case 'CAPACITY_EXCEEDED':
      return 'soldOut';
    case 'COUPON_ALREADY_ISSUED':
      return 'alreadyIssued';
    case 'COUPON_ALREADY_REDEEMED':
      return 'alreadyRedeemed';
    default:
      return 'unconfirmedConflict';
  }
}

function resolveReason(
  kind: ApiErrorUxKind,
  code: string | undefined,
  surface: OfferCouponSurface,
): OfferCouponErrorReason {
  switch (kind) {
    case 'network':
      return 'network';
    case 'authentication':
      return 'authentication';
    case 'authorization':
      // issueCoupon 403 is "관광객 발급 조건 불충족" — an eligibility gate the
      // user may be able to resolve (e.g. an active travel schedule). On the
      // merchant redeem / wallet surfaces a 403 is a plain permission failure.
      return surface === 'placeCta' ? 'ineligible' : 'forbidden';
    case 'validation':
      return 'validation';
    case 'expired':
      return 'expired';
    case 'notFound':
      return 'notFound';
    case 'conflict':
      return resolveConflictReason(code);
    case 'updateRequired':
      return 'updateRequired';
    default:
      return 'generic';
  }
}

function resolveCta(
  reason: OfferCouponErrorReason,
  retryable: boolean,
  surface: OfferCouponSurface,
): OfferCouponErrorCta {
  if (retryable) {
    return 'retry';
  }

  switch (reason) {
    case 'authentication':
      return 'signIn';
    case 'alreadyIssued':
    case 'unconfirmedConflict':
      // The coupon may already be in the wallet; send the user there to check
      // instead of asserting a specific cause. From the wallet itself there is
      // nowhere further to go.
      return surface === 'wallet' ? 'none' : 'viewWallet';
    case 'notFound':
    case 'soldOut':
    case 'expired':
      return surface === 'wallet' ? 'none' : 'back';
    default:
      // alreadyRedeemed, forbidden, ineligible, validation, updateRequired:
      // nothing the user can usefully do from here.
      return 'none';
  }
}

/**
 * Map an API failure to consistent Coupon/Offer error UX for one surface.
 *
 * Guarantees:
 * - Same failure → same `reason` / `titleKey` / `descriptionKey` on every surface.
 * - Only i18n keys are returned; the raw server message, coupon code, tokens and
 *   trace ids are never propagated into user-facing copy.
 * - A cause is only named when the server backs it with a stable `code`.
 */
export function getOfferCouponErrorUx(
  value: unknown,
  surface: OfferCouponSurface,
): OfferCouponErrorUx {
  const base = getApiErrorUx(value);
  const reason = resolveReason(base.kind, base.error.code, surface);
  const cta = resolveCta(reason, base.retryable, surface);

  return {
    cta,
    ctaLabelKey: cta === 'none' ? null : CTA_LABEL_KEYS[cta],
    descriptionKey: `offerCoupon.error.${reason}.description`,
    kind: base.kind,
    reason,
    retryable: base.retryable,
    titleKey: `offerCoupon.error.${reason}.title`,
  };
}
