import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { cancelAnimation, runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

export type BottomSheetSnapPoint = 'collapsed' | 'medium' | 'expanded';

type UseBottomSheetParams = {
  collapsedTranslateY: number;
  expandedTranslateY?: number;
  initialSnapPoint?: BottomSheetSnapPoint;
  mediumTranslateY: number;
  uiThreadMotion?: boolean;
};

const SNAP_ORDER: BottomSheetSnapPoint[] = ['expanded', 'medium', 'collapsed'];
// Preserve button presses while a finger moves slightly inside the touch target.
const VERTICAL_DRAG_THRESHOLD = 8;
// A drag must be clearly vertical so horizontal carousels keep their swipes.
const DIRECTION_LOCK_RATIO = 1.2;
// Keep a deliberate downward gesture, without requiring a long drag to tuck the sheet away.
const COLLAPSE_FLICK_MIN_DISTANCE = 32;
const COLLAPSE_FLICK_MIN_VELOCITY = 0.35;
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
  uiThreadMotion = false,
}: UseBottomSheetParams) => {
  const snapValues = useMemo(() => ({
    collapsed: collapsedTranslateY,
    expanded: expandedTranslateY,
    medium: mediumTranslateY,
  }), [collapsedTranslateY, expandedTranslateY, mediumTranslateY]);
  const snapValuesRef = useRef(snapValues);
  snapValuesRef.current = snapValues;

  const sheetTranslateY = useRef(new Animated.Value(snapValues[initialSnapPoint])).current;
  const position = useSharedValue(snapValues[initialSnapPoint]);
  useLayoutEffect(() => () => cancelAnimation(position), [position]);
  // Standalone sheets retain their legacy Animated contract. MapScreen uses one
  // UI shared value for both translation and clipping, with no parallel JS spring.
  const sheetChromeBottom = sheetTranslateY;
  const sheetOffsetY = useRef(snapValues[initialSnapPoint]);
  const snapPointRef = useRef<BottomSheetSnapPoint>(initialSnapPoint);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(initialSnapPoint);
  const [presentedSnapPoint, setPresentedSnapPoint] = useState<BottomSheetSnapPoint>(initialSnapPoint);
  const animationRevision = useRef(0);
  const commitPresentation = useCallback((next: BottomSheetSnapPoint, revision: number) => {
    if (animationRevision.current === revision) setPresentedSnapPoint(next);
  }, []);

  const appliedTarget = useRef(snapValues[initialSnapPoint]);
  const pendingSnap = useRef(false);
  const [snapRequest, setSnapRequest] = useState(0);

  const snapTo = (nextSnapPoint: BottomSheetSnapPoint) => {
    snapPointRef.current = nextSnapPoint;
    setSnapPoint(nextSnapPoint);
    if (!uiThreadMotion) setPresentedSnapPoint(nextSnapPoint);
    // Content changes in the same event can change the destination coordinates.
    // Start only after that render commits, using its updated snap values.
    pendingSnap.current = true;
    setSnapRequest((request) => request + 1);
  };

  const jumpTo = (nextSnapPoint: BottomSheetSnapPoint) => {
    pendingSnap.current = false;
    animationRevision.current += 1;
    const nextValue = snapValuesRef.current[nextSnapPoint];

    sheetTranslateY.stopAnimation();
    cancelAnimation(position);
    position.value = nextValue;
    sheetOffsetY.current = nextValue;
    appliedTarget.current = nextValue;
    snapPointRef.current = nextSnapPoint;
    setSnapPoint(nextSnapPoint);
    setPresentedSnapPoint(nextSnapPoint);
    sheetTranslateY.setValue(nextValue);
  };

  useLayoutEffect(() => {
    const nextValue = snapValues[snapPointRef.current];
    // Measuring another snap point must not interrupt the current gesture/spring.
    if (!pendingSnap.current && appliedTarget.current === nextValue) return;
    appliedTarget.current = nextValue;
    sheetOffsetY.current = nextValue;
    if (pendingSnap.current) {
      pendingSnap.current = false;
      if (uiThreadMotion) {
        const next = snapPointRef.current;
        const revision = ++animationRevision.current;
        position.value = withSpring(nextValue, {
          damping: 26, mass: 0.82, stiffness: 240, overshootClamping: true, energyThreshold: 0.000001,
        }, finished => {
          if (finished) runOnJS(commitPresentation)(next, revision);
        });
        // Legacy consumers receive the settled target, never a per-frame JS update.
        sheetTranslateY.setValue(nextValue);
        return;
      }
      Animated.spring(sheetTranslateY, {
        damping: 26,
        mass: 0.82,
        overshootClamping: true,
        velocity: 0,
        stiffness: 240,
        toValue: nextValue,
        useNativeDriver: false,
      }).start();
      return;
    }
    sheetTranslateY.setValue(nextValue);
    position.value = nextValue;
    if (uiThreadMotion) {
      animationRevision.current += 1;
      setPresentedSnapPoint(snapPointRef.current);
    }
  }, [commitPresentation, position, sheetChromeBottom, sheetTranslateY, snapRequest, snapValues, uiThreadMotion]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => shouldClaimVerticalDrag(gesture),
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldClaimVerticalDrag(gesture),
    onPanResponderGrant: () => {
      if (uiThreadMotion) {
        animationRevision.current += 1;
        cancelAnimation(position);
        sheetOffsetY.current = position.value;
        return;
      }
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

      if (uiThreadMotion) position.value = nextValue;
      else sheetTranslateY.setValue(nextValue);
    },
    onPanResponderRelease: (_, gesture) => {
      snapTo(resolveReleaseSnapPoint(snapPointRef.current, snapValuesRef.current, sheetOffsetY.current, gesture));
    },
    // Once a vertical sheet drag starts, a nested/parent scroll must not snap it
    // back mid-gesture by taking over the responder.
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => snapTo(snapPointRef.current),
  // PanResponder intentionally reads changing values through refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [position, sheetChromeBottom, sheetTranslateY, uiThreadMotion]);

  const toggleSheet = () => {
    snapTo(snapPointRef.current === 'collapsed' ? 'medium' : 'collapsed');
  };

  return {
    isExpanded: snapPoint === 'expanded',
    jumpTo,
    panHandlers: panResponder.panHandlers,
    sheetChromeBottom,
    sheetTranslateY,
    uiPosition: position,
    snapPoint,
    presentedSnapPoint,
    snapTo,
    toggleSheet,
  };
};

export default useBottomSheet;
