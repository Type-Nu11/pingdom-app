import type {
  ReservationPaymentOperationQuery,
  ReservationPaymentOperationResponse,
  ReservationPaymentSchema,
} from '../../../shared/api';

export type ListPaymentsParams = ReservationPaymentOperationQuery<'list_7'>;
export type Payment = ReservationPaymentSchema<'PaymentResponse'>;
export type PaymentPage = ReservationPaymentOperationResponse<'list_7', 200>;

export type PaymentStatus = Payment['status'];

export const PAYMENT_STATUSES = [
  'PROCESSING',
  'PAID',
  'REFUND_PROCESSING',
  'FAILED',
  'REFUNDED',
] as const satisfies readonly PaymentStatus[];

type AssertNever<Value extends never> = Value;
type AllOpenApiPaymentStatusesAreListed = AssertNever<
  Exclude<PaymentStatus, (typeof PAYMENT_STATUSES)[number]>
>;

export type PaymentStatusContractAssertion = AllOpenApiPaymentStatusesAreListed;
