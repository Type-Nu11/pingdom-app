import { useCallback, useEffect, useRef, useState } from 'react';
import { findCarRoute, isRouteCoordinate, routeErrorKey, routeRetryDelay, type CarRoute } from './routeApi';
import type { PlaceActionTarget } from '../actions/services/placeActions';

type State = { status: 'idle' | 'loading' | 'success' | 'error'; route?: CarRoute; errorKey?: string; selectionKey?: string };

export function useCarDirections(target: PlaceActionTarget | null, active: boolean, request = findCarRoute) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const latest = useRef({ target, active });
  latest.current = { target, active };
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const retryAt = useRef(0);
  const key = target ? `${target.placeId}:${target.latitude}:${target.longitude}` : '';

  const clear = useCallback(() => {
    generation.current += 1;
    pending.current?.abort();
    pending.current = null;
    setState({ status: 'idle' });
  }, []);

  const hasOrigin = isRouteCoordinate(target?.userLocation);
  useEffect(() => {
    clear();
    return () => { generation.current += 1; pending.current?.abort(); pending.current = null; };
  }, [key, active, hasOrigin, clear]);

  const load = useCallback(async () => {
    const { target: place, active: enabled } = latest.current;
    if (!enabled || !place || pending.current) return;
    const placeKey = `${place.placeId}:${place.latitude}:${place.longitude}`;
    const fail = (errorKey: string) => setState({ status: 'error', errorKey, selectionKey: placeKey });
    if (Date.now() < retryAt.current) { fail('rateLimited'); return; }
    if (!isRouteCoordinate(place)) { fail('destinationMissing'); return; }
    if (!isRouteCoordinate(place.userLocation)) { fail('originMissing'); return; }
    const controller = new AbortController();
    pending.current = controller;
    const id = ++generation.current;
    setState({ status: 'loading', selectionKey: placeKey });
    try {
      const route = await request({ origin: place.userLocation, destination: { latitude: place.latitude, longitude: place.longitude }, mode: 'car' }, controller.signal);
      const current = latest.current.target;
      if (!controller.signal.aborted && id === generation.current && latest.current.active && current
        && `${current.placeId}:${current.latitude}:${current.longitude}` === placeKey) {
        setState({ status: 'success', route, selectionKey: placeKey });
      }
    } catch (error) {
      const delay = routeRetryDelay(error);
      if (delay !== undefined) retryAt.current = Date.now() + delay;
      const current = latest.current.target;
      if (!controller.signal.aborted && id === generation.current && latest.current.active && current
        && `${current.placeId}:${current.latitude}:${current.longitude}` === placeKey) fail(routeErrorKey(error));
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }, [request]);

  // GPS updates do not refetch or move the camera; the route uses the origin at button press.
  return { state: active && state.selectionKey === key ? state : { status: 'idle' } as State, load, clear };
}
