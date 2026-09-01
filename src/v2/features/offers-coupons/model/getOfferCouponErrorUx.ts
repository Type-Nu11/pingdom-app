import { getApiErrorUx, type ApiErrorUxKind } from '../../../shared/api/getApiErrorUx';

/**
 * Screen that is showing the error. The common classification in
 * {@link getApiErrorUx} is surface-agnostic; the copy and the offered CTA are
 * not, so the feature layer owns that decision here.
 *
 * - `placeCta`   장소 상세의 Coupon 발급 CTA (getIssuableOffer / issueCoupon)
 * - `wallet`     내 Coupon 보관함·상세 (listMyCoupons / getCoupon)
 * - `redeem`     현장 제시 · Merchant 사용 처리 (redeemCoupon)
 */
export type OfferCouponSurface = 'placeCta' | 'redeem' | 'wallet';
export type OfferCouponOperation =
  | 'getOffer'
  | 'issueCoupon'
  | 'listCoupons'
  | 'listOffers'
  | 'redeemCoupon';

export type OfferCouponErrorCta = 'back' | 'none' | 'retry' | 'signIn' | 'viewWallet';

/**
 * Why the request failed, resolved to the most specific cause we can defend.
 *
 * Live `/offers` and `/coupons` return an `ErrorResponse` with a `code` only for
 * `403`; `409` bodies carry no stable code, so a bare `409` never gets upgraded
 * to `soldOut` / `expired` / `alreadyIssued` by guessing — it stays
 * `unconfirmedConflict` (issue) or `redeemUsedOrExpired` (redeem).
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
  | 'redeemInvalidInput'
  | 'redeemUsedOrExpired'
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

/** CTAs that only send the user "back to the previous list/scanner". */
const BACK_REASONS = new Set<OfferCouponErrorReason>([
  'alreadyRedeemed',
  'expired',
  'notFound',
  'redeemInvalidInput',
  'redeemUsedOrExpired',
  'soldOut',
]);

function resolveConflictReason(
  code: string | undefined,
  surface: OfferCouponSurface,
): OfferCouponErrorReason {
  switch (code) {
    case 'CAPACITY_EXCEEDED':
      return 'soldOut';
    case 'COUPON_ALREADY_ISSUED':
      return 'alreadyIssued';
    case 'COUPON_ALREADY_REDEEMED':
      return 'alreadyRedeemed';
    default:
      // Live `409` for issue is "중복 발급 / 발급 기간 종료 / 수량 소진" and for
      // redeem is "사용되었거나 만료된 Coupon" — both without a code to tell them
      // apart, so keep the surface's honest umbrella message.
      return surface === 'redeem' ? 'redeemUsedOrExpired' : 'unconfirmedConflict';
  }
}

function resolveReason(
  kind: ApiErrorUxKind,
  code: string | undefined,
  surface: OfferCouponSurface,
  operation: OfferCouponOperation,
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
      return operation === 'issueCoupon' && code !== 'ACCESS_DENIED'
        ? 'ineligible'
        : 'forbidden';
    case 'validation':
      return surface === 'redeem' ? 'redeemInvalidInput' : 'validation';
    case 'expired':
      return 'expired';
    case 'notFound':
      return 'notFound';
    case 'conflict':
      return resolveConflictReason(code, surface);
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

  if (reason === 'authentication') {
    return 'signIn';
  }

  if (reason === 'alreadyIssued' || reason === 'unconfirmedConflict') {
    // The coupon may already be in the wallet; send the user there to check
    // instead of asserting a specific cause. Offering that from the wallet
    // itself is pointless.
    return surface === 'wallet' ? 'none' : 'viewWallet';
  }

  if (BACK_REASONS.has(reason)) {
    // The thing the user navigated to is gone or unusable; going back to the
    // previous list/scanner is always meaningful. The caller decides whether it
    // has a `back` handler to wire (a screen with its own top-bar back may not).
    return 'back';
  }

  // forbidden, ineligible, validation, updateRequired: nothing the user can
  // usefully do from here.
  return 'none';
}

/**
 * Map an API failure to consistent Coupon/Offer error UX for one surface.
 *
 * Guarantees:
 * - Same failure → same `reason` / `titleKey` / `descriptionKey` on that surface.
 * - Only i18n keys are returned; the raw server message, coupon code, tokens and
 *   trace ids are never propagated into user-facing copy.
 * - A cause is only named when the server backs it with a stable `code`.
 */
export function getOfferCouponErrorUx(
  value: unknown,
  surface: OfferCouponSurface,
  operation: OfferCouponOperation = surface === 'placeCta'
    ? 'issueCoupon'
    : surface === 'redeem'
      ? 'redeemCoupon'
      : 'listCoupons',
): OfferCouponErrorUx {
  const base = getApiErrorUx(value);
  const kind = (() => {
    if (base.kind !== 'generic') return base.kind;
    switch (base.error.status) {
      case 400: return 'validation';
      case 401: return 'authentication';
      case 403: return 'authorization';
      case 404: return 'notFound';
      case 409: return 'conflict';
      default: return base.kind;
    }
  })();
  const reason = resolveReason(kind, base.error.code, surface, operation);
  const retryable = kind === 'generic' || kind === 'network';
  const cta = resolveCta(reason, retryable, surface);

  return {
    cta,
    ctaLabelKey: cta === 'none' ? null : CTA_LABEL_KEYS[cta],
    descriptionKey: `offerCoupon.error.${reason}.description`,
    kind,
    reason,
    retryable,
    titleKey: `offerCoupon.error.${reason}.title`,
  };
}
