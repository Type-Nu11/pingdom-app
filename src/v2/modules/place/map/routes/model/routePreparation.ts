import type { Coordinate } from '../../camera/model/map.types';
import { hasRouteDestinationCoordinates, type RouteDestination, type RouteMode } from './routeUi';

/** Internal screen model, not a proposed backend DTO. */
export type RouteEndpoint = RouteDestination;
export function endpointCoordinate(point: RouteEndpoint | null): Coordinate | null {
  return point && hasRouteDestinationCoordinates(point)
    ? { lat: point.latitude!, lng: point.longitude! } : null;
}

export function buildNaverRouteUrl(destination: RouteEndpoint, origin: RouteEndpoint | null, mode: RouteMode): string | null {
  if (!endpointCoordinate(destination)) return null;
  if (origin && !endpointCoordinate(origin)) return null;
  const params: Record<string, string> = {
    dlat: String(destination.latitude), dlng: String(destination.longitude), dname: destination.name,
    appname: 'com.rmdka.pingdomapp',
  };
  if (origin) Object.assign(params, { slat: String(origin.latitude), slng: String(origin.longitude), sname: origin.name });
  const query = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `nmap://route/${mode === 'transit' ? 'public' : mode === 'bike' ? 'bicycle' : mode}?${query}`;
}

/** Fit all coordinates in the unobscured map viewport (Web Mercator). */
export function fitRouteCamera(points: Coordinate[], width: number, height: number) {
  const valid = points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 85 && Math.abs(p.lng) <= 180);
  if (!valid.length) return { lat: 37.5665, lng: 126.978, zoom: 14 };
  const ys = valid.map(p => Math.log(Math.tan(Math.PI / 4 + p.lat * Math.PI / 360)));
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const minLng = Math.min(...valid.map(p => p.lng)), maxLng = Math.max(...valid.map(p => p.lng));
  const xSpan = Math.max((maxLng - minLng) / 360, 0.000001);
  const ySpan = Math.max((maxY - minY) / (2 * Math.PI), 0.000001);
  const zoom = Math.floor(Math.min(Math.log2(Math.max(width - 96, 32) / (256 * xSpan)), Math.log2(Math.max(height - 120, 32) / (256 * ySpan))));
  return { lat: (2 * Math.atan(Math.exp((minY + maxY) / 2)) - Math.PI / 2) * 180 / Math.PI, lng: (minLng + maxLng) / 2, zoom: Math.max(0, Math.min(16, zoom)) };
}

export function canPreviewRoutes(isDevBuild: boolean, environment: string): boolean {
  return isDevBuild && environment === 'development';
}

// Fixed synthetic fixture. Never bend this path to a user's real endpoints.
export const sampleRoute = {
  origin: { placeId: 0, name: '시청 · City Hall', latitude: 37.5665, longitude: 126.978 },
  destination: { placeId: 0, name: '청계광장 · Cheonggye Plaza', latitude: 37.569, longitude: 126.9789 },
  path: [
    { lat: 37.5665, lng: 126.978 }, { lat: 37.567, lng: 126.978 },
    { lat: 37.5678, lng: 126.9783 }, { lat: 37.5685, lng: 126.9785 },
    { lat: 37.569, lng: 126.9789 },
  ],
};
