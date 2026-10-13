import { validateReservationQuote, ReservationConfirmationError } from '../../booking';
import type { ReservationConfirmation, ReservationQuote } from '../../booking';
import type { ReservationDraft, VoiceAvailabilityFacts, VoicePlaceFacts } from './voiceAssistantCommand.types';
import { VoiceCommandError } from './voiceCommandTime';

/** Runtime projection: generated types alone cannot certify an actual server response. */
export function prepareVoiceReservationDraft(
  value: unknown,
  selection: { place: VoicePlaceFacts; availability: VoiceAvailabilityFacts; quantity: number;
    date: string; timezone: string; availabilityDataUpdatedAt: number },
  now: number,
): ReservationDraft {
  let confirmation: Readonly<ReservationConfirmation>;
  try { confirmation = validateReservationQuote(value, {
    placeId: selection.place.id, placeName: selection.place.name,
    quantity: selection.quantity, availability: selection.availability,
  }, now); } catch (error) {
    if (error instanceof ReservationConfirmationError) throw new VoiceCommandError(error.code);
    throw error;
  }
  const quote = value as ReservationQuote;
  const a = selection.availability;
  return Object.freeze({ status: 'awaiting_user_confirmation', place: selection.place,
    availability: Object.freeze({ ...a, productType: 'GENERAL', productId: null, productName: null,
      remainingCapacity: quote.remainingCapacity }),
    quantity: selection.quantity, date: selection.date, timezone: selection.timezone, confirmation,
    source: Object.freeze({ placeId: confirmation.placeId, availabilityId: confirmation.availabilityId, productId: null,
      availabilityDataUpdatedAt: selection.availabilityDataUpdatedAt }),
  });
}

/** Display exactly the server's minor-unit integer without floating point rounding or FX guesses. */
export function formatDraftAmount(amountMinor: number, currency: string, fractionDigits: number): string {
  const digits = String(amountMinor).padStart(fractionDigits + 1, '0');
  return `${currency} ${fractionDigits ? `${digits.slice(0, -fractionDigits)}.${digits.slice(-fractionDigits)}` : digits}`;
}
