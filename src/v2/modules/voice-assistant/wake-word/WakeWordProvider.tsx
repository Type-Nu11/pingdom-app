import React, { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWakeWordController, unavailableWakeWordAdapter, type WakeWordAdapter } from './wakeWord';

const fallbackController = createWakeWordController(unavailableWakeWordAdapter, () => {});
const PREFERENCE_KEY = 'pingdom.v2.wake-word.enabled';
const WakeWordContext = createContext({
  adapter: unavailableWakeWordAdapter,
  controller: fallbackController,
  enable: fallbackController.enable,
  disable: fallbackController.disable,
  registerDetection: (_listener: () => void): (() => void) => () => {},
});
/** Persist explicit opt-in across restarts; native capture remains map/foreground-scoped. */
export function WakeWordProvider({ adapter = unavailableWakeWordAdapter, children }: PropsWithChildren<{ adapter?: WakeWordAdapter }>) {
  const detection = useRef<(() => void) | null>(null);
  const [preference, setPreference] = useState<boolean | null>(null);
  const selectionRevision = useRef(0);
  const pendingWrite = useRef(Promise.resolve());
  const controller = useMemo(() => createWakeWordController(adapter, () => detection.current?.()), [adapter]);
  useEffect(() => {
    let active = true;
    const revision = selectionRevision.current;
    void AsyncStorage.getItem(PREFERENCE_KEY).then(value => {
      if (active && revision === selectionRevision.current) setPreference(value === 'true');
    }).catch(() => {
      if (active && revision === selectionRevision.current) setPreference(false);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    // A temporarily unavailable adapter during native startup must not erase opt-in.
    if (preference === true) void controller.enable();
  }, [controller, preference]);
  const persist = useCallback((enabled: boolean) => {
    selectionRevision.current++;
    setPreference(enabled);
    pendingWrite.current = pendingWrite.current.then(() => AsyncStorage.setItem(PREFERENCE_KEY, String(enabled)))
      .catch(() => { console.warn('[WakeWord] Failed to persist preference.'); });
    return pendingWrite.current;
  }, []);
  const enable = useCallback(async () => {
    const saved = persist(true);
    await controller.enable();
    await saved;
  }, [controller, persist]);
  const disable = useCallback(async () => {
    const saved = persist(false);
    await controller.disable();
    await saved;
  }, [controller, persist]);
  const registerDetection = useCallback((listener: () => void) => {
    detection.current = listener;
    return () => { if (detection.current === listener) detection.current = null; };
  }, []);
  useEffect(() => () => { void controller.disable(); }, [controller]);
  const value = useMemo(() => ({ adapter, controller, registerDetection, enable, disable }), [adapter, controller, registerDetection, enable, disable]);
  return <WakeWordContext.Provider value={value}>{children}</WakeWordContext.Provider>;
}
export const useWakeWordRuntime = () => useContext(WakeWordContext);
export function useWakeWordSettings() {
  const { adapter, controller, enable, disable } = useWakeWordRuntime();
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return { state, available: adapter.available, enable, disable };
}
