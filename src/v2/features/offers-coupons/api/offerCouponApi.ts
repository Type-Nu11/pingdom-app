// #362 test-only compatibility: src/app/navigation/__tests__/SettingsNavigation.test.tsx.
// Preserves offerCouponApi spy object identity. Production imports are forbidden.
export { offerCouponApi } from '../../../modules/booking/offers-coupons/__tests__';
