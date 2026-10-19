import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationSubscription } from 'expo-location';
import { AppState } from 'react-native';

import type { LocationState } from '../../camera/model/map.types';
import { getCurrentLocation, watchCurrentLocation } from '../services/locationService';

const INITIAL_STATE: LocationState = {
  status: 'loading',
  coordinate: null,
  canAskAgain: true,
};

export function useCurrentLocation(enabled = true) {
  const [state, setState] = useState<LocationState>(INITIAL_STATE);
  const requestIdRef = useRef(0);
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const mountedRef = useRef(true);
  const activeRef = useRef(false);

  const stopWatching = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const refresh = useCallback(async (requestPermission = true) => {
    if (!activeRef.current) return;
    const requestId = ++requestIdRef.current;
    stopWatching();
    setState((current) => (
      current.status === 'granted' ? current : INITIAL_STATE
    ));

    const outcome = await getCurrentLocation(requestPermission);
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
    const syncActivity = () => {
      const active = enabled && AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
      if (active === activeRef.current) return;
      activeRef.current = active;
      if (active) {
        void refresh(false);
      } else {
        requestIdRef.current += 1;
        stopWatching();
      }
    };
    syncActivity();
    const subscription = AppState.addEventListener('change', syncActivity);

    return () => {
      mountedRef.current = false;
      activeRef.current = false;
      requestIdRef.current += 1;
      subscription.remove();
      stopWatching();
    };
  }, [enabled, refresh, stopWatching]);

  return { ...state, refresh };
}
