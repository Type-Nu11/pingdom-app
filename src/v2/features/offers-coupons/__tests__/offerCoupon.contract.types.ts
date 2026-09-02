import type { OffersCouponsSchema } from '../../../shared/api';
import type { Coupon } from '../api/offerCouponApi';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;
type Extends<Left, Right> = Left extends Right ? true : false;

// POST /offers/{offerId}/coupons 의 201 body 는 scoped 실서버 계약의
// CouponResponse 와 정확히 일치해야 한다.
export type IssuedCouponMatchesSchema = Assert<
  Equal<Coupon, OffersCouponsSchema<'CouponResponse'>>
>;

// 발급 화면이 다루는 세 상태는 계약의 CouponStatus 유니언에 모두 들어간다.
export type IssuedStatusIsAssignable = Assert<
  Extends<'EXPIRED' | 'ISSUED' | 'REDEEMED', Coupon['status']>
>;

// 발급 직후 상태로 쓰는 리터럴이 컴파일 타임에 통과하는지 확인한다.
export const issuedCouponSample: Coupon = {
  code: '11111111-1111-4111-8111-111111111111',
  expiresAt: '2026-09-30T23:59:59Z',
  id: 9_001,
  issuedAt: '2026-09-01T09:00:00Z',
  offerId: 401,
  redeemedAt: null,
  status: 'ISSUED',
};
