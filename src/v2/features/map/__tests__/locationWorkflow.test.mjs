import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestPlaceMarkers, FALLBACK_COORDINATE } from '../model/mapFixtures.ts';
import { resolveCurrentLocation } from '../services/locationWorkflow.ts';

test('granted permission resolves the current coordinate without requesting again', async () => {
  let requestCount = 0;
  const outcome = await resolveCurrentLocation({
    getCoordinate: async () => ({ lat: 37.55, lng: 126.98 }),
    getPermission: async () => ({ status: 'granted', canAskAgain: true }),
    requestPermission: async () => {
      requestCount += 1;
      return { status: 'granted', canAskAgain: true };
    },
  });

  assert.deepEqual(outcome, {
    status: 'granted',
    coordinate: { lat: 37.55, lng: 126.98 },
    canAskAgain: true,
  });
  assert.equal(requestCount, 0);
});

test('an undetermined permission can be granted by the permission prompt', async () => {
  let coordinateLookupCount = 0;
  const outcome = await resolveCurrentLocation({
    getCoordinate: async () => {
      coordinateLookupCount += 1;
      return { lat: 37.55, lng: 126.98 };
    },
    getPermission: async () => ({ status: 'undetermined', canAskAgain: true }),
    requestPermission: async () => ({ status: 'granted', canAskAgain: true }),
  });

  assert.equal(outcome.status, 'granted');
  assert.equal(coordinateLookupCount, 1);
});

test('denied permission is distinct from a location lookup failure', async () => {
  const denied = await resolveCurrentLocation({
    getCoordinate: async () => ({ lat: 37.55, lng: 126.98 }),
    getPermission: async () => ({ status: 'denied', canAskAgain: false }),
    requestPermission: async () => ({ status: 'denied', canAskAgain: false }),
  });
  const failed = await resolveCurrentLocation({
    getCoordinate: async () => { throw new Error('GPS unavailable'); },
    getPermission: async () => ({ status: 'granted', canAskAgain: true }),
    requestPermission: async () => ({ status: 'granted', canAskAgain: true }),
  });

  assert.deepEqual(denied, { status: 'denied', coordinate: null, canAskAgain: false });
  assert.deepEqual(failed, { status: 'failed', coordinate: null, canAskAgain: true });
});

test('test markers remain visible around the fallback coordinate', () => {
  const markers = createTestPlaceMarkers(FALLBACK_COORDINATE);

  assert.equal(markers.length, 2);
  assert.ok(markers.every((marker) => marker.lat !== FALLBACK_COORDINATE.lat));
  assert.ok(markers.every((marker) => marker.lng !== FALLBACK_COORDINATE.lng));
});
