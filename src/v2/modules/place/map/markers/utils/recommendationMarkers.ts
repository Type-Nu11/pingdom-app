import type { MapMarker } from '../model/placeMarker';
import { normalizePlaceCategory } from '../../../core/placeCategory';

type FocusedMarkerPlace = {
  category: string;
  id: number;
  latitude: number;
  longitude: number;
};

export function createFocusedPlaceMarker(
  selectedPlace: FocusedMarkerPlace | null,
  existingMarkerIds: ReadonlySet<string>,
): MapMarker | null {
  if (!selectedPlace || !Number.isFinite(selectedPlace.latitude) || !Number.isFinite(selectedPlace.longitude)) return null;

  const markerId = String(selectedPlace.id);
  if (existingMarkerIds.has(markerId)) return null;

  return {
    category: normalizePlaceCategory(selectedPlace.category),
    id: markerId,
    lat: selectedPlace.latitude,
    lng: selectedPlace.longitude,
    markerType: 'default',
  };
}
