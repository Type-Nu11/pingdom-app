import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import type { Coordinate, LocationState } from '../../camera/model/map.types';
import { findCarRoute, type CarRoute } from '../api/routesApi';
import { createRouteSession, type RouteState } from '../model/routeState';
import { endpointCoordinate } from '../model/routePreparation';
import type { RouteDestination } from '../model/routeUi';
import { watchCurrentLocation } from '../../location/services/locationService';
import { freshTrackingCoordinate, isTrackingArrival } from '../model/routeTracking';

type Tracking = { destination: RouteDestination; state: RouteState; arrived: boolean; previewOrigin?: Coordinate };

export function useRouteTracking(location: LocationState) {
  const [preciseCoordinate, setPreciseCoordinate] = useState<Coordinate | null>(null);
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
  useEffect(() => {
    if (!active || tracking?.previewOrigin || tracking?.arrived || !foreground || location.status !== 'granted') return;
    let disposed = false;
    let subscription: { remove: () => void } | undefined;
    void watchCurrentLocation(point => {
      if (!disposed) { setPreciseCoordinate(point); setNow(Date.now()); }
    }, true).then(value => {
      if (disposed) value.remove(); else subscription = value;
    }).catch(() => { /* Fresh map fixes remain available if the precise watcher fails. */ });
    return () => { disposed = true; subscription?.remove(); };
  }, [active, tracking?.previewOrigin, tracking?.arrived, foreground, location.status]);
  const latestLocation = location.status === 'granted' && preciseCoordinate
    && (!freshTrackingCoordinate(location, now) || Date.parse(preciseCoordinate.observedAt ?? '') > Date.parse(location.coordinate.observedAt ?? ''))
    ? { ...location, coordinate: preciseCoordinate } : location;
  const coordinate = tracking?.previewOrigin ?? (foreground ? freshTrackingCoordinate(latestLocation, now) : null);
  const destinationCoordinate = endpointCoordinate(tracking?.destination ?? null);
  useEffect(() => {
    if (tracking?.state.kind === 'ready' && !tracking.previewOrigin && !tracking.arrived && coordinate && destinationCoordinate
      && isTrackingArrival(coordinate, destinationCoordinate)) {
      setTracking(current => current ? { ...current, arrived: true } : null);
    }
  }, [tracking, coordinate, destinationCoordinate]);
  return {
    tracking, coordinate,
    start(origin: RouteDestination, destination: RouteDestination, existingRoute?: CarRoute, initialCoordinate?: Coordinate, previewOrigin?: Coordinate) {
      session.cancel();
      setNow(Date.now());
      setPreciseCoordinate(initialCoordinate ?? null);
      setTracking({ destination: { ...destination }, arrived: false, previewOrigin,
        state: existingRoute ? { kind: 'ready', route: existingRoute } : { kind: 'loading' } });
      if (!existingRoute) void session.request(signal => findCarRoute(origin, destination, signal));
    },
    stop() { session.cancel(); setTracking(null); setPreciseCoordinate(null); },
  };
}
