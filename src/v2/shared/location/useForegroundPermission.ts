import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import {
  foregroundPermission, readForegroundPermission,
  type ForegroundPermissionAdapter, type ForegroundPermissionState,
} from './foregroundPermission';

export function useForegroundPermission(adapter: ForegroundPermissionAdapter = foregroundPermission) {
  const [state, setState] = useState<ForegroundPermissionState>('loading');
  const [settingsError, setSettingsError] = useState(false);
  const [openingSettings, setOpeningSettings] = useState(false);
  const mounted = useRef(false);
  const generation = useRef(0);
  const requestPending = useRef(false);
  const settingsPending = useRef(false);

  const refresh = useCallback(async (request = false) => {
    // Native permission dialogs can emit inactive → active before resolving.
    // Their authoritative response must not be replaced by an intervening read.
    if (!mounted.current || requestPending.current) return;
    if (request) requestPending.current = true;
    const current = ++generation.current;
    setState('loading');
    const next = await readForegroundPermission(adapter, request);
    if (request) requestPending.current = false;
    if (mounted.current && generation.current === current) setState(next);
  }, [adapter]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', next => {
      const returning = previous !== 'active' && next === 'active';
      previous = next;
      if (returning) void refresh();
    });
    return () => {
      mounted.current = false;
      generation.current += 1;
      subscription.remove();
    };
  }, [refresh]);

  const openSettings = useCallback(async () => {
    if (!mounted.current || settingsPending.current) return;
    settingsPending.current = true;
    setOpeningSettings(true);
    setSettingsError(false);
    try { await Linking.openSettings(); }
    catch { if (mounted.current) setSettingsError(true); }
    finally {
      settingsPending.current = false;
      if (mounted.current) setOpeningSettings(false);
    }
  }, []);

  return { state, settingsError, openingSettings, refresh, openSettings };
}
