import type { ReservationConfirmation, ReservationQuote } from '../../../booking';

// Transport fixtures only. This is not a successful operational quote or reservation.
export function draftQuote(confirmation: Partial<ReservationConfirmation> = {}, quote: Partial<ReservationQuote> = {}): ReservationQuote {
  return {
    confirmationToken: '00000000-0000-0000-0000-000000000349', remainingCapacity: 3,
    confirmation: {
      placeId: 1, placeName: 'Cafe', availabilityId: 10, productType: 'GENERAL', productId: null, productName: null,
      startsAt: '2026-09-20T05:00:00Z', endsAt: '2026-09-20T06:00:00Z', quantity: 2, timezone: 'Asia/Seoul',
      unitAmountMinor: 1000, additionalAmountMinor: 50, totalAmountMinor: 2050, currency: 'KRW', currencyFractionDigits: 0,
      paymentRequired: true, cancellable: true, cancellationDeadline: '2026-09-20T04:00:00Z', cancellationFeeMinor: 0,
      refundableAmountMinor: 2050, conditionsVersion: 1, productVersion: null, expiresAt: '2026-09-20T00:05:00Z',
      ...confirmation,
    },
    ...quote,
  };
}
