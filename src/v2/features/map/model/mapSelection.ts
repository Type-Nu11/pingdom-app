// Kakao VectorMap uses larger levels for a closer camera.
export const MAP_PREVIEW_ZOOM_LEVEL = 17;
export const MAP_DISMISSED_ZOOM_LEVEL = 15;
export const MAP_LOCATE_ZOOM_LEVEL = 18;

export function markersForSelectedPlace<TMarker extends { id: string }>(
  markers: TMarker[],
  selectedPlaceId: number | null,
): TMarker[] {
  if (selectedPlaceId === null) return markers;

  const legacyMarkerId = String(selectedPlaceId);
  const v2MarkerId = `place:${selectedPlaceId}`;
  return markers.filter(({ id }) => id === legacyMarkerId || id === v2MarkerId);
}
