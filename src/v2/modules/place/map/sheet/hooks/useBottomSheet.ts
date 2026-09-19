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
export const shouldClaimVerticalDrag = (gesture: { dx: number; dy: number }) => (
  Math.abs(gesture.dy) > VERTICAL_DRAG_THRESHOLD && Math.abs(gesture.dy) > Math.abs(gesture.dx)
);

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
          stiffness: 240,
          toValue: nextValue,
          useNativeDriver: true,
        }),
        Animated.spring(sheetChromeBottom, {
          damping: 26,
          mass: 0.82,
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
      const values = snapValuesRef.current;
      const currentValue = Math.min(
        Math.max(sheetOffsetY.current + gesture.dy, values.expanded),
        values.collapsed,
      );

      if (gesture.vy < -0.45) {
        const currentIndex = SNAP_ORDER.indexOf(snapPointRef.current);
        snapTo(SNAP_ORDER[Math.max(0, currentIndex - 1)]);
        return;
      }

      if (gesture.vy > 0.45) {
        const currentIndex = SNAP_ORDER.indexOf(snapPointRef.current);
        snapTo(SNAP_ORDER[Math.min(SNAP_ORDER.length - 1, currentIndex + 1)]);
        return;
      }

      const nearest = SNAP_ORDER.reduce((best, candidate) => (
        Math.abs(values[candidate] - currentValue) < Math.abs(values[best] - currentValue)
          ? candidate
          : best
      ), snapPointRef.current);

      snapTo(nearest);
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
