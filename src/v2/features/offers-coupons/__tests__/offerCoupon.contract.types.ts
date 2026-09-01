import type { ApiSchema } from '../../../shared/api';
import type { Coupon } from '../api/offerCouponApi';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;
type Extends<Left, Right> = Left extends Right ? true : false;

// POST /offers/{offerId}/coupons 의 201 body 는 계약의 Coupon 스키마 필드를 전부 포함한다.
// 목록/상세 화면이 쓰는 place·offer 요약 필드(benefitDescription 등)는 실서버가
// 얹어 주는 값이라 계약 스키마보다 넓혀져 있으므로 Equal 이 아니라 Extends 로 확인한다.
export type IssuedCouponMatchesSchema = Assert<Extends<Coupon, ApiSchema<'Coupon'>>>;

// 발급 화면이 다루는 세 상태는 계약의 CouponStatus 유니언에 모두 들어간다.
export type IssuedStatusIsAssignable = Assert<
  Extends<'EXPIRED' | 'ISSUED' | 'REDEEMED', Coupon['status']>
>;

// 발급 직후 상태로 쓰는 리터럴이 컴파일 타임에 통과하는지 확인한다.
export const issuedCouponSample: Coupon = {
  benefitDescription: null,
  code: '11111111-1111-4111-8111-111111111111',
  expiresAt: '2026-09-30T23:59:59Z',
  id: 9_001,
  issuedAt: '2026-09-01T09:00:00Z',
  offerId: 401,
  offerTitle: null,
  placeId: null,
  placeName: null,
  redeemedAt: null,
  status: 'ISSUED',
};
