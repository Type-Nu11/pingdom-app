import { useEffect, useMemo, useState } from 'react';
import { findCarRoute } from '../api/routesApi';
import { createRouteSession, type RouteState } from '../model/routeState';

export function useCarRoute(selectionKey: string) {
  const [result, setResult] = useState<{ id: symbol; state: RouteState } | null>(null);
  const session = useMemo(() => {
    const id = Symbol(selectionKey);
    return { id, ...createRouteSession(state => setResult({ id, state })) };
  }, [selectionKey]);
  useEffect(() => session.dispose, [session]);
  return {
    state: result?.id === session.id ? result.state : { kind: 'idle' } as RouteState,
    request: (origin: unknown, destination: unknown) => session.request(signal => findCarRoute(origin, destination, signal)),
    cancel: session.cancel,
  };
}
