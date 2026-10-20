import { configureApiAccessTokenProvider, createApiClient } from '../../../../../shared/api/apiClient';
import { ApiError } from '../../../../../shared/api/ApiError';
import { findCarRoute, mapRouteResponse, routeRequest } from '../api/routesApi';
import { createRouteSession, routeFailure } from '../model/routeState';
import { fitRouteCamera, fitRoutePreviewCamera } from '../model/routePreparation';
const origin = { latitude: 37.5, longitude: 127 };
const destination = { latitude: 37.6, longitude: 127.1 };
const response = { mode: 'car', provider: 'naver', distanceMeters: 1200, durationSeconds: 181,
  path: [{ latitude: 37.501, longitude: 127.001 }, { latitude: 37.8, longitude: 127.3 }, { latitude: 37.601, longitude: 127.101 }] };
const deferred = <T,>() => { let resolve!: (value: T) => void; let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('contract maps all path points in original order without replacing road endpoints', async () => {
  expect(routeRequest(origin, destination)).toEqual({ origin, destination, mode: 'car' });
  expect(mapRouteResponse(response)).toEqual({ distanceMeters: 1200, durationSeconds: 181,
    path: response.path.map(p => ({ lat: p.latitude, lng: p.longitude })) });
  const post = jest.fn(async () => ({ data: response }));
  const token = configureApiAccessTokenProvider(() => 'test-only-token');
  const signal = new AbortController().signal;
  try {
    await findCarRoute(origin, destination, signal, createApiClient({ post } as never));
    expect(post).toHaveBeenCalledWith('/routes', { origin, destination, mode: 'car' }, expect.objectContaining({ signal, timeout: 15_000, headers: expect.objectContaining({ Authorization: 'Bearer test-only-token', 'X-Client-Type': 'App' }) }));
    expect(post).toHaveBeenCalledTimes(1);
  } finally { token(); }
});

test.each([null, {}, { latitude: '37.5', longitude: 127 }, { latitude: NaN, longitude: 127 },
  { latitude: 91, longitude: 127 }, { latitude: 37, longitude: Infinity }, { latitude: 37, longitude: 181 }, origin])('rejects invalid or identical coordinates %p', invalid => {
  expect(() => routeRequest(origin, invalid)).toThrow();
});

test('boundary WGS84 coordinates and only minimal fields are accepted', () => {
  expect(routeRequest({ latitude: -90, longitude: -180, name: 'not sent' }, { latitude: 90, longitude: 180 }))
    .toEqual({ origin: { latitude: -90, longitude: -180 }, destination: { latitude: 90, longitude: 180 }, mode: 'car' });
});

test.each([undefined, [], [origin], [origin, origin]])('missing/degenerate path cannot become a straight route', path => {
  expect(() => mapRouteResponse({ ...response, path })).toThrow('Route not found');
});
test.each([{ ...response, durationSeconds: -1 }, { ...response, distanceMeters: NaN }, { ...response, mode: 'walk' },
  { ...response, path: [origin, { latitude: null, longitude: 127 }] }, { ...response, path: {} },
  { ...response, provider: 'unknown' }, { ...response, durationSeconds: 1.1 }])('rejects malformed successful responses', value => {
  expect(() => mapRouteResponse(value)).toThrow();
});
test.each([[401, 'authentication'], [403, 'forbidden'], [429, 'rate-limited'], [503, 'unavailable'], [504, 'timeout'], [400, 'invalid-coordinate']])('HTTP %s maps to %s', (status, expected) => {
  expect(routeFailure(new ApiError('private server message', { status: status as number }))).toBe(expected);
});
test.each([['ROUTE_NOT_FOUND', 'no-route'], ['UNSUPPORTED_ROUTE_MODE', 'unsupported'], ['ERR_CANCELED', 'canceled'],
  ['ECONNABORTED', 'timeout'], ['INVALID_ROUTE_RESPONSE', 'unavailable']])('code %s maps to %s', (code, expected) => {
  expect(routeFailure(new ApiError('ignored', { code }))).toBe(expected);
});
test('network errors are recoverable and unknown responses remain failures', () => {
  expect(routeFailure(new ApiError('network', { isNetworkError: true }))).toBe('network');
  expect(routeFailure(new Error('unexpected'))).toBe('error');
});

test('new request aborts the previous request and drops a late success', async () => {
  const publish = jest.fn(); const session = createRouteSession(publish);
  const first = deferred<ReturnType<typeof mapRouteResponse>>(); let firstSignal!: AbortSignal;
  const pending = session.request(signal => { firstSignal = signal; return first.promise; });
  const second = { ...mapRouteResponse(response), distanceMeters: 2200 };
  await session.request(async () => second);
  expect(firstSignal.aborted).toBe(true);
  first.resolve(mapRouteResponse(response)); await pending;
  expect(publish.mock.calls.map(([s]) => s.kind)).toEqual(['loading', 'loading', 'ready']);
  expect(publish).toHaveBeenLastCalledWith({ kind: 'ready', route: second });
});
test('cancel and selection disposal discard late errors and successes without retry', async () => {
  for (const dispose of [false, true]) {
    const publish = jest.fn(); const session = createRouteSession(publish); const pending = deferred<never>();
    let signal!: AbortSignal;
    const request = session.request(value => { signal = value; return pending.promise; });
    if (dispose) session.dispose(); else session.cancel();
    pending.reject(new ApiError('late', { status: 503 })); await request;
    expect(signal.aborted).toBe(true);
    expect(publish.mock.calls.map(([s]) => s.kind)).toEqual(dispose ? ['loading'] : ['loading', 'canceled']);
  }
});
test.each([2, undefined])('rate limiting honors Retry-After or the default cooldown (%s)', async retryAfterSeconds => {
  let now = 1_000_000;
  const clock = jest.spyOn(Date, 'now').mockImplementation(() => now);
  const publish = jest.fn();
  const session = createRouteSession(publish);
  const load = jest.fn().mockRejectedValueOnce(new ApiError('limited', { status: 429, retryAfterSeconds }))
    .mockResolvedValue(mapRouteResponse(response));
  try {
    await session.request(load);
    await session.request(load);
    expect(load).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenLastCalledWith({ kind: 'rate-limited' });
    now += (retryAfterSeconds ?? 60) * 1000;
    await session.request(load);
    expect(load).toHaveBeenCalledTimes(2);
    expect(publish).toHaveBeenLastCalledWith({ kind: 'ready', route: mapRouteResponse(response) });
  } finally { session.dispose(); clock.mockRestore(); }
});

test('camera covers intermediate excursions and large paths without spread argument limits', () => {
  const points = mapRouteResponse(response).path;
  const camera = fitRouteCamera(points, 390, 400);
  expect(camera.center.lat).toBeGreaterThan(37.6);
  expect(camera.center.lng).toBeCloseTo(127.1505);
  expect(camera.zoom).toBeLessThan(14);
  expect(fitRouteCamera(Array.from({ length: 150000 }, (_, i) => points[i % 3]), 390, 400)).toEqual(camera);
});


test('floating sheet fit keeps every real route vertex in the unobscured map viewport', () => {
  const points = [{ lat: 37.5, lng: 127 }, { lat: 37.8, lng: 127.3 }, { lat: 37.6, lng: 127.1 }];
  const camera = fitRoutePreviewCamera(points, 402, 874, 415, 62);
  const projectY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const scale = 256 * 2 ** camera.zoom / (2 * Math.PI);
  for (const point of points) {
    const y = 874 / 2 - (projectY(point.lat) - projectY(camera.center.lat)) * scale;
    const x = 402 / 2 + (point.lng - camera.center.lng) / 360 * 256 * 2 ** camera.zoom;
    expect(y).toBeGreaterThan(62);
    expect(y).toBeLessThan(874 - 415);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(402);
  }
});
