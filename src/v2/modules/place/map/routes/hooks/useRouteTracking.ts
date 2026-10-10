import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import type { LocationState } from '../../camera/model/map.types';
import { findCarRoute, type CarRoute } from '../api/routesApi';
import { createRouteSession, type RouteState } from '../model/routeState';
import { endpointCoordinate } from '../model/routePreparation';
import type { RouteDestination } from '../model/routeUi';
import { freshTrackingCoordinate, isTrackingArrival } from '../model/routeTracking';

type Tracking = { destination: RouteDestination; state: RouteState; arrived: boolean };

export function useRouteTracking(location: LocationState) {
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [now, setNow] = useState(Date.now);
  const session = useMemo(() => createRouteSession(state => {
    setTracking(current => current ? { ...current, state } : null);
  }), []);
  useEffect(() => session.dispose, [session]);
  const active = tracking !== null;
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, [active]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      setForeground(state === 'active'); setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);
  const coordinate = foreground ? freshTrackingCoordinate(location, now) : null;
  const destinationCoordinate = endpointCoordinate(tracking?.destination ?? null);
  useEffect(() => {
    if (tracking?.state.kind === 'ready' && !tracking.arrived && coordinate && destinationCoordinate
      && isTrackingArrival(coordinate, destinationCoordinate)) {
      setTracking(current => current ? { ...current, arrived: true } : null);
    }
  }, [tracking, coordinate, destinationCoordinate]);
  return {
    tracking, coordinate,
    start(origin: RouteDestination, destination: RouteDestination, existingRoute?: CarRoute) {
      session.cancel();
      setNow(Date.now());
      setTracking({ destination: { ...destination }, arrived: false,
        state: existingRoute ? { kind: 'ready', route: existingRoute } : { kind: 'loading' } });
      if (!existingRoute) void session.request(signal => findCarRoute(origin, destination, signal));
    },
    stop() { session.cancel(); setTracking(null); },
  };
}
