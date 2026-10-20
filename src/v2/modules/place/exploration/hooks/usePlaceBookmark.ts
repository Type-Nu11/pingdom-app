import { useMemo } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import type { PlacesPage, Place } from '../../core/place.types';
import { isExpectedBookmarkStateError, placeApi } from '../api/placeApi';
import { bookmarkedPlaceQueryKeys } from './useBookmarkedPlaces';
import {
  mapHomeFeedQueryKeys,
  type RankedPlaceViewModel,
} from '../../home-feeds';

export type TogglePlaceBookmarkPayload = {
  nextBookmarked: boolean;
  place?: Place;
  placeId: number;
};

type RankedPlacesResponse = {
  places?: Array<{
    bookmarked?: boolean;
    bookmarkCount?: number;
    netBookmarkGrowth?: number;
    placeId?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
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

export function updateRankedPlaceBookmarks<T extends RankedPlacesResponse>(
  data: T | undefined,
  placeId: number,
  nextBookmarked: boolean,
) {
  if (!data?.places) return data;

  return {
    ...data,
    places: data.places.map((place) => {
      if (place.placeId !== placeId || place.bookmarked === nextBookmarked) return place;
      const bookmarkCount = place.bookmarkCount ?? 0;
      return {
        ...place,
        bookmarked: nextBookmarked,
        bookmarkCount: Math.max(0, bookmarkCount + (nextBookmarked ? 1 : -1)),
      };
    }),
  } as T;
}

export const usePlaceBookmark = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: PLACE_BOOKMARK_MUTATION_KEY,
    mutationFn: async ({ nextBookmarked, placeId }: TogglePlaceBookmarkPayload) => {
      try {
        if (nextBookmarked) await placeApi.createBookmark({ placeId });
        else await placeApi.removeBookmark(placeId);
      } catch (error) {
        if (!isExpectedBookmarkStateError(error, nextBookmarked)) throw error;
      }
    },
    onMutate: async ({ nextBookmarked, place, placeId }) => {
      const cancellation = Promise.all([
        queryClient.cancelQueries({ queryKey: bookmarkedPlaceQueryKeys.all }),
        queryClient.cancelQueries({ queryKey: mapHomeFeedQueryKeys.localHotRoot() }),
        queryClient.cancelQueries({ queryKey: mapHomeFeedQueryKeys.nationalTrendsRoot() }),
      ]);
      const previousMembership = queryClient.getQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
      );
      const previousBookmarked = Boolean(previousMembership?.[String(placeId)]);
      const previousRankedFeeds = [
        ...queryClient.getQueriesData<RankedPlacesResponse>({
          queryKey: mapHomeFeedQueryKeys.localHotRoot(),
        }),
        ...queryClient.getQueriesData<RankedPlacesResponse>({
          queryKey: mapHomeFeedQueryKeys.nationalTrendsRoot(),
        }),
      ];

      if (place) {
        queryClient.setQueriesData<InfiniteData<PlacesPage>>(
          { queryKey: bookmarkedPlaceQueryKeys.list() },
          (data) => updateBookmarkedPlaces(data, place, nextBookmarked),
        );
      }
      queryClient.setQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
        (data) => updateBookmarkedPlaceMembership(data, placeId, nextBookmarked),
      );
      queryClient.setQueriesData<RankedPlacesResponse>(
        { queryKey: mapHomeFeedQueryKeys.localHotRoot() },
        (data) => updateRankedPlaceBookmarks(data, placeId, nextBookmarked),
      );
      queryClient.setQueriesData<RankedPlacesResponse>(
        { queryKey: mapHomeFeedQueryKeys.nationalTrendsRoot() },
        (data) => updateRankedPlaceBookmarks(data, placeId, nextBookmarked),
      );

      await cancellation;
      return { previousBookmarked, previousRankedFeeds };
    },
    onError: (_error, { place, placeId }, context) => {
      if (!context) return;

      if (place) {
        queryClient.setQueriesData<InfiniteData<PlacesPage>>(
          { queryKey: bookmarkedPlaceQueryKeys.list() },
          (data) => updateBookmarkedPlaces(data, place, context.previousBookmarked),
        );
      }
      queryClient.setQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
        (data) => updateBookmarkedPlaceMembership(
          data,
          placeId,
          context.previousBookmarked,
        ),
      );
      context.previousRankedFeeds.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: PLACE_BOOKMARK_MUTATION_KEY }) > 1) return;

      // Bookmark state is owned by the bookmark queries. Waiting for refetch here keeps
      // the mutation (and its button lock) pending after the write has already completed.
      void queryClient.invalidateQueries({ queryKey: bookmarkedPlaceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: mapHomeFeedQueryKeys.localHotRoot() });
      void queryClient.invalidateQueries({ queryKey: mapHomeFeedQueryKeys.nationalTrendsRoot() });
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
      if (payload?.placeId !== undefined) result[String(payload.placeId)] = true;
      return result;
    },
    {},
  ), [pendingMutations]);

  return {
    error: mutation.error,
    isPending: mutation.isPending,
    pendingPlaceIds,
    togglePlaceBookmark: (place: Place, nextBookmarked: boolean) => (
      mutation.mutateAsync({ nextBookmarked, place, placeId: place.id }).then(() => undefined)
    ),
    toggleRankedPlaceBookmark: (
      place: RankedPlaceViewModel,
      nextBookmarked: boolean,
    ) => (
      mutation.mutateAsync({ nextBookmarked, placeId: place.placeId }).then(() => undefined)
    ),
  };
};

export default usePlaceBookmark;
