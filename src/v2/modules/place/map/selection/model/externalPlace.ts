import { hasValidCoordinates } from '../../actions/services/placeActions';
import type { MapMarker } from '../../markers/model/placeMarker';
import type { RouteDestination } from '../../routes/model/routeUi';

export type MapSearchSelection = {
  address: string;
  id: string;
  isRegisteredPlace: boolean;
  lat: number;
  lng: number;
  name: string;
  roadAddress: string;
};

export type ExternalPlaceProvider = 'kakao';

// A provider search result that PingDom does not know about. `providerPlaceId` belongs to
// the provider and must never be read as a PingDom Place ID, even when it is numeric.
export type ExternalMapPlace = {
  address: string;
  coordinate: { latitude: number; longitude: number } | null;
  name: string;
  provider: ExternalPlaceProvider;
  providerPlaceId: string;
};

export type MapSearchSelectionTarget =
  | { kind: 'registered'; placeId: number }
  | { kind: 'external'; place: ExternalMapPlace }
  | { kind: 'unresolved' };

export const EXTERNAL_PLACE_MARKER_ID = 'external-place';

const CANONICAL_PLACE_ID_PATTERN = /^[1-9]\d*$/;

// The source of a result decides its identity. Matching IDs or names across sources are
// coincidences, so an external result never resolves to a registered place.
export function resolveMapSearchSelection(selection: MapSearchSelection): MapSearchSelectionTarget {
  if (selection.isRegisteredPlace) {
    const placeId = Number(selection.id);
    return CANONICAL_PLACE_ID_PATTERN.test(selection.id) && Number.isSafeInteger(placeId)
      ? { kind: 'registered', placeId }
      : { kind: 'unresolved' };
  }

  const coordinate = { latitude: selection.lat, longitude: selection.lng };

  return {
    kind: 'external',
    place: {
      address: selection.roadAddress.trim() || selection.address.trim(),
      coordinate: hasValidCoordinates(coordinate) ? coordinate : null,
      name: selection.name.trim(),
      provider: 'kakao',
      providerPlaceId: selection.id,
    },
  };
}

export function getExternalPlaceKey(place: ExternalMapPlace): string {
  return `${place.provider}:${place.providerPlaceId}`;
}

export function createExternalPlaceMarker(place: ExternalMapPlace | null): MapMarker | null {
  if (!place?.coordinate) return null;

  return {
    category: 'etc',
    id: EXTERNAL_PLACE_MARKER_ID,
    lat: place.coordinate.latitude,
    lng: place.coordinate.longitude,
    markerType: 'search',
  };
}

// Routes only need coordinates; `placeId: 0` is the existing marker for a non-PingDom endpoint.
export function toExternalRouteDestination(place: ExternalMapPlace | null): RouteDestination | null {
  if (!place?.coordinate) return null;

  return {
    address: place.address || null,
    latitude: place.coordinate.latitude,
    longitude: place.coordinate.longitude,
    name: place.name,
    placeId: 0,
  };
}
