import { findCarRoute, type CarRoute } from '../api/routesApi';
import type { RouteCooldown } from '../model/routeState';
import { useRouteQuery } from './useRouteQuery';

export function useCarRoute(selectionKey: string, cooldown?: RouteCooldown) {
  const session = useRouteQuery<CarRoute>(selectionKey, cooldown);
  return {
    state: session.state,
    request: (origin: unknown, destination: unknown) => session.request(signal => findCarRoute(origin, destination, signal)),
    cancel: session.cancel,
  };
}
