import { toApiError } from '../../../../../shared/api/ApiError';
import type { CarRoute } from '../api/routesApi';
export type RouteFailure = 'authentication' | 'forbidden' | 'rate-limited' | 'unavailable' | 'timeout'
  | 'no-route' | 'unsupported' | 'invalid-coordinate' | 'network' | 'error' | 'canceled';
export type RouteState = { kind: 'idle' | 'loading' } | { kind: 'ready'; route: CarRoute } | { kind: RouteFailure };
export function routeFailure(error: unknown): RouteFailure {
  const failure = toApiError(error);
  if (failure.code === 'ERR_CANCELED') return 'canceled';
  if (failure.status === 401) return 'authentication';
  if (failure.status === 403) return 'forbidden';
  if (failure.status === 429) return 'rate-limited';
  if (failure.status === 503) return 'unavailable';
  if (failure.status === 504 || ['ECONNABORTED', 'ETIMEDOUT', 'REQUEST_TIMEOUT', 'ROUTE_PROVIDER_TIMEOUT'].includes(failure.code ?? '')) return 'timeout';
  if (failure.code === 'ROUTE_NOT_FOUND') return 'no-route';
  if (failure.code === 'UNSUPPORTED_ROUTE_MODE') return 'unsupported';
  if (failure.code === 'INVALID_ROUTE_REQUEST' || failure.status === 400) return 'invalid-coordinate';
  if (failure.code === 'INVALID_ROUTE_RESPONSE' || failure.code === 'ROUTE_PROVIDER_UNAVAILABLE') return 'unavailable';
  if (failure.isNetworkError) return 'network';
  return 'error';
}

/** In-memory, latest-request-wins session. No cache, persistence or automatic retry. */
export function createRouteSession(publish: (state: RouteState) => void) {
  let generation = 0;
  let retryAt = 0;
  let controller: AbortController | undefined;
  function invalidate() { generation += 1; controller?.abort(); controller = undefined; }
  return {
    cancel() { invalidate(); publish({ kind: 'canceled' }); },
    dispose: invalidate,
    async request(load: (signal: AbortSignal) => Promise<CarRoute>) {
      if (Date.now() < retryAt) { publish({ kind: 'rate-limited' }); return; }
      invalidate();
      const current = generation;
      controller = new AbortController();
      const signal = controller.signal;
      publish({ kind: 'loading' });
      try {
        const route = await load(signal);
        if (!signal.aborted && current === generation) publish({ kind: 'ready', route });
      } catch (error) {
        if (!signal.aborted && current === generation) {
          const failure = toApiError(error);
          if (failure.status === 429) retryAt = Date.now() + (failure.retryAfterSeconds ?? 60) * 1000;
          publish({ kind: routeFailure(failure) });
        }
      } finally {
        if (current === generation) controller = undefined;
      }
    },
  };
}
