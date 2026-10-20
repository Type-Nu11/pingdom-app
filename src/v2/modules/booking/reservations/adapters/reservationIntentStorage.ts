import { env } from '../../../../shared/config/env';
import * as Keychain from 'react-native-keychain';
import type { ReservationIntent, ReservationIntentStorage } from '../model/confirmedReservation';
import { validateReservationQuote } from '../model/reservationConfirmation';
import { validateBookerInput } from '../model/reservationBooker';

const service = (accountId: string) => `pingdom.v2.reservation-intent.${encodeURIComponent(env.apiBaseUrl)}.${encodeURIComponent(accountId)}`;
export function parseReservationIntent(raw: string, accountId: string): ReservationIntent {
  const value = JSON.parse(raw) as ReservationIntent;
  const b = value?.body, c = value?.confirmation;
  if (value?.version !== 1 || value.accountId !== accountId || !Number.isSafeInteger(value.placeId) || value.placeId <= 0
    || !b || !c || b.availabilityId !== c.availabilityId || b.quantity !== c.quantity || c.placeId !== value.placeId
    || !Number.isSafeInteger(b.availabilityId) || b.availabilityId <= 0 || !Number.isSafeInteger(b.quantity) || b.quantity < 1 || b.quantity > 12
    || typeof b.confirmationToken !== 'string' || !b.confirmationToken || typeof b.idempotencyKey !== 'string'
    || !b.idempotencyKey || b.idempotencyKey.length > 100
    || typeof b.bookerName !== 'string' || typeof b.bookerPhone !== 'string'
    || (b.requestNote !== undefined && typeof b.requestNote !== 'string')
    || !validateBookerInput({ bookerName: b.bookerName, bookerPhone: b.bookerPhone, requestNote: b.requestNote ?? '' }).isValid) {
    throw new Error('INVALID_RESERVATION_INTENT');
  }
  const confirmation = validateReservationQuote({ confirmation: c, confirmationToken: b.confirmationToken, remainingCapacity: b.quantity },
    { placeId: value.placeId, placeName: c.placeName, quantity: b.quantity, availability: { id: c.availabilityId, ...c } }, Date.parse(c.expiresAt) - 1);
  if (Object.keys(b).some(key => !['availabilityId', 'quantity', 'confirmationToken', 'idempotencyKey', 'bookerName', 'bookerPhone', 'requestNote'].includes(key))) throw new Error('INVALID_RESERVATION_INTENT');
  return Object.freeze({ ...value, body: Object.freeze({ ...b }), confirmation });
}
export const reservationIntentStorage: ReservationIntentStorage = {
  async read(accountId) {
    const stored = await Keychain.getGenericPassword({ service: service(accountId) });
    return stored ? parseReservationIntent(stored.password, accountId) : null;
  },
  async write(intent) {
    const result = await Keychain.setGenericPassword('reservation-intent', JSON.stringify(intent), { service: service(intent.accountId) });
    if (!result) throw new Error('RESERVATION_INTENT_STORAGE_FAILED');
  },
  async remove(accountId, idempotencyKey) {
    const stored = await Keychain.getGenericPassword({ service: service(accountId) });
    if (!stored || parseReservationIntent(stored.password, accountId).body.idempotencyKey !== idempotencyKey) return;
    await Keychain.resetGenericPassword({ service: service(accountId) });
    if (await Keychain.getGenericPassword({ service: service(accountId) })) throw new Error('RESERVATION_INTENT_DELETE_FAILED');
  },
};
