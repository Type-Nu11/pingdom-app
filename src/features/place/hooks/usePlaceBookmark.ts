import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { PlacesPage, Place } from '../model/place.types';
import { placeApi } from '../api/placeApi';
import { bookmarkedPlaceQueryKeys } from './useBookmarkedPlaces';
import { placeQueryKeys } from './usePlaces';

export type TogglePlaceBookmarkPayload = {
  nextBookmarked: boolean;
  place: Place;
};

type BookmarkSnapshot = Array<[QueryKey, InfiniteData<PlacesPage> | undefined]>;

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

function isExpectedBookmarkStateError(error: unknown, nextBookmarked: boolean) {
  if (!axios.isAxiosError(error)) return false;

  const data = error.response?.data as { code?: unknown } | undefined;
  const code = String(data?.code ?? '').toUpperCase();
  return (nextBookmarked && code === 'BOOKMARK_ALREADY_EXISTS')
    || (!nextBookmarked && code === 'BOOKMARK_NOT_FOUND');
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
    mutationFn: async ({ nextBookmarked, place }: TogglePlaceBookmarkPayload) => {
      try {
        if (nextBookmarked) await placeApi.createBookmark({ placeId: place.id });
        else await placeApi.removeBookmark(place.id);
      } catch (error) {
        if (!isExpectedBookmarkStateError(error, nextBookmarked)) throw error;
      }
    },
    onMutate: async ({ nextBookmarked, place }) => {
      await queryClient.cancelQueries({ queryKey: bookmarkedPlaceQueryKeys.all });
      const previousBookmarks = queryClient.getQueriesData<InfiniteData<PlacesPage>>({
        queryKey: bookmarkedPlaceQueryKeys.list(),
      }) as BookmarkSnapshot;
      const previousMembership = queryClient.getQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
      );

      queryClient.setQueriesData<InfiniteData<PlacesPage>>(
        { queryKey: bookmarkedPlaceQueryKeys.list() },
        (data) => updateBookmarkedPlaces(data, place, nextBookmarked),
      );
      queryClient.setQueryData<Record<string, boolean>>(
        bookmarkedPlaceQueryKeys.membership(),
        (data) => updateBookmarkedPlaceMembership(data, place.id, nextBookmarked),
      );
      return { previousBookmarks, previousMembership };
    },
    onError: (_error, _payload, context) => {
      context?.previousBookmarks.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(
        bookmarkedPlaceQueryKeys.membership(),
        context?.previousMembership,
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: bookmarkedPlaceQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: placeQueryKeys.all }),
      ]);
    },
  });

  return {
    error: mutation.error,
    isPending: mutation.isPending,
    pendingPlaceId: mutation.isPending ? mutation.variables?.place.id ?? null : null,
    togglePlaceBookmark: (place: Place, nextBookmarked: boolean) => (
      mutation.mutateAsync({ nextBookmarked, place }).then(() => undefined)
    ),
  };
};

export default usePlaceBookmark;
