import { apiClient } from '../../../../../shared/api/apiClient';
import { ApiError } from '../../../../../shared/api/ApiError';
import type { ApiClient } from '../../../../../shared/api/transport';
import type { components } from '../../../../../shared/api/generated/routes';
import type { Coordinate } from '../../camera/model/map.types';
import { hasRouteDestinationCoordinates } from '../model/routeUi';
import { routeRequest } from './routesApi';

type WireStop = components['schemas']['Stop'];
export type TransitStop = Pick<WireStop, 'name' | 'stationId'> & { coordinate?: Coordinate };
export type TransitLeg = Pick<components['schemas']['Leg'], 'distanceMeters' | 'durationSeconds' | 'routeName' | 'routeId' | 'routeColor' | 'routeType'> & {
  mode: 'WALK' | 'BUS' | 'SUBWAY' | 'EXPRESSBUS' | 'TRAIN' | 'AIRPLANE' | 'FERRY' | 'UNKNOWN';
  path: Coordinate[]; start?: TransitStop; end?: TransitStop; stations: TransitStop[];
};
export type TransitItinerary = Pick<components['schemas']['Itinerary'], 'transferCount' | 'totalWalkDistanceMeters' | 'totalWalkTimeSeconds' | 'totalFare'> & {
  distanceMeters: number; durationSeconds: number; legs: TransitLeg[];
};
export type TransitRoute = { itineraries: TransitItinerary[] };

function invalid(): never { throw new ApiError('Invalid transit response', { code: 'INVALID_ROUTE_RESPONSE' }); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function amount(value: unknown, required = false): number | undefined {
  if (value == null && !required) return undefined;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) return invalid();
  return value;
}
function text(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') return invalid();
  return value.trim() || undefined;
}
function stop(value: unknown): TransitStop | undefined {
  if (value == null) return undefined;
  const raw = object(value);
  return { name: text(raw.name), stationId: text(raw.stationId),
    coordinate: hasRouteDestinationCoordinates(raw) ? { lat: raw.latitude, lng: raw.longitude } : undefined };
}
function leg(value: unknown): TransitLeg {
  const raw = object(value);
  const wireMode = text(raw.mode)?.replace(/ /g, '');
  const mode = ['WALK', 'BUS', 'SUBWAY', 'EXPRESSBUS', 'TRAIN', 'AIRPLANE', 'FERRY'].includes(wireMode ?? '')
    ? wireMode as TransitLeg['mode'] : 'UNKNOWN';
  // Missing geometry stays missing. Never connect stops or bridge separate legs.
  if (raw.path !== undefined && (!Array.isArray(raw.path) || !raw.path.every(hasRouteDestinationCoordinates))) return invalid();
  if (raw.stations != null && !Array.isArray(raw.stations)) return invalid();
  const color = text(raw.routeColor);
  return { mode, distanceMeters: amount(raw.distanceMeters), durationSeconds: amount(raw.durationSeconds),
    routeName: text(raw.routeName), routeId: text(raw.routeId), routeType: amount(raw.routeType),
    routeColor: color && /^#?[0-9a-f]{6}$/i.test(color) ? `#${color.replace(/^#/, '')}` : undefined,
    start: stop(raw.start), end: stop(raw.end),
    path: (raw.path as { latitude: number; longitude: number }[] | undefined ?? []).map(point => ({ lat: point.latitude, lng: point.longitude })),
    stations: (raw.stations as unknown[] | undefined ?? []).map(value => stop(value) ?? invalid()) };
}

export function mapTransitRouteResponse(value: unknown): TransitRoute {
  const raw = object(value);
  if (raw.mode !== 'transit' || raw.provider !== 'tmap' || !Array.isArray(raw.itineraries)) return invalid();
  if (!raw.itineraries.length) throw new ApiError('Route not found', { code: 'ROUTE_NOT_FOUND' });
  return { itineraries: raw.itineraries.map(value => {
    const item = object(value);
    if (!Array.isArray(item.legs) || !item.legs.length) return invalid();
    return { distanceMeters: amount(item.totalDistanceMeters, true)!, durationSeconds: amount(item.totalTimeSeconds, true)!,
      transferCount: amount(item.transferCount), totalWalkDistanceMeters: amount(item.totalWalkDistanceMeters),
      totalWalkTimeSeconds: amount(item.totalWalkTimeSeconds), totalFare: amount(item.totalFare), legs: item.legs.map(leg) };
  }) };
}

export async function findTransitRoute(origin: unknown, destination: unknown, signal: AbortSignal, client: ApiClient = apiClient): Promise<TransitRoute> {
  const request = routeRequest(origin, destination, 'transit');
  return mapTransitRouteResponse(await client.post<components['schemas']['TransitRouteResponse'], typeof request>('/routes', request, { signal, timeout: 15_000 }));
}
