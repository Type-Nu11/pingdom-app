import { findTransitRoute, type TransitRoute } from '../api/transitRoutesApi';
import type { RouteCooldown } from '../model/routeState';
import { useRouteQuery } from './useRouteQuery';

export function useTransitRoute(selectionKey: string, cooldown: RouteCooldown) {
  const session = useRouteQuery<TransitRoute>(selectionKey, cooldown);
  return { state: session.state, cancel: session.cancel,
    request: (origin: unknown, destination: unknown) => session.request(signal => findTransitRoute(origin, destination, signal)) };
}
