import { parseServerInstant } from '../../../../shared/model';
import type { ReservationConfirmation, ReservationQuote } from '../api/reservationApi';
import type { Availability } from './reservationAvailability';

export class ReservationConfirmationError extends Error {
  constructor(readonly code: 'INVALID_SERVER_RESPONSE' | 'UNSUPPORTED_PRODUCT' | 'STALE_CONTEXT') { super(code); }
}
function invalid(): never { throw new ReservationConfirmationError('INVALID_SERVER_RESPONSE'); }
const nonnegativeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
function serverInstant(value: unknown): number {
  const instant = parseServerInstant(value);
  if (instant === null) return invalid();
  return instant;
}
export function validateReservationQuote(value: unknown, selection: {
  placeId: number; placeName: string; quantity: number;
  availability: Pick<Availability, 'id' | 'productType' | 'productId' | 'productName' | 'startsAt' | 'endsAt'>;
}, now: number): Readonly<ReservationConfirmation> {
  if (!value || typeof value !== 'object') return invalid();
  const quote = value as ReservationQuote;
  const c = quote.confirmation;
  const a = selection.availability;
  // Tokens are validated here but intentionally excluded from provider results and draft UI.
  if (typeof quote.confirmationToken !== 'string'
    || quote.confirmationToken.length !== 36
    || !c || typeof c !== 'object'
    || !nonnegativeInteger(quote.remainingCapacity) || quote.remainingCapacity < selection.quantity) return invalid();
  if (a.productType !== 'GENERAL' || a.productId !== null || a.productName !== null) {
    throw new ReservationConfirmationError('UNSUPPORTED_PRODUCT');
  }
  if (c.placeId !== selection.placeId || c.placeName !== selection.placeName || c.availabilityId !== a.id
    || c.productType !== a.productType || c.productId !== a.productId || c.productName !== a.productName
    || c.startsAt !== a.startsAt || c.endsAt !== a.endsAt || c.quantity !== selection.quantity) {
    throw new ReservationConfirmationError('STALE_CONTEXT');
  }
  const start = serverInstant(c.startsAt), end = serverInstant(c.endsAt), expires = serverInstant(c.expiresAt);
  if (!(now < start && start < end && now < expires && expires <= start && expires <= now + 300000)) return invalid();
  if (typeof c.timezone !== 'string' || !c.timezone) return invalid();
  try { new Intl.DateTimeFormat('en', { timeZone: c.timezone }).format(now); } catch { return invalid(); }
  if (![c.unitAmountMinor, c.additionalAmountMinor, c.totalAmountMinor, c.cancellationFeeMinor, c.refundableAmountMinor].every(nonnegativeInteger)
    || !Number.isSafeInteger(c.unitAmountMinor * c.quantity + c.additionalAmountMinor)
    || c.totalAmountMinor !== c.unitAmountMinor * c.quantity + c.additionalAmountMinor
    || typeof c.currency !== 'string' || !/^[A-Z]{3}$/.test(c.currency)
    || !nonnegativeInteger(c.currencyFractionDigits) || c.currencyFractionDigits > 4
    || c.paymentRequired !== (c.totalAmountMinor > 0)
    || typeof c.cancellable !== 'boolean' || c.cancellationFeeMinor !== 0
    || !nonnegativeInteger(c.conditionsVersion)
    || c.productVersion !== null) return invalid();
  if (c.cancellable) {
    if (serverInstant(c.cancellationDeadline) > start || c.refundableAmountMinor !== c.totalAmountMinor) return invalid();
  } else if (c.cancellationDeadline !== null || c.refundableAmountMinor !== 0) return invalid();
  // Only explicit, validated server facts survive. No inferred free price or cancellation policy.
  const confirmation: Readonly<ReservationConfirmation> = Object.freeze({
    placeId: c.placeId, placeName: c.placeName, availabilityId: c.availabilityId,
    productType: c.productType, productId: c.productId, productName: c.productName,
    startsAt: c.startsAt, endsAt: c.endsAt, quantity: c.quantity, timezone: c.timezone,
    unitAmountMinor: c.unitAmountMinor, additionalAmountMinor: c.additionalAmountMinor,
    totalAmountMinor: c.totalAmountMinor, currency: c.currency, currencyFractionDigits: c.currencyFractionDigits,
    paymentRequired: c.paymentRequired, cancellable: c.cancellable, cancellationDeadline: c.cancellationDeadline,
    cancellationFeeMinor: c.cancellationFeeMinor, refundableAmountMinor: c.refundableAmountMinor,
    conditionsVersion: c.conditionsVersion, productVersion: c.productVersion, expiresAt: c.expiresAt,
  });
  return confirmation;
}
