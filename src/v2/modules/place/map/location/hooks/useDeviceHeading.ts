import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { watchHeadingAsync, type LocationSubscription } from 'expo-location';

/** Compass updates are independent of GPS movement and stop with the visible map. */
export function useDeviceHeading(enabled: boolean) {
  const [heading, setHeading] = useState<number>();
  useEffect(() => {
    let generation = 0;
    let active = false;
    let subscription: LocationSubscription | undefined;
    const stop = () => { generation += 1; subscription?.remove(); subscription = undefined; };
    const sync = () => {
      const next = enabled && AppState.currentState === 'active';
      if (next === active) return;
      active = next;
      stop();
      if (!active) return;
      const current = generation;
      void (async () => {
        try {
          const watch = await watchHeadingAsync(value => {
            if (current !== generation) return;
            const degrees = Number.isFinite(value.trueHeading) && value.trueHeading >= 0 ? value.trueHeading : value.magHeading;
            if (!Number.isFinite(degrees) || degrees < 0) return;
            const normalized = degrees % 360;
            setHeading(previous => {
              const delta = previous === undefined ? 360 : Math.abs(previous - normalized);
              return Math.min(delta, 360 - delta) < 2 && previous !== undefined ? previous : normalized;
            });
          });
          if (current !== generation) watch.remove();
          else subscription = watch;
        } catch { /* Devices without a compass still display the location marker. */ }
      })();
    };
    sync();
    const listener = AppState.addEventListener('change', sync);
    return () => { stop(); listener.remove(); };
  }, [enabled]);
  return heading;
}
