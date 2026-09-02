type IdentifiedPlace = {
  id: number;
};

export function shouldPresentMapSelection(sheetSnapPoint: 'collapsed' | 'expanded' | 'medium') {
  return sheetSnapPoint !== 'collapsed';
}

export function mergeMapPreviewPlaces<T extends IdentifiedPlace>(
  ...groups: readonly (readonly T[])[]
): T[] {
  const placesById = new Map<number, T>();

  groups.flat().forEach((place) => {
    if (!placesById.has(place.id)) placesById.set(place.id, place);
  });

  return [...placesById.values()];
}

export function includeSelectedNearbyReservablePlace<
  T extends IdentifiedPlace & { distanceMeters?: number },
>(
  places: readonly T[],
  selectedPlace: T | null,
  options: { radiusKm: number; reservable: boolean },
): T[] {
  const distanceMeters = selectedPlace?.distanceMeters;
  const withinRadius = typeof distanceMeters === 'number'
    && Number.isFinite(distanceMeters)
    && distanceMeters <= options.radiusKm * 1_000;

  if (!selectedPlace || !options.reservable || !withinRadius) return [...places];
  return mergeMapPreviewPlaces([selectedPlace], places);
}

export function findMapPreviewPlace<T extends IdentifiedPlace>(
  markerId: string,
  places: readonly T[],
): T | null {
  const placeId = Number(markerId);
  if (!Number.isSafeInteger(placeId) || placeId <= 0) return null;

  return places.find((place) => place.id === placeId) ?? null;
}
