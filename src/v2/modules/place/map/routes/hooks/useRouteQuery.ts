import { useEffect, useMemo, useRef, useState } from 'react';
import { createRouteSession, type RouteCooldown, type RouteState } from '../model/routeState';

/** A selection owns its request; only rate-limit metadata survives selection changes. */
export function useRouteQuery<T>(selectionKey: string, cooldown?: RouteCooldown) {
  const localCooldown = useRef<RouteCooldown>({ retryAt: 0 });
  const sharedCooldown = cooldown ?? localCooldown.current;
  const [result, setResult] = useState<{ id: symbol; state: RouteState<T> } | null>(null);
  const session = useMemo(() => {
    const id = Symbol(selectionKey);
    return { id, ...createRouteSession<T>(state => setResult({ id, state }), sharedCooldown) };
  }, [selectionKey, sharedCooldown]);
  useEffect(() => session.dispose, [session]);
  return { state: result?.id === session.id ? result.state : { kind: 'idle' } as RouteState<T>,
    request: session.request, cancel: session.cancel };
}
