import type { MapMarker } from '../model/place.types';

export function applyBookmarkStateToMarkers(
  markers: MapMarker[],
  bookmarkedPlaceIds: Record<string, boolean>,
): MapMarker[] {
  return markers.map((marker) => ({
    ...marker,
    bookmarked: Boolean(bookmarkedPlaceIds[marker.id]),
  }));
}
