import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { placeDetailQueryKeys, type PlaceDetail } from '../../place/detail';
import { toPlaceEntryError, type PlaceEntryError } from '../model/placeEntryError';
import { useRecordPlaceView } from './useCommunity';

type OpenPlaceCallbacks = {
  onError?: (error: PlaceEntryError) => void;
  onSuccess?: () => void;
};

/**
 * Opens a post's connected place through the community view endpoint instead
 * of the plain place-detail GET, so the daily community-view count is never
 * skipped. In-flight calls are guarded per `${postId}:${placeId}` (a ref, so
 * a double-tap racing the first render commit is still caught) — a second
 * tap on the same card while its call is outstanding is ignored, but a
 * different card's tap is unaffected. On success, the response is seeded
 * into `usePlaceDetail`'s own cache key so the place-detail screen it opens
 * next reads it as fresh data instead of re-issuing the GET.
 */
export function useCommunityPlaceEntry(postId: number) {
  const recordPlaceView = useRecordPlaceView();
  const queryClient = useQueryClient();
  const inFlightRef = useRef<Set<string>>(new Set());
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Readonly<Record<number, PlaceEntryError>>>({});

  const setBusy = useCallback((key: string, busy: boolean) => {
    if (busy) inFlightRef.current.add(key);
    else inFlightRef.current.delete(key);
    setBusyKeys(new Set(inFlightRef.current));
  }, []);

  const openPlace = useCallback((placeId: number, callbacks: OpenPlaceCallbacks = {}) => {
    const key = `${postId}:${placeId}`;
    if (inFlightRef.current.has(key)) return;

    setBusy(key, true);
    setErrors((previous) => {
      if (!(placeId in previous)) return previous;
      const { [placeId]: _removed, ...rest } = previous;
      return rest;
    });

    recordPlaceView.mutateAsync({ placeId, postId })
      .then((place) => {
        queryClient.setQueryData<PlaceDetail>(placeDetailQueryKeys.detail(placeId), place);
        callbacks.onSuccess?.();
      })
      .catch((error: unknown) => {
        const entryError = toPlaceEntryError(error);
        setErrors((previous) => ({ ...previous, [placeId]: entryError }));
        callbacks.onError?.(entryError);
      })
      .finally(() => setBusy(key, false));
  }, [postId, queryClient, recordPlaceView, setBusy]);

  return {
    errorFor: (placeId: number): PlaceEntryError | undefined => errors[placeId],
    isBusy: (placeId: number) => busyKeys.has(`${postId}:${placeId}`),
    openPlace,
  };
}
