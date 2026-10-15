import { apiClient } from '../../../../../shared/api/apiClient';
import { ApiError } from '../../../../../shared/api/ApiError';
import type { ApiClient } from '../../../../../shared/api/transport';
import type { components } from '../../../../../shared/api/generated/routes';
import type { Coordinate } from '../../camera/model/map.types';
import { hasRouteDestinationCoordinates } from '../model/routeUi';
import { mapRouteResponse, routeRequest, type CarRoute } from './routesApi';

export type WalkingStep = { instruction?: string; distanceMeters?: number; durationSeconds?: number; path: Coordinate[] };
export type WalkingRoute = CarRoute & { steps: WalkingStep[] };
function invalid(): never { throw new ApiError('Invalid walking response', { code: 'INVALID_ROUTE_RESPONSE' }); }

export function mapWalkingRouteResponse(raw: unknown): WalkingRoute {
  const route = mapRouteResponse(raw, 'walk');
  const steps = (raw as components['schemas']['WalkingRouteResponse']).steps;
  if (steps != null && !Array.isArray(steps)) return invalid();
  return { ...route, steps: (steps ?? []).map(step => {
    if (!step || typeof step !== 'object' || Array.isArray(step)) return invalid();
    if (step.instruction != null && typeof step.instruction !== 'string') return invalid();
    for (const value of [step.distanceMeters, step.durationSeconds]) {
      if (value != null && (!Number.isSafeInteger(value) || value < 0)) return invalid();
    }
    if (step.path != null && (!Array.isArray(step.path) || !step.path.every(hasRouteDestinationCoordinates))) return invalid();
    return { instruction: step.instruction?.trim() || undefined,
      distanceMeters: step.distanceMeters ?? undefined, durationSeconds: step.durationSeconds ?? undefined,
      path: (step.path ?? []).map(point => ({ lat: point.latitude, lng: point.longitude })) };
  }) };
}

export async function findWalkingRoute(origin: unknown, destination: unknown, signal: AbortSignal, client: ApiClient = apiClient): Promise<WalkingRoute> {
  const request = routeRequest(origin, destination, 'walk');
  return mapWalkingRouteResponse(await client.post<components['schemas']['WalkingRouteResponse'], typeof request>('/routes', request, { signal, timeout: 15_000 }));
}
