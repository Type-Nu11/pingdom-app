import {
  createStatusViewResolver,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { PaymentStatus } from './payment.types';

export type { PaymentStatus };

/**
 * Label keys live in the shared `payment.statuses` bundle so any screen showing
 * a payment — not only reservation detail — reads the same ko/en copy.
 *
 * `PROCESSING` and `REFUND_PROCESSING` are in-flight server states, shown as
 * warnings rather than progress the client owns: the app never advances a
 * payment to `PAID` or `REFUNDED` ahead of the server.
 */
const PAYMENT_STATUS_PRESENTATIONS: Readonly<Record<PaymentStatus, StatusPresentation>> = {
  FAILED: { labelKey: 'payment.statuses.FAILED', tone: 'error' },
  PAID: { labelKey: 'payment.statuses.PAID', tone: 'success' },
  PROCESSING: { labelKey: 'payment.statuses.PROCESSING', tone: 'warning' },
  REFUNDED: { labelKey: 'payment.statuses.REFUNDED', tone: 'neutral' },
  REFUND_PROCESSING: { labelKey: 'payment.statuses.REFUND_PROCESSING', tone: 'warning' },
};

export const getPaymentStatusView: (
  status: PaymentStatus | string | null | undefined,
) => StatusView<PaymentStatus> = createStatusViewResolver(
  PAYMENT_STATUS_PRESENTATIONS,
  { labelKey: 'payment.statuses.UNKNOWN', tone: 'neutral' },
);

/**
 * A payment amount is `null` until the server has one. Callers get `null` back
 * rather than `0`, which would read as a free reservation.
 */
export function getPaymentAmount(
  amountMinor: number | null | undefined,
  currency: string | null | undefined,
): Readonly<{ amountMinor: number; currency: string }> | null {
  if (typeof amountMinor !== 'number' || typeof currency !== 'string' || currency === '') {
    return null;
  }

  return { amountMinor, currency };
}
