import type { ReservationPaymentSchema } from '../../../reservationPaymentContract';

export const reservationDetailFixture = {
  availabilityId: 801,
  bookerName: '김민수',
  bookerPhone: '010-1234-5678',
  canceledAt: null,
  confirmedAt: '2026-08-25T04:15:00Z',
  createdAt: '2026-08-25T04:00:00Z',
  id: 901,
  productId: 501,
  productType: 'TICKET',
  quantity: 2,
  requestNote: '창가 자리 부탁드려요',
  reservationEndsAt: '2026-08-27T07:00:00Z',
  reservationStartsAt: '2026-08-27T06:00:00Z',
  status: 'CONFIRMED',
  touristUserId: 101,
  updatedAt: '2026-08-25T04:15:00Z',
} satisfies ReservationPaymentSchema<'ReservationResponse'>;

export const reservationListPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  reservations: [reservationDetailFixture],
  totalElements: 1,
  totalPages: 1,
} satisfies ReservationPaymentSchema<'ReservationPageResponse'>;

export const emptyReservationListPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  reservations: [],
  totalElements: 0,
  totalPages: 0,
} satisfies ReservationPaymentSchema<'ReservationPageResponse'>;

/**
 * The create response echoes the booker fields the request carried and starts
 * in `PENDING` with the availability's window attached.
 */
export function createdReservationFixture(
  body: Partial<ReservationPaymentSchema<'ReservationCreateRequest'>> = {},
): ReservationPaymentSchema<'ReservationResponse'> {
  return {
    ...reservationDetailFixture,
    availabilityId: body.availabilityId ?? reservationDetailFixture.availabilityId,
    bookerName: body.bookerName ?? null,
    bookerPhone: body.bookerPhone ?? null,
    canceledAt: null,
    confirmedAt: null,
    id: 902,
    quantity: body.quantity ?? 1,
    requestNote: body.requestNote ?? null,
    status: 'PENDING',
  };
}

export const paymentFixtures = [
  {
    amountMinor: null,
    createdAt: '2026-08-25T04:01:00Z',
    currency: null,
    failedAt: null,
    failureCode: null,
    id: 1001,
    paidAt: null,
    provider: 'TOSS_PAYMENTS',
    providerPaymentId: null,
    refundedAt: null,
    reservationId: 901,
    status: 'PROCESSING',
  },
  {
    amountMinor: 25000,
    createdAt: '2026-08-25T04:02:00Z',
    currency: 'KRW',
    failedAt: null,
    failureCode: null,
    id: 1002,
    paidAt: '2026-08-25T04:03:00Z',
    provider: 'TOSS_PAYMENTS',
    providerPaymentId: 'pay_1002',
    refundedAt: null,
    reservationId: 901,
    status: 'PAID',
  },
  {
    amountMinor: 25000,
    createdAt: '2026-08-25T04:02:00Z',
    currency: 'KRW',
    failedAt: null,
    failureCode: null,
    id: 1003,
    paidAt: '2026-08-25T04:03:00Z',
    provider: 'TOSS_PAYMENTS',
    providerPaymentId: 'pay_1003',
    refundedAt: null,
    reservationId: 901,
    status: 'REFUND_PROCESSING',
  },
  {
    amountMinor: null,
    createdAt: '2026-08-25T04:04:00Z',
    currency: null,
    failedAt: '2026-08-25T04:05:00Z',
    failureCode: 'PAYMENT_DECLINED',
    id: 1004,
    paidAt: null,
    provider: 'TOSS_PAYMENTS',
    providerPaymentId: null,
    refundedAt: null,
    reservationId: 901,
    status: 'FAILED',
  },
  {
    amountMinor: 25000,
    createdAt: '2026-08-25T04:06:00Z',
    currency: 'KRW',
    failedAt: null,
    failureCode: null,
    id: 1005,
    paidAt: '2026-08-25T04:07:00Z',
    provider: 'TOSS_PAYMENTS',
    providerPaymentId: 'pay_1005',
    refundedAt: '2026-08-25T05:00:00Z',
    reservationId: 901,
    status: 'REFUNDED',
  },
] as const satisfies readonly ReservationPaymentSchema<'PaymentResponse'>[];

export const paymentPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  payments: [...paymentFixtures],
  totalElements: paymentFixtures.length,
  totalPages: 1,
} satisfies ReservationPaymentSchema<'PaymentPageResponse'>;

export const emptyPaymentPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  payments: [],
  totalElements: 0,
  totalPages: 0,
} satisfies ReservationPaymentSchema<'PaymentPageResponse'>;
