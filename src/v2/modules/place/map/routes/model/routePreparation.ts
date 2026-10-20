import type { Coordinate } from '../../camera/model/map.types';
import { hasRouteDestinationCoordinates, type RouteDestination, type RouteMode } from './routeUi';

export type RouteEndpoint = RouteDestination;
export function endpointCoordinate(point: RouteEndpoint | null): Coordinate | null {
  return hasRouteDestinationCoordinates(point) ? { lat: point.latitude, lng: point.longitude } : null;
}

// Same URL contract as #376; external navigation never requests the internal car API.
export function buildNaverRouteUrl(destination: RouteEndpoint, origin: RouteEndpoint | null, mode: RouteMode): string | null {
  if (!endpointCoordinate(destination) || (origin && !endpointCoordinate(origin))) return null;
  const params: Record<string, string> = {
    dlat: String(destination.latitude), dlng: String(destination.longitude), dname: destination.name,
    appname: 'com.rmdka.pingdomapp',
  };
  if (origin) Object.assign(params, { slat: String(origin.latitude), slng: String(origin.longitude), sname: origin.name });
  const query = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `nmap://route/${mode === 'transit' ? 'public' : mode === 'bike' ? 'bicycle' : mode}?${query}`;
}

/** Fit the full path in an unobscured viewport. Never changes route geometry. */
export function fitRouteCamera(points: Coordinate[], width: number, height: number) {
  let minLng = Infinity, maxLng = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const point of points) {
    const lat = Math.max(-85.05112878, Math.min(85.05112878, point.lat));
    const y = Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    minLng = Math.min(minLng, point.lng); maxLng = Math.max(maxLng, point.lng);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const xSpan = Math.max((maxLng - minLng) / 360, 0.000001);
  const ySpan = Math.max((maxY - minY) / (2 * Math.PI), 0.000001);
  const zoom = Math.floor(Math.min(Math.log2(Math.max(width - 96, 32) / (256 * xSpan)), Math.log2(Math.max(height - 120, 32) / (256 * ySpan))));
  return { center: { lat: (2 * Math.atan(Math.exp((minY + maxY) / 2)) - Math.PI / 2) * 180 / Math.PI, lng: (minLng + maxLng) / 2 }, zoom: Math.max(0, Math.min(16, zoom)) };
}

/** Shift the projected center so the whole path fits above the floating sheet. */
export function fitRoutePreviewCamera(points: Coordinate[], width: number, height: number, bottomOcclusion: number, topInset: number) {
  const fit = fitRouteCamera(points, width, Math.max(1, height - bottomOcclusion - topInset));
  const northY = Math.log(Math.tan(Math.PI / 4 + fit.center.lat * Math.PI / 360));
  const pixelsPerRadian = 256 * 2 ** fit.zoom / (2 * Math.PI);
  const adjustedY = northY - (bottomOcclusion - topInset) / (2 * pixelsPerRadian);
  const bounds = { north: -90, south: 90, east: -180, west: 180 };
  for (const point of points) { bounds.north = Math.max(bounds.north, point.lat); bounds.south = Math.min(bounds.south, point.lat); bounds.east = Math.max(bounds.east, point.lng); bounds.west = Math.min(bounds.west, point.lng); }
  return { ...fit, fit: { ...bounds, top: topInset + 60, bottom: bottomOcclusion + 60, left: 48, right: 48 }, center: { ...fit.center, lat: (2 * Math.atan(Math.exp(adjustedY)) - Math.PI / 2) * 180 / Math.PI } };
}
