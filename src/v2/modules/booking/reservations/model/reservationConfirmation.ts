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
  availability: Pick<Availability, 'id' | 'startsAt' | 'endsAt'>;
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
  if (c.placeId !== selection.placeId || c.placeName !== selection.placeName || c.availabilityId !== a.id
    || c.quantity !== selection.quantity) {
    throw new ReservationConfirmationError('STALE_CONTEXT');
  }
  // Explicit legacy product snapshots cannot be treated as the new place-only contract.
  if ((c.productType !== undefined && c.productType !== 'GENERAL')
    || (c.productId !== undefined && c.productId !== null)
    || (c.productName !== undefined && c.productName !== null)) {
    throw new ReservationConfirmationError('STALE_CONTEXT');
  }
  const start = serverInstant(c.startsAt), end = serverInstant(c.endsAt);
  if (start !== serverInstant(a.startsAt) || end !== serverInstant(a.endsAt)) {
    throw new ReservationConfirmationError('STALE_CONTEXT');
  }
  const expires = serverInstant(c.expiresAt);
  if (!(now < start && start < end && now < expires && expires <= start && expires <= now + 300000)) return invalid();
  if (typeof c.timezone !== 'string' || !c.timezone) return invalid();
  try { new Intl.DateTimeFormat('en', { timeZone: c.timezone }).format(now); } catch { return invalid(); }
  if (typeof c.cancellable !== 'boolean' || !nonnegativeInteger(c.conditionsVersion)) return invalid();
  if (c.cancellable) {
    if (serverInstant(c.cancellationDeadline) > start) return invalid();
  } else if (c.cancellationDeadline !== null) return invalid();
  // Only explicit, validated server facts survive. No inferred free price or cancellation policy.
  const confirmation: Readonly<ReservationConfirmation> = Object.freeze({
    placeId: c.placeId, placeName: c.placeName, availabilityId: c.availabilityId,
    startsAt: c.startsAt, endsAt: c.endsAt, quantity: c.quantity, timezone: c.timezone,
    cancellable: c.cancellable, cancellationDeadline: c.cancellationDeadline,
    conditionsVersion: c.conditionsVersion, expiresAt: c.expiresAt,
  });
  return confirmation;
}
