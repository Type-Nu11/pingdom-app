import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';

export type BottomSheetSnapPoint = 'collapsed' | 'medium' | 'expanded';

type UseBottomSheetParams = {
  collapsedTranslateY: number;
  expandedTranslateY?: number;
  initialSnapPoint?: BottomSheetSnapPoint;
  mediumTranslateY: number;
};

const SNAP_ORDER: BottomSheetSnapPoint[] = ['expanded', 'medium', 'collapsed'];
// Preserve button presses while a finger moves slightly inside the touch target.
const VERTICAL_DRAG_THRESHOLD = 8;
// A drag must be clearly vertical so horizontal carousels keep their swipes.
const DIRECTION_LOCK_RATIO = 1.2;
// Collapsing hides the sheet behind the navigation, so it keeps a deliberate 48dp flick.
const COLLAPSE_FLICK_MIN_DISTANCE = 48;
const COLLAPSE_FLICK_MIN_VELOCITY = 0.45;
// Raising the sheet (or lowering it from expanded) should follow a short, quick swipe.
const SNAP_FLICK_MIN_DISTANCE = 16;
const SNAP_FLICK_MIN_VELOCITY = 0.3;
// A slow drag past this share of the gap to the next snap point still moves there.
const SNAP_DRAG_RATIO = 0.2;
export const shouldClaimVerticalDrag = (gesture: { dx: number; dy: number }) => (
  Math.abs(gesture.dy) > VERTICAL_DRAG_THRESHOLD
  && Math.abs(gesture.dy) > Math.abs(gesture.dx) * DIRECTION_LOCK_RATIO
);

/** Picks the snap point after a release; exported so the thresholds stay testable. */
export const resolveReleaseSnapPoint = (
  from: BottomSheetSnapPoint,
  values: Record<BottomSheetSnapPoint, number>,
  startValue: number,
  gesture: { dy: number; vy: number },
): BottomSheetSnapPoint => {
  const currentValue = Math.min(Math.max(startValue + gesture.dy, values.expanded), values.collapsed);
  const nearest = SNAP_ORDER.reduce((best, candidate) => (
    Math.abs(values[candidate] - currentValue) < Math.abs(values[best] - currentValue) ? candidate : best
  ), from);
  if (gesture.dy === 0) return nearest;

  const raising = gesture.dy < 0;
  const index = SNAP_ORDER.indexOf(from);
  const neighbor = SNAP_ORDER[raising ? Math.max(0, index - 1) : Math.min(SNAP_ORDER.length - 1, index + 1)];
  if (neighbor === from) return nearest;
  // Past the neighbour the finger is already closer to another snap point.
  const passedNeighbor = raising ? currentValue < values[neighbor] : currentValue > values[neighbor];
  if (passedNeighbor) return nearest;

  const collapsing = neighbor === 'collapsed';
  const minDistance = collapsing ? COLLAPSE_FLICK_MIN_DISTANCE : SNAP_FLICK_MIN_DISTANCE;
  const minVelocity = collapsing ? COLLAPSE_FLICK_MIN_VELOCITY : SNAP_FLICK_MIN_VELOCITY;
  const distance = Math.abs(gesture.dy);
  const flicked = distance >= minDistance && (raising ? gesture.vy <= -minVelocity : gesture.vy >= minVelocity);
  const draggedFar = distance >= Math.max(minDistance, Math.abs(values[neighbor] - values[from]) * SNAP_DRAG_RATIO);
  return flicked || draggedFar ? neighbor : nearest;
};

export const useBottomSheet = ({
  collapsedTranslateY,
  expandedTranslateY = 0,
  initialSnapPoint = 'medium',
  mediumTranslateY,
}: UseBottomSheetParams) => {
  const snapValues = useMemo(() => ({
    collapsed: collapsedTranslateY,
    expanded: expandedTranslateY,
    medium: mediumTranslateY,
  }), [collapsedTranslateY, expandedTranslateY, mediumTranslateY]);
  const snapValuesRef = useRef(snapValues);
  snapValuesRef.current = snapValues;

  const sheetTranslateY = useRef(new Animated.Value(snapValues[initialSnapPoint])).current;
  const sheetChromeBottom = useRef(new Animated.Value(snapValues[initialSnapPoint])).current;
  const sheetOffsetY = useRef(snapValues[initialSnapPoint]);
  const snapPointRef = useRef<BottomSheetSnapPoint>(initialSnapPoint);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(initialSnapPoint);

  const pendingSnap = useRef(false);
  const [snapRequest, setSnapRequest] = useState(0);

  const snapTo = (nextSnapPoint: BottomSheetSnapPoint) => {
    snapPointRef.current = nextSnapPoint;
    setSnapPoint(nextSnapPoint);
    // Content changes in the same event can change the destination coordinates.
    // Start only after that render commits, using its updated snap values.
    pendingSnap.current = true;
    setSnapRequest((request) => request + 1);
  };

  const jumpTo = (nextSnapPoint: BottomSheetSnapPoint) => {
    pendingSnap.current = false;
    const nextValue = snapValuesRef.current[nextSnapPoint];

    sheetChromeBottom.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetOffsetY.current = nextValue;
    snapPointRef.current = nextSnapPoint;
    setSnapPoint(nextSnapPoint);
    sheetTranslateY.setValue(nextValue);
    sheetChromeBottom.setValue(nextValue);
  };

  useEffect(() => {
    const nextValue = snapValues[snapPointRef.current];

    sheetOffsetY.current = nextValue;
    if (pendingSnap.current) {
      pendingSnap.current = false;
      Animated.parallel([
        Animated.spring(sheetTranslateY, {
          damping: 26,
          mass: 0.82,
          overshootClamping: true,
          stiffness: 240,
          toValue: nextValue,
          useNativeDriver: true,
        }),
        Animated.spring(sheetChromeBottom, {
          damping: 26,
          mass: 0.82,
          overshootClamping: true,
          stiffness: 240,
          toValue: nextValue,
          useNativeDriver: false,
        }),
      ]).start();
      return;
    }
    sheetTranslateY.setValue(nextValue);
    sheetChromeBottom.setValue(nextValue);
  }, [sheetChromeBottom, sheetTranslateY, snapRequest, snapValues]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => shouldClaimVerticalDrag(gesture),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldClaimVerticalDrag(gesture),
    onPanResponderGrant: () => {
      sheetChromeBottom.stopAnimation();
      sheetTranslateY.stopAnimation((value) => {
        sheetOffsetY.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const values = snapValuesRef.current;
      const nextValue = Math.min(
        Math.max(sheetOffsetY.current + gesture.dy, values.expanded),
        values.collapsed,
      );

      sheetTranslateY.setValue(nextValue);
      sheetChromeBottom.setValue(nextValue);
    },
    onPanResponderRelease: (_, gesture) => {
      snapTo(resolveReleaseSnapPoint(snapPointRef.current, snapValuesRef.current, sheetOffsetY.current, gesture));
    },
    onPanResponderTerminate: () => snapTo(snapPointRef.current),
  // PanResponder intentionally reads changing values through refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [sheetChromeBottom, sheetTranslateY]);

  const toggleSheet = () => {
    snapTo(snapPointRef.current === 'collapsed' ? 'medium' : 'collapsed');
  };

  return {
    isExpanded: snapPoint === 'expanded',
    jumpTo,
    panHandlers: panResponder.panHandlers,
    sheetChromeBottom,
    sheetTranslateY,
    snapPoint,
    snapTo,
    toggleSheet,
  };
};

export default useBottomSheet;
