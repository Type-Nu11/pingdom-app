import { useRef } from 'react';
import type { GestureResponderEvent, GestureResponderHandlers } from 'react-native';

type Feed = 'local' | 'national';
const CLAIM_DISTANCE = 12;
const SWITCH_DISTANCE = 48;

/** Own horizontal swipes only; nested horizontal lists explicitly opt out. */
export function useMapFeedSwipe(feed: Feed, onChange: (feed: Feed) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const blocked = useRef(false);
  const delta = ({ nativeEvent }: GestureResponderEvent) => ({
    x: nativeEvent.pageX - (start.current?.x ?? nativeEvent.pageX),
    y: nativeEvent.pageY - (start.current?.y ?? nativeEvent.pageY),
  });
  const panHandlers: GestureResponderHandlers = {
    onStartShouldSetResponderCapture: ({ nativeEvent }) => {
      start.current = { x: nativeEvent.pageX, y: nativeEvent.pageY };
      blocked.current = nativeEvent.touches.length !== 1;
      return false;
    },
    onMoveShouldSetResponderCapture: (event) => {
      const { x, y } = delta(event);
      if (event.nativeEvent.touches.length !== 1 || Math.abs(y) > Math.max(CLAIM_DISTANCE, Math.abs(x))) {
        blocked.current = true;
      }
      return !blocked.current && start.current !== null
        && Math.abs(x) > CLAIM_DISTANCE && Math.abs(x) > Math.abs(y) * 1.5;
    },
    onResponderRelease: (event) => {
      const { x, y } = delta(event);
      const shouldSwitch = !blocked.current && start.current !== null
        && Math.abs(x) >= SWITCH_DISTANCE && Math.abs(x) > Math.abs(y) * 1.5;
      start.current = null;
      if (!shouldSwitch) return;
      const next = x > 0 ? 'national' : 'local';
      if (next !== feed) onChange(next);
    },
    onResponderTerminationRequest: () => true,
    onResponderTerminate: () => { start.current = null; },
  };
  return { panHandlers, blockHorizontalSwipe: () => { blocked.current = true; } };
}
