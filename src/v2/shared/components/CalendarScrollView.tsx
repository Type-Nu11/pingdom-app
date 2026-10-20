import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { CalendarDragScrollLockContext } from '../hooks/useCalendarDragSelection';

/** Freeze native scrolling as soon as a nested calendar recognises a long press. */
const CalendarScrollView = forwardRef<ScrollView, ScrollViewProps>(function CalendarScrollView({
  scrollEnabled = true, children, ...props
}, forwardedRef) {
  const nativeRef = useRef<ScrollView | null>(null);
  const [locked, setLocked] = useState(false);
  const allowed = useRef(scrollEnabled);
  allowed.current = scrollEnabled;
  const lock = useCallback((next: boolean) => {
    // Updating the native prop immediately prevents Android's ScrollView from
    // intercepting the first vertical movement before React commits the state.
    nativeRef.current?.setNativeProps({ scrollEnabled: !next && allowed.current });
    setLocked(next);
  }, []);
  const ref = useCallback((node: ScrollView | null) => {
    nativeRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);
  return <CalendarDragScrollLockContext.Provider value={lock}>
    <ScrollView {...props} ref={ref} scrollEnabled={scrollEnabled && !locked}
      canCancelContentTouches={locked ? false : props.canCancelContentTouches}>
      {children}
    </ScrollView>
  </CalendarDragScrollLockContext.Provider>;
});

export default CalendarScrollView;
