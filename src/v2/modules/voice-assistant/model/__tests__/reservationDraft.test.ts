import { prepareVoiceReservationDraft, formatDraftAmount } from '../reservationDraft';
import { draftQuote } from './reservationDraft.fixture';
import type { VoiceAvailabilityFacts } from '../voiceAssistantCommand.types';
import { createAvailabilitiesQueryOptions, createReservationQuoteQueryOptions } from '../../../booking';
import { configureApiTransport, type ApiTransport } from '../../../../shared/api';

const now = Date.parse('2026-09-20T00:00:00Z');
export const draftSelection = {
  place: { id: 1, name: 'Cafe', address: 'Seoul', touristCategories: ['CAFE' as const], operatingStatus: 'OPERATING' as const },
  availability: { id: 10, placeId: 1, productType: 'GENERAL', productId: null, productName: null,
    startsAt: '2026-09-20T05:00:00Z', endsAt: '2026-09-20T06:00:00Z', remainingCapacity: 3, status: 'ACTIVE' } as VoiceAvailabilityFacts,
  date: '2026-09-20', timezone: 'Asia/Seoul', quantity: 2, availabilityDataUpdatedAt: now,
};

test('quote times with equivalent offsets and millisecond formatting match the selected slot', () => {
  const quote = draftQuote({ startsAt: '2026-09-20T14:00:00+09:00', endsAt: '2026-09-20T15:00:00.000+09:00' });
  const draft = prepareVoiceReservationDraft(quote, draftSelection, now);
  expect(draft.confirmation.startsAt).toBe(quote.confirmation!.startsAt);
  expect(draft.confirmation.endsAt).toBe(quote.confirmation!.endsAt);
});

test('identical invalid timestamps cannot validate a draft', () => {
  const selection = { ...draftSelection, availability: { ...draftSelection.availability, startsAt: 'invalid' } };
  expect(() => prepareVoiceReservationDraft(draftQuote({ startsAt: 'invalid' }), selection, now))
    .toThrow('INVALID_SERVER_RESPONSE');
});

test('deployed offsetless UTC survives API normalization and strict draft validation', async () => {
  const rawSlot = { ...draftSelection.availability, totalCapacity: 3,
    startsAt: '2026-09-20T05:00:00', endsAt: '2026-09-20T06:00:00' };
  const quote = draftQuote({ startsAt: rawSlot.startsAt, endsAt: rawSlot.endsAt,
    cancellationDeadline: '2026-09-20T04:00:00', expiresAt: '2026-09-20T00:05:00' });
  const get = jest.fn(async (path: string) => ({ data: path.endsWith('/quote') ? quote : [rawSlot] }));
  const restore = configureApiTransport({ get } as unknown as ApiTransport);
  try {
    const [availability] = await createAvailabilitiesQueryOptions(1).queryFn({});
    const result = await createReservationQuoteQueryOptions(1, 10, 2, 'test-account').queryFn({});
    const draft = prepareVoiceReservationDraft(result, { ...draftSelection, availability }, now);
    expect(draft.confirmation.startsAt).toBe('2026-09-20T05:00:00Z');
    expect(draft.confirmation.cancellationDeadline).toBe('2026-09-20T04:00:00Z');
    expect(draft.confirmation).not.toHaveProperty('totalAmountMinor');
    expect(draft).not.toHaveProperty('confirmationToken');
    expect(get).toHaveBeenCalledTimes(2);
  } finally { restore(); }
});

test('non-cancellable scheduling is explicit and never invents a free price', () => {
  const quote = draftQuote({ unitAmountMinor: 0, additionalAmountMinor: 0, totalAmountMinor: 0, paymentRequired: false,
    refundableAmountMinor: 0, cancellable: false, cancellationDeadline: null });
  const draft = prepareVoiceReservationDraft(quote, draftSelection, now);
  expect(draft.confirmation).not.toHaveProperty('totalAmountMinor');
  expect(draft.confirmation.cancellable).toBe(false);
  expect(Object.isFrozen(draft.confirmation)).toBe(true);
  expect(draft).not.toHaveProperty('confirmationToken');
  (quote.confirmation!).totalAmountMinor = 999;
  expect(draft.confirmation).not.toHaveProperty('totalAmountMinor');
});

test.each([
  { placeId: 2 }, { placeName: 'Invented' }, { availabilityId: 11 }, { productId: 9 }, { quantity: 3 },
  { productType: 'TICKET' }, { startsAt: '2026-09-20T04:00:00Z' }, { endsAt: '2026-09-20T07:00:00Z' },
])('rejects mismatched server identifiers/displayed selection: %j', overrides => {
  expect(() => prepareVoiceReservationDraft(draftQuote(overrides as never), draftSelection, now)).toThrow('STALE_CONTEXT');
});

test.each([
  { cancellable: undefined }, { cancellationDeadline: null },
  { cancellationDeadline: '2026-09-20T05:01:00Z' }, { cancellationDeadline: '2026-02-30T00:00:00Z' },
  { conditionsVersion: NaN },
  { expiresAt: '2026-09-20T00:00:00Z' }, { expiresAt: '2026-09-20T00:06:00Z' },
  { timezone: 'invalid/zone' },
])('rejects absent/inconsistent/expired scheduling or policy without guesses: %j', overrides => {
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

test('#1793 accepts scheduling-only quote and projects no retired fields to the provider', () => {
  const old = draftQuote();
  const c = old.confirmation!;
  const quote = {
    confirmationToken: old.confirmationToken, remainingCapacity: old.remainingCapacity,
    confirmation: { placeId: c.placeId, placeName: c.placeName, availabilityId: c.availabilityId,
      startsAt: c.startsAt, endsAt: c.endsAt, quantity: c.quantity, timezone: c.timezone,
      cancellable: c.cancellable, cancellationDeadline: c.cancellationDeadline,
      conditionsVersion: c.conditionsVersion, expiresAt: c.expiresAt },
  };
  const draft = prepareVoiceReservationDraft(quote, draftSelection, now);
  expect(draft.confirmation).toEqual(quote.confirmation);
  expect(JSON.stringify(draft)).not.toMatch(/productType|productId|productName|AmountMinor|currency|paymentRequired|confirmationToken/);
});
