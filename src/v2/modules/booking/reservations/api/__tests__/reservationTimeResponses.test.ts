import type { ApiClient } from '../../../../../shared/api';
import { createReservationApi } from '../reservationApi';
import { createPlaceAvailabilityApi } from '../placeAvailabilityApi';

const slot = {
  id: 10, placeId: 1, productType: 'GENERAL' as const, productId: null, productName: null,
  startsAt: '2026-09-20T05:00:00', endsAt: '2026-09-20T06:00:00',
  totalCapacity: 3, remainingCapacity: 3, status: 'ACTIVE' as const,
};
const clientFor = (value: unknown) => ({ get: jest.fn().mockResolvedValue(value) }) as unknown as ApiClient;

test('both availability APIs interpret deployed offsetless UTC as 14:00 KST and keep strict AI validation', async () => {
  for (const load of [
    () => createReservationApi(clientFor([slot])).listAvailabilities(1),
    () => createPlaceAvailabilityApi(clientFor([slot])).getPlaceAvailabilities(1),
  ]) {
    const [result] = await load();
    expect(result.startsAt).toBe('2026-09-20T05:00:00Z');
    expect(result.endsAt).toBe('2026-09-20T06:00:00Z');
    expect(Date.parse(result.startsAt)).toBe(Date.parse('2026-09-20T14:00:00+09:00'));
    expect(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(result.startsAt))).toBe('14:00');
  }
  expect(slot.startsAt).toBe('2026-09-20T05:00:00');
});

test('normalizes quote UTC dates consistently with availability without changing conditions or tokens', async () => {
  const raw = { confirmationToken: 'unchanged', confirmation: {
    startsAt: slot.startsAt, endsAt: slot.endsAt, totalAmountMinor: 0,
    cancellationDeadline: '2026-09-20T04:00:00', expiresAt: '2026-09-20T00:05:00' } };
  const [availability] = await createReservationApi(clientFor([slot])).listAvailabilities(1);
  const quote = await createReservationApi(clientFor(raw)).getReservationQuote(1, 10, 2);
  expect(quote.confirmation!.startsAt).toBe(availability.startsAt);
  expect(quote.confirmation!.endsAt).toBe(availability.endsAt);
  expect(quote.confirmation!.cancellationDeadline).toBe('2026-09-20T04:00:00Z');
  expect(quote.confirmation!.expiresAt).toBe('2026-09-20T00:05:00Z');
  expect(quote.confirmation!.totalAmountMinor).toBe(raw.confirmation!.totalAmountMinor);
  expect(quote.confirmationToken).toBe(raw.confirmationToken);
  expect(raw.confirmation!.startsAt).toBe(slot.startsAt);
});

test.each(['2026-09-20T05:00:00Z', '2026-09-20T14:00:00+09:00', '2026-09-20T05:00:00.123Z'])('keeps explicit instants unchanged: %s', async startsAt => {
  const [result] = await createReservationApi(clientFor([{ ...slot, startsAt }])).listAvailabilities(1);
  expect(result.startsAt).toBe(startsAt);
});

test.each(['2026-02-30T05:00:00', '2026-09-20T25:00:00', '2026-09-20', '', null])('does not make malformed dates valid: %s', async startsAt => {
  const [result] = await createReservationApi(clientFor([{ ...slot, startsAt }])).listAvailabilities(1);
  expect(result.startsAt).toBe(startsAt);
});

test('retains absent quote conditions for strict draft validation', async () => {
  const raw = { confirmation: null };
  const result = await createReservationApi(clientFor(raw)).getReservationQuote(1, 10, 2);
  expect(result.confirmation).toBeNull();
});
