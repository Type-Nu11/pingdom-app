import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { GestureResponderEvent, View } from 'react-native';

export const CalendarDragScrollLockContext = createContext<(locked: boolean) => void>(() => {});

type Range<D extends string> = { startDate: D; endDate: D };
type Cell = { node: View; disabled: boolean };
type Bounds = { x: number; y: number; width: number; height: number };

/** Use root coordinates, matching nativeEvent.pageX/pageY even with Android status-bar insets. */
export function useCalendarDragSelection<D extends string>({ onPress, onCommit }: {
  onPress: (date: D) => void;
  onCommit: (range: Range<D>, endpoint: D) => void;
}) {
  const setScrollLocked = useContext(CalendarDragScrollLockContext);
  const cells = useRef(new Map<D, Cell>());
  const bounds = useRef(new Map<D, Bounds>());
  const active = useRef<{ anchor: D; end: D } | null>(null);
  const suppressPress = useRef(false);
  useEffect(() => () => {
    if (active.current) setScrollLocked(false);
    active.current = null;
  }, [setScrollLocked]);
  const [endpoint, setEndpoint] = useState<D | null>(null);
  const [preview, setPreview] = useState<Range<D> | null>(null);
  const ordered = (anchor: D, end: D): Range<D> => anchor <= end
    ? { startDate: anchor, endDate: end } : { startDate: end, endDate: anchor };

  const move = (event: GestureResponderEvent) => {
    const current = active.current;
    if (!current) return;
    const { pageX, pageY } = event.nativeEvent;
    for (const [date, box] of bounds.current) {
      if (cells.current.get(date)?.disabled) continue;
      if (pageX >= box.x && pageX < box.x + box.width
        && pageY >= box.y && pageY < box.y + box.height) {
        if (current.end !== date) {
          current.end = date;
          setEndpoint(date);
          setPreview(ordered(current.anchor, date));
        }
        break;
      }
    }
  };
  const finish = (event: GestureResponderEvent) => {
    move(event);
    const current = active.current;
    active.current = null;
    setPreview(null);
    setEndpoint(null);
    if (current) {
      setScrollLocked(false);
      onCommit(ordered(current.anchor, current.end), current.end);
    }
  };
  const cancel = () => {
    if (active.current) setScrollLocked(false);
    active.current = null; setPreview(null); setEndpoint(null);
  };
  return {
    preview,
    endpoint,
    gridHandlers: {
      onTouchStart: () => { if (!active.current) suppressPress.current = false; },
      onMoveShouldSetResponderCapture: () => active.current !== null,
      onResponderTerminationRequest: () => active.current === null,
      onTouchMove: move,
      onResponderMove: move,
      onTouchEnd: finish,
      onResponderRelease: finish,
      onResponderTerminate: cancel,
      onTouchCancel: cancel,
    },
    dayProps: (date: D, disabled = false) => ({
      ref: (node: View | null) => {
        if (node) cells.current.set(date, { node, disabled });
        else cells.current.delete(date);
      },
      delayLongPress: 250,
      onLongPress: () => {
        if (disabled) return;
        const gesture = { anchor: date, end: date };
        active.current = gesture;
        setScrollLocked(true);
        suppressPress.current = true;
        bounds.current.clear();
        setPreview(ordered(date, date));
        setEndpoint(date);
        cells.current.forEach(({ node }, key) => {
          node.measure((_left, _top, width, height, x, y) => {
            if (active.current === gesture) bounds.current.set(key, { x, y, width, height });
          });
        });
      },
      onPress: () => { if (!disabled && !suppressPress.current) onPress(date); },
    }),
  };
}
