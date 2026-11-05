import { useMemo, useRef } from 'react';
import type {
  GestureResponderEvent,
  GestureResponderHandlers,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

import { shouldClaimVerticalDrag } from './useBottomSheet';

/** Let a downward pull that starts at the top lower the existing sheet. */
export const useSheetScrollHandoff = (sheetPanHandlers: GestureResponderHandlers) => {
  const scrollOffset = useRef(0);
  const gesture = useRef({ blocked: true, x: 0, y: 0 });

  return useMemo(() => {
    const shouldHandoff = (event: GestureResponderEvent) => {
      const start = gesture.current;
      if (start.blocked) return false;
      if (event.nativeEvent.touches.length !== 1 || scrollOffset.current > 1) {
        start.blocked = true;
        return false;
      }
      const dx = event.nativeEvent.pageX - start.x;
      const dy = event.nativeEvent.pageY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= 8) return false;
      // Once the user starts scrolling up or sideways, keep that gesture there.
      if (dy <= 0 || !shouldClaimVerticalDrag({ dx, dy })) {
        start.blocked = true;
        return false;
      }
      return true;
    };

    return {
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffset.current = Math.max(0, event.nativeEvent.contentOffset.y);
      },
      panHandlers: {
        ...sheetPanHandlers,
        onStartShouldSetResponderCapture: (event: GestureResponderEvent) => {
          gesture.current = {
            blocked: scrollOffset.current > 1 || event.nativeEvent.touches.length !== 1,
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
          };
          // Initialise the existing PanResponder without taking button taps.
          sheetPanHandlers.onStartShouldSetResponderCapture?.(event);
          return false;
        },
        onMoveShouldSetResponderCapture: (event: GestureResponderEvent) => (
          shouldHandoff(event) && (sheetPanHandlers.onMoveShouldSetResponderCapture?.(event) ?? false)
        ),
        onMoveShouldSetResponder: (event: GestureResponderEvent) => (
          shouldHandoff(event) && (sheetPanHandlers.onMoveShouldSetResponder?.(event) ?? false)
        ),
      },
    };
  }, [sheetPanHandlers]);
};
