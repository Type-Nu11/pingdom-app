import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlaceAvailabilitiesQueryOptions } from '../reservations/hooks/usePlaceAvailabilities.ts';
import { selectReservationCta } from '../reservations/model/placeAvailabilityPresentation.ts';

const ready = (data) => ({ data, error: null, isError: false, isPending: false });
const pending = { data: undefined, error: null, isError: false, isPending: true };
const failed = (status = 500) => ({ data: undefined, error: { status }, isError: true, isPending: false });

test('availability Query key contains place id and forwards TanStack AbortSignal', async () => {
  const signal = new AbortController().signal;
  let received;
  const options = createPlaceAvailabilitiesQueryOptions(70069, {
    getPlaceAvailabilities: async (placeId, querySignal) => {
      received = { placeId, querySignal };
      return [];
    },
  });
  assert.deepEqual(options.queryKey, ['v2', 'places', 'entity', 70069, 'availabilities']);
  assert.deepEqual(await options.queryFn({ signal }), []);
  assert.deepEqual(received, { placeId: 70069, querySignal: signal });
});

test('availability requires ACTIVE, future end, and remaining capacity', () => {
  const now = new Date('2026-08-31T00:00:00Z');
  const active = (remainingCapacity) => ({
    placeId: 70069,
    status: 'ACTIVE',
    endsAt: '2026-09-01T00:00:00Z',
    remainingCapacity,
  });
  assert.deepEqual(selectReservationCta(ready([active(1)]), now), {
    kind: 'available', disabled: false,
  });
  assert.deepEqual(selectReservationCta(ready([active(0)]), now), {
    kind: 'full', disabled: false,
  });
  assert.deepEqual(selectReservationCta(ready([
    { ...active(2), status: 'INACTIVE' },
    { ...active(2), endsAt: '2026-08-30T00:00:00Z' },
  ]), now), {
    kind: 'empty', disabled: false,
  });
  assert.equal(selectReservationCta(pending, now).kind, 'loading');
  assert.equal(selectReservationCta(failed(401), now).kind, 'auth-error');
  assert.equal(selectReservationCta(failed(), now).kind, 'error');
});
