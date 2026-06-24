import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';

type UseBottomSheetParams = {
  collapsedTranslateY: number;
};

export const useBottomSheet = ({ collapsedTranslateY }: UseBottomSheetParams) => {
  const sheetTranslateY = useRef(new Animated.Value(collapsedTranslateY)).current;
  const sheetOffsetY = useRef(collapsedTranslateY);
  const sheetExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const snapSheet = (expanded: boolean) => {
    const nextValue = expanded ? 0 : collapsedTranslateY;

    sheetOffsetY.current = nextValue;
    sheetExpandedRef.current = expanded;
    setIsExpanded(expanded);

    Animated.spring(sheetTranslateY, {
      toValue: nextValue,
      damping: 24,
      stiffness: 230,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const nextValue = sheetExpandedRef.current ? 0 : collapsedTranslateY;

    sheetOffsetY.current = nextValue;
    sheetTranslateY.setValue(nextValue);
  }, [collapsedTranslateY, sheetTranslateY]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dy) > 3 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => {
      sheetTranslateY.stopAnimation((value) => {
        sheetOffsetY.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const nextValue = Math.min(Math.max(sheetOffsetY.current + gesture.dy, 0), collapsedTranslateY);

      sheetTranslateY.setValue(nextValue);
    },
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dy) < 3 && Math.abs(gesture.dx) < 3) {
        snapSheet(!sheetExpandedRef.current);
        return;
      }

      const currentValue = sheetOffsetY.current + gesture.dy;
      const shouldExpand =
        gesture.vy < -0.35 ||
        (gesture.vy <= 0.35 && currentValue < collapsedTranslateY / 2);

      snapSheet(shouldExpand);
    },
    onPanResponderTerminate: () => {
      snapSheet(sheetExpandedRef.current);
    },
  });

  return {
    isExpanded,
    panHandlers: panResponder.panHandlers,
    sheetTranslateY,
    snapSheet,
    toggleSheet: () => snapSheet(!sheetExpandedRef.current),
  };
};

export default useBottomSheet;
