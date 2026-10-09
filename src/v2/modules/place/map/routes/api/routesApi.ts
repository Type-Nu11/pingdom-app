import { apiClient } from '../../../../../shared/api/apiClient';
import { ApiError } from '../../../../../shared/api/ApiError';
import type { ApiClient } from '../../../../../shared/api/transport';
import type { paths } from '../../../../../shared/api/generated/routes';
import type { Coordinate } from '../../camera/model/map.types';
import { hasRouteDestinationCoordinates } from '../model/routeUi';

type Operation = paths['/routes']['post'];
export type RouteRequest = Operation['requestBody']['content']['application/json'] & { mode: 'car' };
export type RouteResponse = Operation['responses'][200]['content']['*/*'];
export type CarRoute = { path: Coordinate[]; distanceMeters: number; durationSeconds: number };

export function routeRequest(origin: unknown, destination: unknown): RouteRequest {
  if (!hasRouteDestinationCoordinates(origin) || !hasRouteDestinationCoordinates(destination)
    || (origin.latitude === destination.latitude && origin.longitude === destination.longitude)) {
    throw new ApiError('Invalid route coordinates', { code: 'INVALID_ROUTE_REQUEST' });
  }
  return {
    origin: { latitude: origin.latitude, longitude: origin.longitude },
    destination: { latitude: destination.latitude, longitude: destination.longitude }, mode: 'car',
  };
}

export function mapRouteResponse(raw: unknown): CarRoute {
  const value = raw as RouteResponse | null;
  if (value?.mode !== 'car' || value.provider !== 'naver'
    || !Number.isSafeInteger(value.distanceMeters) || value.distanceMeters < 0
    || !Number.isSafeInteger(value.durationSeconds) || value.durationSeconds < 0) {
    throw new ApiError('Invalid route response', { code: 'INVALID_ROUTE_RESPONSE' });
  }
  // path is optional in OpenAPI. A summary without a usable path is not a preview.
  if (!value.path || (Array.isArray(value.path) && value.path.length < 2)) {
    throw new ApiError('Route not found', { code: 'ROUTE_NOT_FOUND' });
  }
  if (!Array.isArray(value.path) || !value.path.every(hasRouteDestinationCoordinates)) {
    throw new ApiError('Invalid route path', { code: 'INVALID_ROUTE_RESPONSE' });
  }
  const path = value.path.map(point => ({ lat: point.latitude, lng: point.longitude }));
  if (!path.some(point => point.lat !== path[0].lat || point.lng !== path[0].lng)) {
    throw new ApiError('Route not found', { code: 'ROUTE_NOT_FOUND' });
  }
  return { path, distanceMeters: value.distanceMeters, durationSeconds: value.durationSeconds };
}

export async function findCarRoute(origin: unknown, destination: unknown, signal: AbortSignal, client: ApiClient = apiClient): Promise<CarRoute> {
  const request = routeRequest(origin, destination);
  return mapRouteResponse(await client.post<RouteResponse, RouteRequest>('/routes', request, { signal, timeout: 15_000 }));
}
