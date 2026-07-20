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
  const sheetOffsetY = useRef(snapValues[initialSnapPoint]);
  const snapPointRef = useRef<BottomSheetSnapPoint>(initialSnapPoint);
  const [snapPoint, setSnapPoint] = useState<BottomSheetSnapPoint>(initialSnapPoint);

  const snapTo = (nextSnapPoint: BottomSheetSnapPoint) => {
    const nextValue = snapValuesRef.current[nextSnapPoint];

    sheetOffsetY.current = nextValue;
    snapPointRef.current = nextSnapPoint;
    setSnapPoint(nextSnapPoint);

    Animated.spring(sheetTranslateY, {
      damping: 26,
      mass: 0.82,
      stiffness: 240,
      toValue: nextValue,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const nextValue = snapValues[snapPointRef.current];

    sheetOffsetY.current = nextValue;
    sheetTranslateY.setValue(nextValue);
  }, [sheetTranslateY, snapValues]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dy) > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx)
    ),
    onPanResponderGrant: () => {
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
  }), [sheetTranslateY]);

  const toggleSheet = () => {
    snapTo(snapPointRef.current === 'collapsed' ? 'medium' : 'collapsed');
  };

  return {
    isExpanded: snapPoint === 'expanded',
    panHandlers: panResponder.panHandlers,
    sheetTranslateY,
    snapPoint,
    snapTo,
    toggleSheet,
  };
};

export default useBottomSheet;
