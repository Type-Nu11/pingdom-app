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

export type VerifiedPlaceListState =
  | Readonly<{ entries: VerifiedPlaceEntry[]; kind: 'ready' }>
  | Readonly<{ kind: 'empty' }>
  | Readonly<{ kind: 'error' }>;

/**
 * Separates "the user has no verified places" from "we could not load them".
 * Dropping every failed slot and falling through to the empty copy would tell a
 * user with verified places that they have none, so a list whose slots all
 * failed reports an error instead. A partial failure still renders what loaded.
 */
export function toVerifiedPlaceListState(
  entries: readonly VerifiedPlaceEntry[],
): VerifiedPlaceListState {
  if (entries.length === 0) {
    return { kind: 'empty' };
  }

  if (entries.every((entry) => entry.isError)) {
    return { kind: 'error' };
  }

  return { entries: entries.filter((entry) => !entry.isError), kind: 'ready' };
}
