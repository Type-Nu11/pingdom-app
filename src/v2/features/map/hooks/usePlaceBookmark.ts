import { useMemo } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import type { PlacesPage, Place } from '../model/place.types';
import { isExpectedBookmarkStateError, placeApi } from '../api/placeApi';
import { bookmarkedPlaceQueryKeys } from './useBookmarkedPlaces';

export type TogglePlaceBookmarkPayload = {
  nextBookmarked: boolean;
  place: Place;
};

const PLACE_BOOKMARK_MUTATION_KEY = ['placeBookmarkMutation'] as const;

export function updateBookmarkedPlaceMembership(
  data: Record<string, boolean> | undefined,
  placeId: number,
  nextBookmarked: boolean,
) {
  if (!data) return data;

  const nextData = { ...data };
  if (nextBookmarked) nextData[String(placeId)] = true;
  else delete nextData[String(placeId)];
  return nextData;
}

export function updateBookmarkedPlaces(
  data: InfiniteData<PlacesPage> | undefined,
  place: Place,
  nextBookmarked: boolean,
) {
  if (!data) return data;

  const alreadyIncluded = data.pages.some((page) => (
    page.places.some((item) => item.id === place.id)
  ));
  const countDelta = nextBookmarked
    ? (alreadyIncluded ? 0 : 1)
    : (alreadyIncluded ? -1 : 0);

  return {
    ...data,
    pages: data.pages.map((page, index) => ({
      ...page,
      places: nextBookmarked
        ? (index === 0 && !alreadyIncluded ? [place, ...page.places] : page.places)
        : page.places.filter((item) => item.id !== place.id),
      totalCount: Math.max(0, page.totalCount + countDelta),
    })),
  };
}

export const usePlaceBookmark = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: PLACE_BOOKMARK_MUTATION_KEY,
    mutationFn: async ({ nextBookmarked, place }: TogglePlaceBookmarkPayload) => {
      try {
        if (nextBookmarked) await placeApi.createBookmark({ placeId: place.id });
        else await placeApi.removeBookmark(place.id);
      } catch (error) {
        if (!isExpectedBookmarkStateError(error, nextBookmarked)) throw error;
      }
    },
    onMutate: async ({ nextBookmarked, place }) => {
      const cancellation = queryClient.cancelQueries({ queryKey: bookmarkedPlaceQueryKeys.all });
      const previousMembership = queryClient.getQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
      );
      const previousBookmarked = Boolean(previousMembership?.[String(place.id)]);

      queryClient.setQueriesData<InfiniteData<PlacesPage>>(
        { queryKey: bookmarkedPlaceQueryKeys.list() },
        (data) => updateBookmarkedPlaces(data, place, nextBookmarked),
      );
      queryClient.setQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
        (data) => updateBookmarkedPlaceMembership(data, place.id, nextBookmarked),
      );

      await cancellation;
      return { previousBookmarked };
    },
    onError: (_error, { place }, context) => {
      if (!context) return;

      queryClient.setQueriesData<InfiniteData<PlacesPage>>(
        { queryKey: bookmarkedPlaceQueryKeys.list() },
        (data) => updateBookmarkedPlaces(data, place, context.previousBookmarked),
      );
      queryClient.setQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
        (data) => updateBookmarkedPlaceMembership(
          data,
          place.id,
          context.previousBookmarked,
        ),
      );
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: PLACE_BOOKMARK_MUTATION_KEY }) > 1) return;

      // Bookmark state is owned by the bookmark queries. Waiting for refetch here keeps
      // the mutation (and its button lock) pending after the write has already completed.
      void queryClient.invalidateQueries({ queryKey: bookmarkedPlaceQueryKeys.all });
    },
  });
  const pendingMutations = useMutationState<TogglePlaceBookmarkPayload>({
    filters: {
      mutationKey: PLACE_BOOKMARK_MUTATION_KEY,
      status: 'pending',
    },
    select: (pendingMutation) => pendingMutation.state.variables as TogglePlaceBookmarkPayload,
  });
  const pendingPlaceIds = useMemo(() => pendingMutations.reduce<Record<string, boolean>>(
    (result, payload) => {
      if (payload?.place.id !== undefined) result[String(payload.place.id)] = true;
      return result;
    },
    {},
  ), [pendingMutations]);

  return {
    error: mutation.error,
    isPending: mutation.isPending,
    pendingPlaceIds,
    togglePlaceBookmark: (place: Place, nextBookmarked: boolean) => (
      mutation.mutateAsync({ nextBookmarked, place }).then(() => undefined)
    ),
  };
};

export default usePlaceBookmark;
