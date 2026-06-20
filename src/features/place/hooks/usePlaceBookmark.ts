import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import { placeApi } from '../api/placeApi';

type BookmarkState = Record<string, boolean>;

function getErrorCode(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return '';
  }

  const responseData = error.response?.data as { code?: unknown } | undefined;
  return String(responseData?.code ?? '').toUpperCase();
}

/**
 * Keeps place bookmark state in sync with the create/remove endpoints for the
 * current app session. A bookmark-list endpoint is still needed to hydrate
 * this state after a fresh app launch.
 */
export const usePlaceBookmark = () => {
  const [bookmarkedByPlaceId, setBookmarkedByPlaceId] = useState<BookmarkState>({});
  const [pendingByPlaceId, setPendingByPlaceId] = useState<BookmarkState>({});
  const bookmarkedByPlaceIdRef = useRef<BookmarkState>({});
  const pendingByPlaceIdRef = useRef<BookmarkState>({});

  const setBookmarks = useCallback((nextBookmarks: BookmarkState) => {
    bookmarkedByPlaceIdRef.current = nextBookmarks;
    setBookmarkedByPlaceId(nextBookmarks);
  }, []);

  const setPending = useCallback((nextPending: BookmarkState) => {
    pendingByPlaceIdRef.current = nextPending;
    setPendingByPlaceId(nextPending);
  }, []);

  const isPlaceBookmarked = useCallback(
    (placeId: number) => Boolean(bookmarkedByPlaceId[String(placeId)]),
    [bookmarkedByPlaceId],
  );

  const isPlaceBookmarkPending = useCallback(
    (placeId: number) => Boolean(pendingByPlaceId[String(placeId)]),
    [pendingByPlaceId],
  );

  const togglePlaceBookmark = useCallback(async (placeId: number) => {
    const key = String(placeId);

    if (pendingByPlaceIdRef.current[key]) {
      return;
    }

    const previousBookmarks = bookmarkedByPlaceIdRef.current;
    const wasBookmarked = Boolean(previousBookmarks[key]);
    const nextBookmarks = { ...previousBookmarks, [key]: !wasBookmarked };
    const previousPending = pendingByPlaceIdRef.current;

    setBookmarks(nextBookmarks);
    setPending({ ...previousPending, [key]: true });

    try {
      if (wasBookmarked) {
        await placeApi.removeBookmark(placeId);
      } else {
        await placeApi.createBookmark({ placeId });
      }
    } catch (error) {
      const errorCode = getErrorCode(error);

      // The desired state is already true/false even if a previous session
      // made the same request, so keep the optimistic result in those cases.
      if (
        (!wasBookmarked && errorCode === 'BOOKMARK_ALREADY_EXISTS')
        || (wasBookmarked && errorCode === 'BOOKMARK_NOT_FOUND')
      ) {
        return;
      }

      setBookmarks(previousBookmarks);
      throw error;
    } finally {
      const nextPending = { ...pendingByPlaceIdRef.current };
      delete nextPending[key];
      setPending(nextPending);
    }
  }, [setBookmarks, setPending]);

  return {
    isPlaceBookmarked,
    isPlaceBookmarkPending,
    togglePlaceBookmark,
  };
};

export default usePlaceBookmark;
