import type { MapMarker } from '../model/placeMarker';
import { normalizePlaceCategory } from '../../../core/placeCategory';

type RecommendationMarkerPlace = {
  category: string;
  id: number;
  latitude: number;
  longitude: number;
};

export function withRecommendationFallbackMarkers(
  markers: MapMarker[],
  recommendations: RecommendationMarkerPlace[],
  listFailed: boolean,
): MapMarker[] {
  if (!listFailed) return markers;

  const result = [...markers];
  const ids = new Set(markers.map((marker) => marker.id));
  for (const place of recommendations) {
    const id = String(place.id);
    if (ids.has(id) || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)
      || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180) continue;
    ids.add(id);
    result.push({
      category: normalizePlaceCategory(place.category),
      id,
      lat: place.latitude,
      lng: place.longitude,
      markerType: 'default',
    });
  }
  return result;
}

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
