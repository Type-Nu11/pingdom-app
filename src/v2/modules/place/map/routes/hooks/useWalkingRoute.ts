import { findWalkingRoute, type WalkingRoute } from '../api/walkingRoutesApi';
import type { RouteCooldown } from '../model/routeState';
import { useRouteQuery } from './useRouteQuery';

export function useWalkingRoute(selectionKey: string, cooldown?: RouteCooldown) {
  const session = useRouteQuery<WalkingRoute>(selectionKey, cooldown);
  return { state: session.state, cancel: session.cancel,
    request: (origin: unknown, destination: unknown) => session.request(signal => findWalkingRoute(origin, destination, signal)) };
}
