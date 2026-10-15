import React, { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createWakeWordController, unavailableWakeWordAdapter, type WakeWordAdapter } from './wakeWord';

const fallbackController = createWakeWordController(unavailableWakeWordAdapter, () => {});
const WakeWordContext = createContext({
  adapter: unavailableWakeWordAdapter,
  controller: fallbackController,
  registerDetection: (_listener: () => void): (() => void) => () => {},
});
/** App-owned session preference survives map/settings navigation; capture stays map-scoped. */
export function WakeWordProvider({ adapter = unavailableWakeWordAdapter, children }: PropsWithChildren<{ adapter?: WakeWordAdapter }>) {
  const detection = useRef<(() => void) | null>(null);
  const controller = useMemo(() => createWakeWordController(adapter, () => detection.current?.()), [adapter]);
  const registerDetection = useCallback((listener: () => void) => {
    detection.current = listener;
    return () => { if (detection.current === listener) detection.current = null; };
  }, []);
  useEffect(() => () => { void controller.disable(); }, [controller]);
  const value = useMemo(() => ({ adapter, controller, registerDetection }), [adapter, controller, registerDetection]);
  return <WakeWordContext.Provider value={value}>{children}</WakeWordContext.Provider>;
}
export const useWakeWordRuntime = () => useContext(WakeWordContext);
export function useWakeWordSettings() {
  const { adapter, controller } = useWakeWordRuntime();
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { state, available: adapter.available, enable: controller.enable, disable: controller.disable };
}
