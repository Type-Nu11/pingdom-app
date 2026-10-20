import { useEffect, useMemo, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { createLocalWakeWordAdapter } from './localWakeWordAdapter';
import { createSherpaWakeWordRuntime, isSherpaWakeWordReady, type SherpaWakeWordNative } from './sherpaWakeWordRuntime';
import { unavailableWakeWordAdapter } from './wakeWord';

const bridge = NativeModules.PingdomWakeWord;
const native = (Platform.OS === 'android' || Platform.OS === 'ios') && typeof bridge?.getStatus === 'function'
  ? bridge as SherpaWakeWordNative : undefined;

export function useSherpaWakeWordAdapter(enabled = true) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    setReady(false);
    if (enabled && native) {
      // Verifies packaged model hashes and initializes KWS with synthetic silence.
      // This does not request microphone permission or start capture.
      void Promise.resolve().then(() => native.getStatus()).then(status => { if (active) setReady(isSherpaWakeWordReady(status)); })
        .catch(() => { if (active) setReady(false); });
    }
    return () => { active = false; };
  }, [enabled]);
  return useMemo(() => {
    if (!enabled || !ready || !native) return unavailableWakeWordAdapter;
    const events = new NativeEventEmitter(NativeModules.PingdomWakeWord);
    return createLocalWakeWordAdapter(createSherpaWakeWordRuntime(native, events, async () => {
      let permission = await getRecordingPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) permission = await requestRecordingPermissionsAsync();
      if (permission.granted) return 'granted';
      if (!permission.canAskAgain) return 'blocked';
      return permission.status === 'undetermined' ? 'undetermined' : 'denied';
    }, true));
  }, [enabled, ready]);
}
