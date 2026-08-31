type IdentifiedPlace = {
  id: number;
};

export function shouldPresentMapSelection(sheetSnapPoint: 'collapsed' | 'expanded' | 'medium') {
  return sheetSnapPoint !== 'collapsed';
}

export function mergeMapPreviewPlaces<T extends IdentifiedPlace>(
  ...groups: readonly T[][]
): T[] {
  const placesById = new Map<number, T>();

  groups.flat().forEach((place) => {
    if (!placesById.has(place.id)) placesById.set(place.id, place);
  });

  return [...placesById.values()];
}

export function findMapPreviewPlace<T extends IdentifiedPlace>(
  markerId: string,
  places: readonly T[],
): T | null {
  const placeId = Number(markerId);
  if (!Number.isSafeInteger(placeId) || placeId <= 0) return null;

  return places.find((place) => place.id === placeId) ?? null;
}
