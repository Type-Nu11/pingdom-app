import { ApiError } from '../../../../../shared/api';
import { createConfirmedReservation, isSelectableConfirmedSlot, type ReservationIntent, type ReservationIntentStorage } from '../confirmedReservation';
import type { Availability } from '../reservationAvailability';
import type { ReservationQuote, Reservation, CreateReservationBody } from '../../api/reservationApi';
import { parseReservationIntent } from '../../adapters/reservationIntentStorage';

const initialNow = Date.parse('2026-10-10T00:00:00Z');
const slot: Availability = { id: 10, placeId: 1, productType: 'GENERAL', productId: null, productName: null,
  startsAt: '2026-10-10T05:00:00Z', endsAt: '2026-10-10T06:00:00Z', status: 'ACTIVE', remainingCapacity: 3, totalCapacity: 3,
  conditionsVersion: 1, reservationTerms: { unitAmountMinor: 1000, additionalAmountMinor: 50, currency: 'KRW', timezone: 'Asia/Seoul', cancellable: true, cancellationCutoffMinutes: 60 } };
const booker = { bookerName: ' Test ', bookerPhone: ' +82 1012345678 ', requestNote: ' Window ' };
const selection = { placeId: 1, placeName: 'Cafe', availability: slot, quantity: 2 };
function quote(now = initialNow): ReservationQuote {
  return { confirmationToken: '00000000-0000-0000-0000-000000000349', remainingCapacity: 3,
    confirmation: { placeId: 1, placeName: 'Cafe', availabilityId: 10, productType: 'GENERAL', productId: null, productName: null,
      startsAt: slot.startsAt, endsAt: slot.endsAt, quantity: 2, timezone: 'Asia/Seoul', unitAmountMinor: 1000,
      additionalAmountMinor: 50, totalAmountMinor: 2050, currency: 'KRW', currencyFractionDigits: 0, paymentRequired: true,
      cancellable: true, cancellationDeadline: '2026-10-10T04:00:00Z', cancellationFeeMinor: 0, refundableAmountMinor: 2050,
      conditionsVersion: 1, productVersion: null, expiresAt: new Date(now + 300000).toISOString() } };
}
function created(intent: ReservationIntent): Reservation {
  return { id: 901, availabilityId: 10, productId: null, productType: 'GENERAL', quantity: 2,
    status: 'PENDING', touristUserId: 101, bookerName: 'Test', bookerPhone: '+82 1012345678', requestNote: 'Window',
    reservationStartsAt: slot.startsAt, reservationEndsAt: slot.endsAt, confirmation: intent.confirmation,
    createdAt: new Date(initialNow).toISOString(), updatedAt: new Date(initialNow).toISOString(), canceledAt: null, confirmedAt: null };
}
function harness() {
  let now = initialNow, mono = 0, current = true, record: ReservationIntent | null = null;
  const storage: ReservationIntentStorage = {
    read: jest.fn(async () => record), write: jest.fn(async intent => { record = intent; }), remove: jest.fn(async () => { record = null; }),
  };
  const list = jest.fn(async () => [slot]);
  const getQuote = jest.fn(async () => quote(now));
  const create = jest.fn(async (_body: CreateReservationBody, _placeId: number) => created(record!));
  const deps = { accountId: '101', isCurrent: () => current, now: () => now, monotonic: () => mono, storage, list, quote: getQuote, create };
  const controller = createConfirmedReservation(deps);
  return { controller, deps, storage, list, getQuote, create, record: () => record,
    advance: (ms: number) => { now += ms; mono += ms; }, rollback: () => { now -= 600000; mono += 300001; },
    logout: () => { current = false; controller.cancel(); }, reconnect: () => { current = true; }, created };
}

test('prepare and cancel never create; explicit confirmation sends exact displayed IDs and normalized booker fields', async () => {
  const h = harness(); await h.controller.prepare(selection);
  expect(h.create).not.toHaveBeenCalled(); expect(h.controller.getSnapshot().phase).toBe('review');
  await h.controller.confirm(booker);
  expect(h.create).toHaveBeenCalledTimes(1);
  expect(h.create.mock.calls[0][0]).toEqual(expect.objectContaining({ availabilityId: 10, quantity: 2, bookerName: 'Test', bookerPhone: '+82 1012345678', requestNote: 'Window', confirmationToken: quote().confirmationToken }));
  expect(h.controller.getSnapshot().phase).toBe('success'); expect(h.record()).toBeNull();
});
test('cancel before confirmation produces zero requests', async () => { const h = harness(); await h.controller.prepare(selection); h.controller.cancel(); await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); });
test('invalid booker input produces zero requests', async () => { const h = harness(); await h.controller.prepare(selection); await h.controller.confirm({ ...booker, bookerPhone: '' }); expect(h.create).not.toHaveBeenCalled(); });
test('continuous confirmation submits only once and persists before sending', async () => {
  const h = harness(); await h.controller.prepare(selection);
  await Promise.all([h.controller.confirm(booker), h.controller.confirm(booker), h.controller.confirm(booker)]);
  expect(h.create).toHaveBeenCalledTimes(1); expect(h.storage.write).toHaveBeenCalledTimes(1);
  expect(jest.mocked(h.storage.write).mock.invocationCallOrder[0]).toBeLessThan(h.create.mock.invocationCallOrder[0]);
});
test.each(['price', 'policy', 'version'] as const)('%s change requires another explicit confirmation', async change => {
  const h = harness(); await h.controller.prepare(selection);
  h.getQuote.mockImplementation(async () => { const q = quote(); if (change === 'price') Object.assign(q.confirmation!, { unitAmountMinor: 2000, totalAmountMinor: 4050, refundableAmountMinor: 4050 });
    if (change === 'policy') Object.assign(q.confirmation!, { cancellable: false, cancellationDeadline: null, refundableAmountMinor: 0 });
    if (change === 'version') q.confirmation!.conditionsVersion = 2; return q; });
  await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled();
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'review', changed: true });
  await h.controller.confirm(booker); expect(h.create).toHaveBeenCalledTimes(1);
});
test.each([{ remainingCapacity: 1 }, { status: 'INACTIVE' as const }, { startsAt: '2026-10-10T05:30:00Z' }])('changed availability blocks write: %p', async overrides => {
  const h = harness(); await h.controller.prepare(selection); h.list.mockResolvedValue([{ ...slot, ...overrides }]); await h.controller.confirm(booker);
  expect(h.create).not.toHaveBeenCalled(); expect(h.controller.getSnapshot().phase).toBe('error');
});
test('expired quote requires renewed explicit confirmation', async () => { const h = harness(); await h.controller.prepare(selection); h.advance(300001); await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'review', changed: true }); });
test('clock rollback cannot extend confirmation validity', async () => { const h = harness(); await h.controller.prepare(selection); h.rollback(); await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'review', changed: true }); });
test('storage write failure blocks reservation submission', async () => { const h = harness(); await h.controller.prepare(selection); jest.mocked(h.storage.write).mockRejectedValue(new Error()); await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', code: 'storage' }); });
test.each([new ApiError('timeout', { isNetworkError: true }), new ApiError('server', { status: 503 })])('unknown result replays the same key, token and body after expiry; new preparation is blocked', async error => {
  const h = harness(); await h.controller.prepare(selection); h.create.mockRejectedValueOnce(error);
  await h.controller.confirm(booker); const request = h.create.mock.calls[0][0]; const quoteCount = h.getQuote.mock.calls.length;
  expect(h.controller.getSnapshot().phase).toBe('unknown'); await h.controller.prepare(selection); expect(h.getQuote).toHaveBeenCalledTimes(quoteCount);
  h.advance(3600000); await h.controller.retry(); expect(h.create.mock.calls[1][0]).toBe(request); expect(h.getQuote).toHaveBeenCalledTimes(quoteCount); expect(h.controller.getSnapshot().phase).toBe('success');
});
test('restart restores unknown request without automatic submit and recovery does not create a new key', async () => {
  const h = harness(); await h.controller.prepare(selection); h.create.mockRejectedValueOnce(new ApiError('lost', { status: 503 })); await h.controller.confirm(booker);
  const record = h.record()!; const restarted = createConfirmedReservation(h.deps); await restarted.restore();
  expect(restarted.getSnapshot().phase).toBe('unknown'); expect(h.create).toHaveBeenCalledTimes(1); await restarted.retry(); expect(h.create.mock.calls[1][0]).toBe(record.body);
});
test('final rejection clears intent and requires fresh selection', async () => { const h = harness(); await h.controller.prepare(selection); h.create.mockRejectedValueOnce(new ApiError('capacity', { status: 409, code: 'RESERVATION_CAPACITY_EXCEEDED' })); await h.controller.confirm(booker); expect(h.record()).toBeNull(); expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', code: 'rejected' }); await h.controller.confirm(booker); expect(h.create).toHaveBeenCalledTimes(1); });
test('unverified successful response is recoverable and never reported as success', async () => { const h = harness(); await h.controller.prepare(selection); h.create.mockImplementationOnce(async () => ({ ...created(h.record()!), quantity: 3 })); await h.controller.confirm(booker); expect(h.controller.getSnapshot().phase).toBe('unknown'); expect(h.record()).not.toBeNull(); });
test('failed secure deletion retains same request recovery', async () => { const h = harness(); await h.controller.prepare(selection); jest.mocked(h.storage.remove).mockRejectedValueOnce(new Error()); await h.controller.confirm(booker); expect(h.controller.getSnapshot().phase).toBe('unknown'); await h.controller.retry(); expect(h.create.mock.calls[1][0]).toBe(h.create.mock.calls[0][0]); expect(h.controller.getSnapshot().phase).toBe('success'); });
test('logout during final recheck prevents submission', async () => { const h = harness(); await h.controller.prepare(selection); h.getQuote.mockImplementationOnce(async () => { h.logout(); return quote(); }); await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); });
test('background after sending retains recovery without painting a late success', async () => { const h = harness(); await h.controller.prepare(selection); h.create.mockImplementationOnce(async () => { h.logout(); throw new ApiError('lost', { isNetworkError: true }); }); await h.controller.confirm(booker); expect(h.record()).not.toBeNull(); expect(h.controller.getSnapshot().phase).toBe('unknown'); });
test('secure recovery rejects another account and unexpected request fields', async () => { const h = harness(); await h.controller.prepare(selection); h.create.mockRejectedValueOnce(new Error()); await h.controller.confirm(booker); const record = h.record()!;
  expect(parseReservationIntent(JSON.stringify(record), '101').body).toEqual(record.body);
  expect(() => parseReservationIntent(JSON.stringify(record), '102')).toThrow();
  expect(() => parseReservationIntent(JSON.stringify({ ...record, body: { ...record.body, extra: true } }), '101')).toThrow();
});
test.each([{ productType: 'TICKET' as const }, { productType: 'CLASS' as const }, { remainingCapacity: 0 }, { status: 'INACTIVE' as const }, { startsAt: new Date(initialNow - 1).toISOString() }])('unsupported/unavailable slots cannot be selected: %p', overrides => { expect(isSelectableConfirmedSlot({ ...slot, ...overrides }, 2, initialNow)).toBe(false); });

test('cancellation while saving the unsubmitted intent prevents the HTTP write', async () => {
  const h = harness(); await h.controller.prepare(selection);
  const write = h.storage.write;
  jest.mocked(h.storage.write).mockImplementationOnce(async intent => { await write(intent); h.controller.cancel(); });
  await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); expect(h.record()).toBeNull();
});
test('storage read failure blocks a new preparation and keeps a visible recovery error', async () => {
  const h = harness(); jest.mocked(h.storage.read).mockRejectedValue(new Error()); await h.controller.prepare(selection);
  expect(h.controller.getSnapshot()).toMatchObject({ phase: 'error', code: 'storage' }); expect(h.create).not.toHaveBeenCalled();
});
test('expiry while persisting the intent blocks the first HTTP write', async () => {
  const h = harness(); await h.controller.prepare(selection);
  const write = h.storage.write;
  jest.mocked(h.storage.write).mockImplementationOnce(async intent => { await write(intent); h.advance(300001); });
  await h.controller.confirm(booker); expect(h.create).not.toHaveBeenCalled(); expect(h.record()).toBeNull();
});
