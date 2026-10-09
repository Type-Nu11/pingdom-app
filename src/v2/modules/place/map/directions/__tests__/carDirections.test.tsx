import { act, renderHook } from '@testing-library/react-native';
import { ApiError } from '../../../../../shared/api/ApiError';
import { toApiError } from '../../../../../shared/api/ApiError';
import { findCarRoute, routeErrorKey, type CarRoute } from '../routeApi';
import { useCarDirections } from '../useCarDirections';

const target = { placeId: 1, name: 'Place', latitude: 37.5, longitude: 127, userLocation: { latitude: 37.6, longitude: 126.9 } };
const route: CarRoute = { mode: 'car', provider: 'naver', distanceMeters: 1234, durationSeconds: 61, path: [{ latitude: 37.6, longitude: 126.9 }, { latitude: 37.55, longitude: 126.95 }, { latitude: 37.5, longitude: 127 }] };
function deferred() {
  let resolve!: (route: CarRoute) => void;
  const promise = new Promise<CarRoute>(done => { resolve = done; });
  return { promise, resolve };
}

test('sends the authenticated transport contract without place IDs or provider credentials and preserves the full path', async () => {
  const post = jest.fn().mockResolvedValue(route);
  const controller = new AbortController();
  const body = { origin: target.userLocation, destination: { latitude: target.latitude, longitude: target.longitude }, mode: 'car' as const };
  expect(await findCarRoute(body, controller.signal, { post } as never)).toBe(route);
  expect(post).toHaveBeenCalledWith('/routes', body, { signal: controller.signal, timeout: 15_000 });
});

test.each([null, { ...route, path: [] }, { ...route, path: [route.path[0]] }, { ...route, path: [{ latitude: '37', longitude: 127 }, route.path[1]] }, { ...route, durationSeconds: -1 }, { ...route, distanceMeters: NaN }, { ...route, mode: 'walk' }])('rejects malformed routes instead of drawing a substitute', async response => {
  await expect(findCarRoute({ origin: target.userLocation, destination: target, mode: 'car' }, undefined, { post: jest.fn().mockResolvedValue(response) } as never)).rejects.toMatchObject({ code: 'ROUTE_PROVIDER_UNAVAILABLE' });
});

test('validates missing, out-of-range, and identical coordinates before making a request', async () => {
  const post = jest.fn();
  for (const origin of [target, { latitude: 100, longitude: 127 }, { latitude: NaN, longitude: 127 }, null]) {
    await expect(findCarRoute({ origin, destination: target, mode: 'car' } as never, undefined, { post } as never)).rejects.toMatchObject({ code: 'INVALID_ROUTE_REQUEST' });
  }
  expect(post).not.toHaveBeenCalled();
});

test.each([['ROUTE_NOT_FOUND', 'notFound'], ['ROUTE_RATE_LIMITED', 'rateLimited'], ['UNSUPPORTED_ROUTE_MODE', 'unsupported'], ['ROUTE_PROVIDER_UNAVAILABLE', 'unavailable'], ['ROUTE_PROVIDER_TIMEOUT', 'timeout'], ['INVALID_ROUTE_REQUEST', 'invalid'], ['ERR_NETWORK', 'failed']])('maps %s to recoverable user feedback', (code, key) => {
  expect(routeErrorKey(new ApiError('failure', { code }))).toBe(key);
});

test('retains Retry-After from the transport', () => {
  const error = toApiError({ isAxiosError: true, message: 'limited', response: { status: 429, headers: { 'retry-after': '75' }, data: { code: 'ROUTE_RATE_LIMITED' } } });
  expect(error.retryAfterSeconds).toBe(75);
});

test('deduplicates taps and cancels selection changes, ignoring late results even if transport ignores abort', async () => {
  const old = deferred();
  const request = jest.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(route);
  const hook = await renderHook(({ place, active }: { place: typeof target; active: boolean }) => useCarDirections(place, active, request), { initialProps: { place: target, active: true } });
  let pending!: Promise<void>;
  await act(async () => { pending = hook.result.current.load(); void hook.result.current.load(); });
  expect(request).toHaveBeenCalledTimes(1);
  expect(hook.result.current.state.status).toBe('loading');
  const signal = request.mock.calls[0][1] as AbortSignal;
  await hook.rerender({ place: { ...target, placeId: 2 }, active: true });
  expect(signal.aborted).toBe(true);
  await act(async () => { old.resolve(route); await pending; });
  expect(hook.result.current.state.status).toBe('idle');
  await act(async () => hook.result.current.load());
  expect(hook.result.current.state.route).toEqual(route);
  await hook.rerender({ place: { ...target, placeId: 2 }, active: false });
  expect(hook.result.current.state.status).toBe('idle');
});

test('does not refetch on GPS updates and cancels on dismissal or unmount', async () => {
  const request = jest.fn().mockResolvedValueOnce(route);
  const hook = await renderHook(({ place }: { place: typeof target }) => useCarDirections(place, true, request), { initialProps: { place: target } });
  await act(async () => hook.result.current.load());
  await hook.rerender({ place: { ...target, userLocation: { latitude: 37.61, longitude: 126.9 } } });
  expect(request).toHaveBeenCalledTimes(1);
  expect(hook.result.current.state.status).toBe('success');
  const pending = deferred();
  request.mockReturnValueOnce(pending.promise);
  let load!: Promise<void>;
  await act(async () => { load = hook.result.current.load(); });
  await act(async () => hook.result.current.clear());
  expect(request.mock.calls[1][1].aborted).toBe(true);
  await act(async () => { pending.resolve(route); await load; });
  expect(hook.result.current.state.status).toBe('idle');
  request.mockReturnValueOnce(deferred().promise);
  await act(async () => { void hook.result.current.load(); });
  await hook.unmount();
  expect(request.mock.calls[2][1].aborted).toBe(true);
});

test('location failures and rate limits do not call the route provider repeatedly', async () => {
  const request = jest.fn().mockRejectedValue(new ApiError('limited', { code: 'ROUTE_RATE_LIMITED', status: 429, retryAfterSeconds: 75 }));
  const hook = await renderHook(() => useCarDirections(target, true, request));
  await act(async () => hook.result.current.load());
  await act(async () => hook.result.current.load());
  expect(request).toHaveBeenCalledTimes(1);
  expect(hook.result.current.state.errorKey).toBe('rateLimited');
  const invalid = await renderHook(() => useCarDirections({ ...target, userLocation: null }, true, request));
  await act(async () => invalid.result.current.load());
  expect(invalid.result.current.state.errorKey).toBe('originMissing');
  expect(request).toHaveBeenCalledTimes(1);
});
