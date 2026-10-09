import { apiClient, type ApiClient } from '../../../../shared/api/apiClient';
import { ApiError } from '../../../../shared/api/ApiError';
import type { components } from '../../../../shared/api/generated/routes';

export type RouteCoordinate = components['schemas']['RouteCoordinate'];
export type CarRoute = Omit<components['schemas']['RouteResponse'], 'path'> & { path: RouteCoordinate[] };
export type RouteRequest = Omit<components['schemas']['RouteRequest'], 'mode'> & { mode: 'car' };

export function isRouteCoordinate(value: unknown): value is RouteCoordinate {
  if (!value || typeof value !== 'object') return false;
  const point = value as RouteCoordinate;
  return Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

export async function findCarRoute(request: RouteRequest, signal?: AbortSignal, client: ApiClient = apiClient): Promise<CarRoute> {
  if (!isRouteCoordinate(request.origin) || !isRouteCoordinate(request.destination)
    || (request.origin.latitude === request.destination.latitude && request.origin.longitude === request.destination.longitude)) {
    throw new ApiError('Invalid route coordinates', { code: 'INVALID_ROUTE_REQUEST' });
  }
  const result = await client.post<CarRoute, RouteRequest>('/routes', request, { signal, timeout: 15_000 });
  if (!result || result.mode !== 'car' || result.provider !== 'naver'
    || !Number.isSafeInteger(result.distanceMeters) || result.distanceMeters < 0
    || !Number.isSafeInteger(result.durationSeconds) || result.durationSeconds < 0
    || !Array.isArray(result.path) || result.path.length < 2 || !result.path.every(isRouteCoordinate)) {
    throw new ApiError('Invalid route response', { code: 'ROUTE_PROVIDER_UNAVAILABLE' });
  }
  return result;
}

export function routeErrorKey(error: unknown): string {
  if (!(error instanceof ApiError)) return 'failed';
  if (error.status === 401 || error.status === 403) return 'unauthorized';
  if (error.status === 429) return 'rateLimited';
  if (error.status === 504) return 'timeout';
  if (error.status === 503) return 'unavailable';
  switch (error.code) {
    case 'INVALID_ROUTE_REQUEST': return 'invalid';
    case 'ROUTE_NOT_FOUND': return 'notFound';
    case 'UNSUPPORTED_ROUTE_MODE': return 'unsupported';
    case 'ROUTE_RATE_LIMITED': return 'rateLimited';
    case 'ROUTE_PROVIDER_TIMEOUT': case 'ECONNABORTED': case 'ETIMEDOUT': return 'timeout';
    case 'ROUTE_PROVIDER_UNAVAILABLE': case 'RATE_LIMIT_UNAVAILABLE': return 'unavailable';
    default: return 'failed';
  }
}

export function routeRetryDelay(error: unknown): number | undefined {
  return error instanceof ApiError && error.status === 429 ? (error.retryAfterSeconds ?? 60) * 1000 : undefined;
}
