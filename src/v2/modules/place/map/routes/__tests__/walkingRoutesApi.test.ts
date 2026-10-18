import { createApiClient } from '../../../../../shared/api/apiClient';
import { findWalkingRoute, mapWalkingRouteResponse } from '../api/walkingRoutesApi';

const origin = { latitude: 37.5, longitude: 127 };
const destination = { latitude: 37.6, longitude: 127.1 };
const response = { mode: 'walk', provider: 'tmap', distanceMeters: 800, durationSeconds: 600,
  path: [origin, { latitude: 37.55, longitude: 127.08 }, destination],
  steps: [{ instruction: '횡단보도를 건너세요', distanceMeters: 30, durationSeconds: 25, path: [origin] }] };

test('walking preserves provider geometry and ordered instructions and sends walk to Pingdom', async () => {
  const post = jest.fn(async () => ({ data: response }));
  const signal = new AbortController().signal;
  const route = await findWalkingRoute(origin, destination, signal, createApiClient({ post } as never));
  expect(post).toHaveBeenCalledWith('/routes', { origin, destination, mode: 'walk' }, expect.objectContaining({ signal, timeout: 15_000 }));
  expect(route).toEqual({ distanceMeters: 800, durationSeconds: 600,
    path: [{ lat: 37.5, lng: 127 }, { lat: 37.55, lng: 127.08 }, { lat: 37.6, lng: 127.1 }],
    steps: [{ instruction: '횡단보도를 건너세요', distanceMeters: 30, durationSeconds: 25, path: [{ lat: 37.5, lng: 127 }] }] });
});

test('optional walking instructions stay absent rather than invented', () => {
  expect(mapWalkingRouteResponse({ ...response, steps: undefined }).steps).toEqual([]);
  expect(mapWalkingRouteResponse({ ...response, steps: [{}] }).steps).toEqual([{ path: [] }]);
});

test.each([{ mode: 'car' }, { provider: 'naver' }, { distanceMeters: -1 }, { durationSeconds: 1.5 },
  { path: [origin, origin] }, { path: [origin, { latitude: NaN, longitude: 127 }] },
  { steps: {} }, { steps: [null] }, { steps: [{ instruction: 12 }] },
  { steps: [{ distanceMeters: -1 }] }, { steps: [{ path: [{ latitude: 91, longitude: 0 }] }] }])('malformed walking data cannot become a preview: %p', change => {
  expect(() => mapWalkingRouteResponse({ ...response, ...change })).toThrow();
});
