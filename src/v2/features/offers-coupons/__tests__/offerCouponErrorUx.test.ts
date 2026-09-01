import { ApiError } from '../../../shared/api';
import {
  getOfferCouponErrorUx,
  type OfferCouponSurface,
} from '../model/getOfferCouponErrorUx';
import { offerCouponResources } from '../i18n/offerCouponResources';

function readKey(path: string, language: 'en' | 'ko'): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, offerCouponResources[language]);
}

function apiError(init: { code?: string; message?: string; status?: number }): ApiError {
  return new ApiError(init.message ?? 'server error', {
    code: init.code,
    status: init.status,
  });
}

describe('getOfferCouponErrorUx', () => {
  // surface, error init, expected { reason, cta, retryable }
  const cases: Array<{
    cta: string;
    error: { code?: string; status?: number };
    reason: string;
    retryable: boolean;
    surface: OfferCouponSurface;
    title: string;
  }> = [
    {
      title: 'placeCta 401 → re-auth via the shared sign-in recovery flow',
      surface: 'placeCta',
      error: { status: 401, code: 'TOKEN_EXPIRED' },
      reason: 'authentication',
      cta: 'signIn',
      retryable: false,
    },
    {
      title: 'placeCta 403 is an eligibility gate, not a raw permission error',
      surface: 'placeCta',
      error: { status: 403 },
      reason: 'ineligible',
      cta: 'none',
      retryable: false,
    },
    {
      title: 'redeem 403 is a plain permission failure',
      surface: 'redeem',
      error: { status: 403 },
      reason: 'forbidden',
      cta: 'none',
      retryable: false,
    },
    {
      title: 'placeCta 404 → back to the latest list',
      surface: 'placeCta',
      error: { status: 404, code: 'OFFER_NOT_FOUND' },
      reason: 'notFound',
      cta: 'back',
      retryable: false,
    },
    {
      title: 'wallet 400 → non-actionable list load failure',
      surface: 'wallet',
      error: { status: 400 },
      reason: 'validation',
      cta: 'none',
      retryable: false,
    },
    {
      title: 'placeCta 409 without a server code stays unconfirmed',
      surface: 'placeCta',
      error: { status: 409 },
      reason: 'unconfirmedConflict',
      cta: 'viewWallet',
      retryable: false,
    },
    {
      title: 'placeCta 409 CAPACITY_EXCEEDED → sold out',
      surface: 'placeCta',
      error: { status: 409, code: 'CAPACITY_EXCEEDED' },
      reason: 'soldOut',
      cta: 'back',
      retryable: false,
    },
    {
      title: 'placeCta 409 COUPON_ALREADY_ISSUED → check the wallet',
      surface: 'placeCta',
      error: { status: 409, code: 'COUPON_ALREADY_ISSUED' },
      reason: 'alreadyIssued',
      cta: 'viewWallet',
      retryable: false,
    },
    {
      title: 'redeem 409 COUPON_ALREADY_REDEEMED → no rollback, no action',
      surface: 'redeem',
      error: { status: 409, code: 'COUPON_ALREADY_REDEEMED' },
      reason: 'alreadyRedeemed',
      cta: 'none',
      retryable: false,
    },
    {
      title: 'redeem 410 COUPON_EXPIRED → expired, back to the scanner',
      surface: 'redeem',
      error: { status: 410, code: 'COUPON_EXPIRED' },
      reason: 'expired',
      cta: 'back',
      retryable: false,
    },
    {
      title: 'placeCta 410 COUPON_EXPIRED → expired, back to list',
      surface: 'placeCta',
      error: { status: 410, code: 'COUPON_EXPIRED' },
      reason: 'expired',
      cta: 'back',
      retryable: false,
    },
    {
      title: 'wallet 5xx → generic, retryable',
      surface: 'wallet',
      error: { status: 503 },
      reason: 'generic',
      cta: 'retry',
      retryable: true,
    },
    {
      title: 'placeCta 426 → app update required',
      surface: 'placeCta',
      error: { status: 426, code: 'UNSUPPORTED_APP_VERSION' },
      reason: 'updateRequired',
      cta: 'none',
      retryable: false,
    },
  ];

  it.each(cases)('$title', ({ surface, error, reason, cta, retryable }) => {
    const ux = getOfferCouponErrorUx(apiError(error), surface);

    expect(ux.reason).toBe(reason);
    expect(ux.cta).toBe(cta);
    expect(ux.retryable).toBe(retryable);
    expect(ux.titleKey).toBe(`offerCoupon.error.${reason}.title`);
    expect(ux.descriptionKey).toBe(`offerCoupon.error.${reason}.description`);
    expect(ux.ctaLabelKey).toBe(cta === 'none' ? null : `offerCoupon.error.actions.${cta}`);
  });

  it('classifies transport failures as retryable network errors', () => {
    const networkError = new ApiError('Network Error', { isNetworkError: true });
    const ux = getOfferCouponErrorUx(networkError, 'placeCta');

    expect(ux.kind).toBe('network');
    expect(ux.reason).toBe('network');
    expect(ux.cta).toBe('retry');
    expect(ux.retryable).toBe(true);
  });

  it('gives the same reason and copy keys for one failure across every surface', () => {
    const surfaces: OfferCouponSurface[] = ['placeCta', 'wallet', 'redeem'];
    const results = surfaces.map((surface) =>
      getOfferCouponErrorUx(apiError({ status: 410, code: 'COUPON_EXPIRED' }), surface),
    );

    for (const ux of results) {
      expect(ux.reason).toBe('expired');
      expect(ux.titleKey).toBe(results[0].titleKey);
      expect(ux.descriptionKey).toBe(results[0].descriptionKey);
    }
  });

  it('never puts the raw server message, coupon code, or trace id in user-facing output', () => {
    const leaky = new ApiError('coupon ABCD-1234 for user 42 is invalid', {
      code: 'COUPON_ALREADY_REDEEMED',
      status: 409,
      traceId: 'trace-secret-999',
    });
    const ux = getOfferCouponErrorUx(leaky, 'redeem');
    const userFacing = [ux.titleKey, ux.descriptionKey, ux.ctaLabelKey].join(' ');

    expect(userFacing).not.toMatch(/ABCD-1234|user 42|trace-secret/);
    expect(ux.titleKey.startsWith('offerCoupon.error.')).toBe(true);
    expect(ux.descriptionKey.startsWith('offerCoupon.error.')).toBe(true);
  });

  it('ships ko and en copy for every reason and CTA the model can emit', () => {
    const reasons = [
      'alreadyIssued',
      'alreadyRedeemed',
      'authentication',
      'expired',
      'forbidden',
      'generic',
      'ineligible',
      'network',
      'notFound',
      'soldOut',
      'unconfirmedConflict',
      'updateRequired',
      'validation',
    ];
    const ctas = ['back', 'retry', 'signIn', 'viewWallet'];

    for (const language of ['en', 'ko'] as const) {
      for (const reason of reasons) {
        expect(typeof readKey(`offerCoupon.error.${reason}.title`, language)).toBe('string');
        expect(typeof readKey(`offerCoupon.error.${reason}.description`, language)).toBe('string');
      }
      for (const cta of ctas) {
        expect(typeof readKey(`offerCoupon.error.actions.${cta}`, language)).toBe('string');
      }
    }
  });
});
