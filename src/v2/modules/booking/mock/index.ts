import { reservationMockHandlers, reservationRecordMockHandlers, merchantReservationMockHandlers } from '../reservations/mock';
import { paymentMockHandlers } from '../payments/mock';
import { offerCouponMockHandlers } from '../offers-coupons/mock';

// Preserve availability priority and tourist-before-merchant fallback precedence.
export const bookingMockHandlers = [
  ...reservationMockHandlers,
  ...reservationRecordMockHandlers,
  ...paymentMockHandlers,
  ...merchantReservationMockHandlers,
  ...offerCouponMockHandlers,
];
