import { useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { createWakeWordController } from './wakeWord';
import { useWakeWordAdapter } from './WakeWordProvider';

export function useForegroundWakeWord(options: { enabled: boolean; focused: boolean; accountId: string | null; assistantBusy: boolean }, onDetected: () => void) {
  const adapter = useWakeWordAdapter();
  const callback = useRef(onDetected);
  const latest = useRef(options);
  callback.current = onDetected; latest.current = options;
  const controller = useMemo(() => createWakeWordController(adapter, () => callback.current()), [adapter]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const foreground = useRef(AppState.currentState === 'active');
  const sync = useCallback(() => {
    const current = latest.current;
    controller.setConditions({ foreground: foreground.current && current.enabled, focused: current.focused,
      accountId: current.accountId, assistantBusy: current.assistantBusy });
  }, [controller]);
  useLayoutEffect(() => {
    sync();
    if (!options.enabled) void controller.disable();
  }, [controller, options.enabled, options.focused, options.accountId, options.assistantBusy, sync]);
  useLayoutEffect(() => {
    foreground.current = AppState.currentState === 'active';
    sync();
    const change = AppState.addEventListener('change', status => { foreground.current = status === 'active'; sync(); });
    const blur = AppState.addEventListener('blur', () => { foreground.current = false; sync(); });
    const focus = AppState.addEventListener('focus', () => { foreground.current = AppState.currentState === 'active'; sync(); });
    return () => {
      change.remove(); blur.remove(); focus.remove();
      // Also supports React StrictMode's cleanup/setup replay on the same controller.
      foreground.current = false; sync(); void controller.disable();
    };
  }, [controller, sync]);
  return { state, available: adapter.available, enable: controller.enable, disable: controller.disable,
    prepareAssistant: controller.prepareAssistant };
}
