import { useCallback, useEffect, useRef, useState } from 'react';

import { nativePlaceActionBridge, type PlaceActionNative } from '../../../../../shared/native/placeActionBridge';
import {
  openPlaceDirections,
  sharePlace,
  type PlaceActionTarget,
} from '../services/placeActions';

export type PlaceActionFeedback =
  | 'directions-failed'
  | 'directions-unavailable'
  | 'place-location-missing'
  | 'share-failed'
  | 'share-unavailable';

type PlaceActionKind = 'directions' | 'share';

type UsePlaceActionsOptions = {
  native?: PlaceActionNative;
  onFeedback?: (feedback: PlaceActionFeedback) => void;
};

export function usePlaceActions(
  selectedPlace: PlaceActionTarget | null,
  { native = nativePlaceActionBridge, onFeedback }: UsePlaceActionsOptions = {},
) {
  const [busyAction, setBusyAction] = useState<PlaceActionKind | null>(null);
  const selectedRef = useRef(selectedPlace);
  const selectionKeyRef = useRef(selectedPlace?.placeId ?? null);
  const generationRef = useRef(0);
  const lockRef = useRef<{ action: PlaceActionKind; generation: number } | null>(null);
  const nextSelectionKey = selectedPlace?.placeId ?? null;

  selectedRef.current = selectedPlace;
  if (selectionKeyRef.current !== nextSelectionKey) {
    selectionKeyRef.current = nextSelectionKey;
    generationRef.current += 1;
    lockRef.current = null;
  }

  useEffect(() => {
    setBusyAction(null);
  }, [nextSelectionKey]);

  const run = useCallback(async (action: PlaceActionKind, place: PlaceActionTarget) => {
    if (selectedRef.current?.placeId !== place.placeId) return;
    const generation = generationRef.current;
    if (lockRef.current?.generation === generation) return;

    lockRef.current = { action, generation };
    setBusyAction(action);
    const outcome = action === 'share'
      ? await sharePlace(place, native)
      : await openPlaceDirections(place, native);

    if (generation !== generationRef.current || selectedRef.current?.placeId !== place.placeId) {
      return;
    }
    lockRef.current = null;
    setBusyAction(null);

    if (action === 'share') {
      if (outcome === 'failed') onFeedback?.('share-failed');
      if (outcome === 'unavailable') onFeedback?.('share-unavailable');
      return;
    }

    if (outcome === 'invalid-location') onFeedback?.('place-location-missing');
    if (outcome === 'availability-check-failed' || outcome === 'unavailable') {
      onFeedback?.('directions-unavailable');
    }
    if (outcome === 'open-failed') onFeedback?.('directions-failed');
  }, [native, onFeedback]);

  return {
    busyAction,
    directions: useCallback(
      (place: PlaceActionTarget) => run('directions', place),
      [run],
    ),
    share: useCallback(
      (place: PlaceActionTarget) => run('share', place),
      [run],
    ),
  };
}
