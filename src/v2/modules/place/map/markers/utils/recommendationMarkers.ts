import type { MapMarker } from '../model/placeMarker';
import { normalizePlaceCategory } from '../../../core/placeCategory';

type RecommendationMarkerPlace = {
  category: string;
  id: number;
  latitude: number;
  longitude: number;
};

export function createFocusedRecommendationMarker(
  selectedPlace: RecommendationMarkerPlace | null,
  recommendationPlaceIds: ReadonlySet<number>,
  existingMarkerIds: ReadonlySet<string>,
): MapMarker | null {
  if (!selectedPlace || !recommendationPlaceIds.has(selectedPlace.id)) return null;

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
