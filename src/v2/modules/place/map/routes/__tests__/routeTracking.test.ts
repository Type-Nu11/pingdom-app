import { destinationDistance, freshTrackingCoordinate, isTrackingArrival } from '../model/routeTracking';
import type { LocationState } from '../../camera/model/map.types';

const now = Date.parse('2026-10-10T12:00:00Z');
const destination = { lat: 37.6, lng: 127.1 };
const point = { ...destination, accuracyMeters: 10, observedAt: new Date(now).toISOString() };
const location: LocationState = { status: 'granted', canAskAgain: true, coordinate: point };

test('distance reflects real separation without claiming road distance', () => {
  expect(destinationDistance(destination, destination)).toBe(0);
  expect(destinationDistance(destination, { ...destination, lat: 37.601 })).toBeCloseTo(111.195, 2);
});

test('arrival includes uncertainty inside the 30 metre radius', () => {
  expect(isTrackingArrival(point, destination)).toBe(true);
  expect(isTrackingArrival({ ...point, lat: 37.6002 }, destination)).toBe(false);
  expect(isTrackingArrival({ ...point, lat: 37.6001 }, destination)).toBe(true);
});

test.each([undefined, -1, NaN, Infinity, 31])('unusable accuracy %s cannot report arrival', accuracyMeters => {
  expect(isTrackingArrival({ ...point, accuracyMeters }, destination)).toBe(false);
});

test('old, missing, future and invalid location fixes cannot drive tracking', () => {
  expect(freshTrackingCoordinate(location, now)).toEqual(point);
  expect(freshTrackingCoordinate(location, now + 15_001)).toBeNull();
  expect(freshTrackingCoordinate(location, now - 5_001)).toBeNull();
  expect(freshTrackingCoordinate({ ...location, coordinate: { ...point, observedAt: undefined } }, now)).toBeNull();
  expect(freshTrackingCoordinate({ ...location, coordinate: { ...point, lat: NaN } }, now)).toBeNull();
  expect(freshTrackingCoordinate({ status: 'denied', coordinate: null, canAskAgain: false }, now)).toBeNull();
});
