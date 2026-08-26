// Kakao VectorMap follows the conventional scale where a larger level is closer.
// Keep both the resting map and a selected place at a neighborhood scale.
export const MAP_PREVIEW_ZOOM_LEVEL = 17;
export const MAP_DISMISSED_ZOOM_LEVEL = 15;

export function markersForSelectedPlace<TMarker extends { id: string }>(
  markers: TMarker[],
  selectedPlaceId: number | null,
): TMarker[] {
  if (selectedPlaceId === null) return markers;

  const legacyMarkerId = String(selectedPlaceId);
  const v2MarkerId = `place:${selectedPlaceId}`;
  return markers.filter(({ id }) => id === legacyMarkerId || id === v2MarkerId);
}
