import type { Coordinate } from '../../camera/model/map.types';

const METERS_PER_DEGREE = Math.PI * 6_371_000 / 180;
const MAX_TRIM_METERS = 6;
const CURVE_STEPS = 8;

/** Display geometry only: keep provider geometry for distance, arrival and route fitting.
 * Trim at most 6 m (and 1/4 of either adjacent segment) around a bend, then join with
 * a quadratic Bezier. Its deviation from the original segments is at most 3 m.
 * Preserve endpoints, straight stretches, very sharp reversals and invalid inputs.
 */
export function smoothRouteCorners(points?: Coordinate[]): Coordinate[] | undefined {
  if (!points || points.length < 3 || points.some(point => !Number.isFinite(point.lat)
    || !Number.isFinite(point.lng) || Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180)) return points;
  const result: Coordinate[] = [points[0]];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1], corner = points[index], next = points[index + 1];
    const longitudeScale = Math.cos(corner.lat * Math.PI / 180);
    if (Math.abs(longitudeScale) < 0.01 || Math.abs(corner.lng - previous.lng) > 180
      || Math.abs(next.lng - corner.lng) > 180) { result.push(corner); continue; }
    const inX = (corner.lng - previous.lng) * longitudeScale * METERS_PER_DEGREE;
    const inY = (corner.lat - previous.lat) * METERS_PER_DEGREE;
    const outX = (next.lng - corner.lng) * longitudeScale * METERS_PER_DEGREE;
    const outY = (next.lat - corner.lat) * METERS_PER_DEGREE;
    const incoming = Math.hypot(inX, inY), outgoing = Math.hypot(outX, outY);
    const cosine = (inX * outX + inY * outY) / (incoming * outgoing);
    if (incoming < 0.1 || outgoing < 0.1 || cosine > Math.cos(5 * Math.PI / 180)
      || cosine < Math.cos(150 * Math.PI / 180)) { result.push(corner); continue; }
    const trim = Math.min(MAX_TRIM_METERS, incoming / 4, outgoing / 4);
    const entry = {
      lat: corner.lat + (previous.lat - corner.lat) * trim / incoming,
      lng: corner.lng + (previous.lng - corner.lng) * trim / incoming,
    };
    const exit = {
      lat: corner.lat + (next.lat - corner.lat) * trim / outgoing,
      lng: corner.lng + (next.lng - corner.lng) * trim / outgoing,
    };
    for (let step = 0; step <= CURVE_STEPS; step += 1) {
      const t = step / CURVE_STEPS, u = 1 - t;
      result.push({
        lat: u * u * entry.lat + 2 * u * t * corner.lat + t * t * exit.lat,
        lng: u * u * entry.lng + 2 * u * t * corner.lng + t * t * exit.lng,
      });
    }
  }
  result.push(points[points.length - 1]);
  return result;
}
