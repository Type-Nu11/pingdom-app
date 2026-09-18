import type { Coupon } from '../../api/offerCouponApi';
import {
  canPresentCoupon,
  COUPON_STATUSES,
  getCouponStatusView,
  type CouponStatus,
} from '../couponPresentation';

describe('COUPON_STATUSES', () => {
  it('matches the generated CouponResponse contract exactly', () => {
    // Compile-time exhaustiveness lives in `CouponStatusContractAssertion`; this
    // pins the runtime list so a contract change is visible in the test run too.
    expect([...COUPON_STATUSES].sort()).toEqual(['EXPIRED', 'ISSUED', 'REDEEMED']);
  });

  it('is assignable from the generated coupon status type', () => {
    const status: CouponStatus = COUPON_STATUSES[0];
    const fromResponse: Coupon['status'] = status;
    expect(fromResponse).toBe('ISSUED');
  });
});

describe('getCouponStatusView', () => {
  it.each(COUPON_STATUSES)('gives %s a label key, tone, and text cue', (status) => {
    const view = getCouponStatusView(status);

    expect(view.known).toBe(true);
    expect(view.status).toBe(status);
    expect(view.labelKey).toBe(`myPage.couponBox.status.${status}`);
    expect(view.symbol).not.toBe('');
  });

  it('marks ISSUED as the only success tone', () => {
    expect(getCouponStatusView('ISSUED').tone).toBe('success');
    expect(getCouponStatusView('REDEEMED').tone).toBe('neutral');
    expect(getCouponStatusView('EXPIRED').tone).toBe('neutral');
  });

  it('falls back without throwing for an unknown server status', () => {
    const view = getCouponStatusView('SUSPENDED');

    expect(view.known).toBe(false);
    expect(view.status).toBeNull();
    expect(view.raw).toBe('SUSPENDED');
    expect(view.labelKey).toBe('myPage.couponBox.status.UNKNOWN');
  });

  it('falls back for a missing status', () => {
    expect(getCouponStatusView(undefined).labelKey).toBe('myPage.couponBox.status.UNKNOWN');
    expect(getCouponStatusView(null).labelKey).toBe('myPage.couponBox.status.UNKNOWN');
  });
});

describe('canPresentCoupon', () => {
  it('allows only ISSUED', () => {
    expect(canPresentCoupon('ISSUED')).toBe(true);
    expect(canPresentCoupon('REDEEMED')).toBe(false);
    expect(canPresentCoupon('EXPIRED')).toBe(false);
  });

  it('refuses unknown and missing statuses rather than guessing', () => {
    expect(canPresentCoupon('SUSPENDED')).toBe(false);
    expect(canPresentCoupon(undefined)).toBe(false);
    expect(canPresentCoupon(null)).toBe(false);
  });
});
