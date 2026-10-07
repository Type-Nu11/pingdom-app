import { prepareVoiceReservationDraft, formatDraftAmount } from '../reservationDraft';
import { draftQuote } from './reservationDraft.fixture';
import type { VoiceAvailabilityFacts } from '../voiceAssistantCommand.types';

const now = Date.parse('2026-09-20T00:00:00Z');
export const draftSelection = {
  place: { id: 1, name: 'Cafe', address: 'Seoul', touristCategories: ['CAFE' as const], operatingStatus: 'OPERATING' as const },
  availability: { id: 10, placeId: 1, productType: 'GENERAL', productId: null, productName: null,
    startsAt: '2026-09-20T05:00:00Z', endsAt: '2026-09-20T06:00:00Z', remainingCapacity: 3, status: 'ACTIVE' } as VoiceAvailabilityFacts,
  date: '2026-09-20', timezone: 'Asia/Seoul', quantity: 2, availabilityDataUpdatedAt: now,
};

test('free and non-cancellable are accepted only as explicit complete server conditions', () => {
  const quote = draftQuote({ unitAmountMinor: 0, additionalAmountMinor: 0, totalAmountMinor: 0, paymentRequired: false,
    refundableAmountMinor: 0, cancellable: false, cancellationDeadline: null });
  const draft = prepareVoiceReservationDraft(quote, draftSelection, now);
  expect(draft.confirmation.totalAmountMinor).toBe(0);
  expect(draft.confirmation.cancellable).toBe(false);
  expect(Object.isFrozen(draft.confirmation)).toBe(true);
  expect(draft).not.toHaveProperty('confirmationToken');
  (quote.confirmation!).totalAmountMinor = 999;
  expect(draft.confirmation.totalAmountMinor).toBe(0);
});

test.each([
  { placeId: 2 }, { placeName: 'Invented' }, { availabilityId: 11 }, { productId: 9 }, { quantity: 3 },
  { productType: 'TICKET' }, { startsAt: '2026-09-20T04:00:00Z' }, { endsAt: '2026-09-20T07:00:00Z' },
])('rejects mismatched server identifiers/displayed selection: %j', overrides => {
  expect(() => prepareVoiceReservationDraft(draftQuote(overrides as never), draftSelection, now)).toThrow('STALE_CONTEXT');
});

test.each([
  { totalAmountMinor: undefined }, { currency: null }, { unitAmountMinor: -1 }, { unitAmountMinor: 1.5 },
  { unitAmountMinor: Number.MAX_SAFE_INTEGER }, { totalAmountMinor: 1000 }, { currency: 'won' },
  { currencyFractionDigits: -1 }, { currencyFractionDigits: 1.5 }, { currencyFractionDigits: 5 },
  { paymentRequired: false }, { cancellable: undefined }, { cancellationDeadline: null },
  { cancellationDeadline: '2026-09-20T05:01:00Z' }, { cancellationDeadline: '2026-02-30T00:00:00Z' },
  { cancellationFeeMinor: 50 }, { refundableAmountMinor: 1000 }, { conditionsVersion: NaN }, { productVersion: 1 },
  { expiresAt: '2026-09-20T00:00:00Z' }, { expiresAt: '2026-09-20T00:06:00Z' },
  { timezone: 'invalid/zone' },
])('rejects absent/inconsistent/expired price or policy without guesses: %j', overrides => {
  expect(() => prepareVoiceReservationDraft(draftQuote(overrides as never), draftSelection, now)).toThrow('INVALID_SERVER_RESPONSE');
});

test.each([
  null, {}, draftQuote({}, { confirmation: null }), draftQuote({}, { confirmationToken: 'not-a-token' }),
  draftQuote({}, { remainingCapacity: 1 }), draftQuote({}, { remainingCapacity: 1.5 }),
])('rejects incomplete quote response', quote => {
  expect(() => prepareVoiceReservationDraft(quote, draftSelection, now)).toThrow('INVALID_SERVER_RESPONSE');
});

test.each([[2050, 'KRW', 0, 'KRW 2050'], [2050, 'USD', 2, 'USD 20.50'], [5, 'USD', 2, 'USD 0.05'],
  [Number.MAX_SAFE_INTEGER, 'USD', 2, 'USD 90071992547409.91']] as const)('formats minor units without rounding (%s %s)', (amount, currency, digits, expected) => {
  expect(formatDraftAmount(amount, currency, digits)).toBe(expected);
});
