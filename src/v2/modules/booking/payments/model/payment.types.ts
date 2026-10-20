import type { AssertNever } from '../../../../shared/model';
import type { Payment } from '../api/paymentContract';
export type { ListPaymentsParams, Payment, PaymentPage } from '../api/paymentContract';

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
