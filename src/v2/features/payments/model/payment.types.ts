import type { AssertNever } from '../../../shared/model';
import type {
  ReservationPaymentOperationQuery,
  ReservationPaymentOperationResponse,
  ReservationPaymentSchema,
} from '../../../shared/api';

export type ListPaymentsParams = ReservationPaymentOperationQuery<'listMyPayments'>;
export type Payment = ReservationPaymentSchema<'PaymentResponse'>;
export type PaymentPage = ReservationPaymentOperationResponse<'listMyPayments', 200>;

export type PaymentStatus = Payment['status'];

export const PAYMENT_STATUSES = [
  'PROCESSING',
  'PAID',
  'REFUND_PROCESSING',
  'FAILED',
  'REFUNDED',
] as const satisfies readonly PaymentStatus[];

type AllOpenApiPaymentStatusesAreListed = AssertNever<
  Exclude<PaymentStatus, (typeof PAYMENT_STATUSES)[number]>
>;

export type PaymentStatusContractAssertion = AllOpenApiPaymentStatusesAreListed;
