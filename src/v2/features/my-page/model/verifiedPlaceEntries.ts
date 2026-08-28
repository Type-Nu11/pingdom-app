import type { PlaceDetail } from '../../place-detail/model/placeDetail.types';

/**
 * A verified place slot in render order. The slot exists as soon as its check-in
 * is known, so the list order stays fixed no matter which place detail resolves
 * first, and a slot that is still loading renders a skeleton instead of vanishing.
 */
export type VerifiedPlaceEntry = Readonly<{
  isError: boolean;
  isLoading: boolean;
  place: PlaceDetail | null;
  placeId: number;
}>;

type PlaceDetailQueryState = Readonly<{
  data?: PlaceDetail;
  isError: boolean;
  isLoading: boolean;
}>;

export function toVerifiedPlaceEntries(
  placeIds: readonly number[],
  queries: readonly PlaceDetailQueryState[],
): VerifiedPlaceEntry[] {
  return placeIds.map((placeId, index) => {
    const query = queries[index];

    return {
      isError: query?.isError ?? false,
      isLoading: query?.isLoading ?? true,
      place: query?.data ?? null,
      placeId,
    };
  });
}

/**
 * A slot that failed is dropped: the place cannot be rendered and retrying it
 * inline would stall the rest of the list. Loading slots are kept so the
 * skeleton holds their position.
 */
export function toRenderableVerifiedPlaceEntries(
  entries: readonly VerifiedPlaceEntry[],
): VerifiedPlaceEntry[] {
  return entries.filter((entry) => !entry.isError);
}
