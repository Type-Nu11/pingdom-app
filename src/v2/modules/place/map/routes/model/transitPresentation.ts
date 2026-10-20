import type { TransitItinerary, TransitLeg } from '../api/transitRoutesApi';

export function transitLegColor(leg: TransitLeg): string {
  return leg.routeColor ?? (leg.mode === 'WALK' ? '#767680' : leg.mode === 'SUBWAY' ? '#EE2B2B' : '#008BFF');
}

export function transitMapSegments(itinerary: TransitItinerary) {
  return itinerary.legs.filter(leg => leg.path.length >= 2
    && leg.path.some(point => point.lat !== leg.path[0].lat || point.lng !== leg.path[0].lng))
    .map(leg => ({ path: leg.path, color: transitLegColor(leg) }));
}
