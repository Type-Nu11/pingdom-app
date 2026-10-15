import { createApiClient } from '../../../../../shared/api/apiClient';
import { findTransitRoute, mapTransitRouteResponse } from '../api/transitRoutesApi';
import { transitResponse } from './transitFixture';

test('requests only the published Pingdom transit contract and preserves separate leg geometry', async () => {
  const post = jest.fn(async () => ({ data: transitResponse }));
  const signal = new AbortController().signal;
  const result = await findTransitRoute({ latitude: 37.5, longitude: 127, name: 'private' },
    { latitude: 37.6, longitude: 127.1 }, signal, createApiClient({ post } as never));
  expect(post).toHaveBeenCalledWith('/routes', {
    origin: { latitude: 37.5, longitude: 127 }, destination: { latitude: 37.6, longitude: 127.1 }, mode: 'transit',
  }, expect.objectContaining({ signal, timeout: 15_000 }));
  expect(result.itineraries).toHaveLength(2);
  expect(result.itineraries[0].legs[1]).toMatchObject({ mode: 'SUBWAY', routeColor: '#00A84D', routeName: 'Line 2',
    path: [{ lat: 37.502, lng: 127.002 }, { lat: 37.6, lng: 127.1 }] });
  expect(result.itineraries[0].durationSeconds).toBe(1200);
  expect(result.itineraries[1].distanceMeters).toBe(5000);
});

test.each([null, {}, { ...transitResponse, mode: 'car' }, { ...transitResponse, provider: 'naver' },
  { ...transitResponse, itineraries: {} }, { ...transitResponse, itineraries: [null] },
  { ...transitResponse, itineraries: [{ totalTimeSeconds: -1 }] }])('rejects invalid transit responses %p', response => {
  expect(() => mapTransitRouteResponse(response)).toThrow('Invalid transit response');
});

test('distinguishes no itineraries from malformed provider data', () => {
  expect(() => mapTransitRouteResponse({ ...transitResponse, itineraries: [] })).toThrow('Route not found');
});

test('does not synthesize missing paths, stops, fare, or unknown mode information', () => {
  const result = mapTransitRouteResponse({ mode: 'transit', provider: 'tmap', itineraries: [
    { totalTimeSeconds: 60, totalDistanceMeters: 100, legs: [{ mode: 'NEW_MODE', path: [] }] },
  ] });
  expect(result.itineraries[0].legs[0]).toMatchObject({ mode: 'UNKNOWN', path: [] });
  expect(result.itineraries[0].totalFare).toBeUndefined();
  expect(result.itineraries[0].legs[0].start).toBeUndefined();
});

test.each([[{ latitude: 91, longitude: 127 }, { latitude: 37, longitude: 127 }], 'bad', null])('never joins across invalid path vertices %p', path => {
  const leg = { ...transitResponse.itineraries[0].legs[0], path };
  expect(() => mapTransitRouteResponse({ ...transitResponse, itineraries: [{ ...transitResponse.itineraries[0], legs: [leg] }] })).toThrow();
});

test('normalizes unsafe route colors without injecting style values', () => {
  const leg = { ...transitResponse.itineraries[0].legs[0], routeColor: 'url(secret)' };
  const result = mapTransitRouteResponse({ ...transitResponse, itineraries: [{ ...transitResponse.itineraries[0], legs: [leg] }] });
  expect(result.itineraries[0].legs[0].routeColor).toBeUndefined();
});

test.each([-1, 1.5, '12', Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects unusable transit totals (%p)', totalTimeSeconds => {
  expect(() => mapTransitRouteResponse({ ...transitResponse, itineraries: [{ ...transitResponse.itineraries[0], totalTimeSeconds }] })).toThrow();
});
