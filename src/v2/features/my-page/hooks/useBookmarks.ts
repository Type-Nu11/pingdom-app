import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookmarkApi } from '../api/bookmarkApi';

// Fetch membership in the largest page the server accepts so a typical account
// resolves in a single request. The loop below is still capped so an account with
// an unusually large bookmark list cannot stall the My Page entry.
const BOOKMARK_MEMBERSHIP_PAGE_SIZE = 100;
const BOOKMARK_MEMBERSHIP_MAX_IDS = 500;
const BOOKMARK_MEMBERSHIP_STALE_TIME_MS = 5 * 60 * 1000;

export const bookmarkQueryKeys = {
  all: ['v2', 'bookmarks'] as const,
  membership: () => [...bookmarkQueryKeys.all, 'membership'] as const,
};

async function fetchBookmarkedPlaceIds(): Promise<ReadonlySet<number>> {
  const placeIds = new Set<number>();
  let page = 1;

  for (;;) {
    const response = await bookmarkApi.listBookmarks({ limit: BOOKMARK_MEMBERSHIP_PAGE_SIZE, page });
    response.places.forEach((place) => placeIds.add(place.id));

    if (!response.hasNext || page >= response.totalPages) break;
    if (placeIds.size >= BOOKMARK_MEMBERSHIP_MAX_IDS) break;
    page += 1;
  }

  return placeIds;
}

export function useBookmarkedPlaceIds() {
  const query = useQuery({
    queryFn: fetchBookmarkedPlaceIds,
    queryKey: bookmarkQueryKeys.membership(),
    staleTime: BOOKMARK_MEMBERSHIP_STALE_TIME_MS,
  });

  return {
    bookmarkedPlaceIds: query.data ?? new Set<number>(),
    isLoading: query.isLoading,
  };
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nextBookmarked, placeId }: { nextBookmarked: boolean; placeId: number }) => (
      nextBookmarked ? bookmarkApi.addBookmark(placeId) : bookmarkApi.removeBookmark(placeId)
    ),
    onMutate: async ({ nextBookmarked, placeId }) => {
      await queryClient.cancelQueries({ queryKey: bookmarkQueryKeys.membership() });
      const previous = queryClient.getQueryData<ReadonlySet<number>>(bookmarkQueryKeys.membership());

      queryClient.setQueryData<ReadonlySet<number>>(bookmarkQueryKeys.membership(), (current) => {
        const next = new Set(current ?? []);
        if (nextBookmarked) next.add(placeId);
        else next.delete(placeId);
        return next;
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookmarkQueryKeys.membership(), context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: bookmarkQueryKeys.membership() });
    },
  });
}
