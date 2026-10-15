import { mapTransitRouteResponse } from '../api/transitRoutesApi';
import { transitMapSegments } from '../model/transitPresentation';
import { transitResponse } from './transitFixture';

test('missing or degenerate legs do not become endpoint connectors, while remaining real geometry is retained', () => {
  const itinerary = mapTransitRouteResponse(transitResponse).itineraries[0];
  itinerary.legs[0].path = [];
  expect(transitMapSegments(itinerary)).toEqual([{ color: '#00A84D', path: [{ lat: 37.502, lng: 127.002 }, { lat: 37.6, lng: 127.1 }] }]);
  itinerary.legs[1].path = [{ lat: 37.5, lng: 127 }, { lat: 37.5, lng: 127 }];
  expect(transitMapSegments(itinerary)).toEqual([]);
});
