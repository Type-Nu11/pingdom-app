import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationSubscription } from 'expo-location';

import type { LocationState } from '../model/map.types';
import { getCurrentLocation, watchCurrentLocation } from '../services/locationService';

const INITIAL_STATE: LocationState = {
  status: 'loading',
  coordinate: null,
  canAskAgain: true,
};

export function useCurrentLocation() {
  const [state, setState] = useState<LocationState>(INITIAL_STATE);
  const requestIdRef = useRef(0);
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const mountedRef = useRef(true);

  const stopWatching = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    stopWatching();
    setState((current) => (
      current.status === 'granted' ? current : INITIAL_STATE
    ));

    const outcome = await getCurrentLocation();
    if (!mountedRef.current || requestId !== requestIdRef.current) return;

    setState(outcome);
    if (outcome.status !== 'granted') return outcome;

    void watchCurrentLocation((coordinate) => {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setState({ status: 'granted', coordinate, canAskAgain: true });
      }
    }).then((subscription) => {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        subscription.remove();
      } else {
        subscriptionRef.current = subscription;
      }
    }).catch(() => {
      // Keep the successfully resolved coordinate when continuous updates fail.
    });

    return outcome;
  }, [stopWatching]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      stopWatching();
    };
  }, [refresh, stopWatching]);

  return { ...state, refresh };
}
