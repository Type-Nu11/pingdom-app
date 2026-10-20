import type {
  ReservationPaymentOperationQuery,
  ReservationPaymentOperationResponse,
  ReservationPaymentSchema,
} from '../../../../shared/api/reservationPaymentContract';

export type ListPaymentsParams = ReservationPaymentOperationQuery<'listMyPayments'>;
export type Payment = ReservationPaymentSchema<'PaymentResponse'>;
export type PaymentPage = ReservationPaymentOperationResponse<'listMyPayments', 200>;
