import type { Coordinate, LocationState } from '../../camera/model/map.types';

/** Straight-line distance, never presented as remaining road distance. */
export function destinationDistance(from: Coordinate, to: Coordinate): number {
  const radians = Math.PI / 180;
  const a = Math.sin((to.lat - from.lat) * radians / 2) ** 2
    + Math.cos(from.lat * radians) * Math.cos(to.lat * radians)
    * Math.sin((to.lng - from.lng) * radians / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

export function freshTrackingCoordinate(location: LocationState, now: number): Coordinate | null {
  if (location.status !== 'granted') return null;
  const point = location.coordinate;
  const age = now - Date.parse(point.observedAt ?? '');
  return Number.isFinite(point.lat) && Math.abs(point.lat) <= 90
    && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180
    && Number.isFinite(age) && age >= -5_000 && age <= 15_000 ? point : null;
}

/** Include the reported uncertainty in a conservative 30 m arrival radius. */
export function isTrackingArrival(point: Coordinate, destination: Coordinate): boolean {
  const accuracy = point.accuracyMeters;
  return typeof accuracy === 'number' && Number.isFinite(accuracy) && accuracy >= 0
    && destinationDistance(point, destination) + accuracy <= 30;
}
