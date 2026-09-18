export function markersForSelectedPlace<TMarker extends { id: string }>(
  markers: TMarker[],
  selectedPlaceId: number | null,
): TMarker[] {
  if (selectedPlaceId === null) return markers;

  const legacyMarkerId = String(selectedPlaceId);
  const v2MarkerId = `place:${selectedPlaceId}`;
  return markers.filter(({ id }) => id === legacyMarkerId || id === v2MarkerId);
}
