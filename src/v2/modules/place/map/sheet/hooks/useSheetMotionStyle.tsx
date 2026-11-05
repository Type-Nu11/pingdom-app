import React, { createContext, useContext } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import Reanimated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { MapSheetPageActivityContext } from './useMapSheetScrollToTop';

type SheetMotion = { position: SharedValue<number>; mediumTranslateY: number; height: number; expandedTranslateY?: number; restingTranslateY: number };
const SheetMotionContext = createContext<SheetMotion | null>(null);
export const SheetMotionProvider = SheetMotionContext.Provider;
export const useSheetMotion = () => useContext(SheetMotionContext);

// The RN Animated wrapper preserves standalone sheets' existing public contract.
// In the map composition the style is calculated on the UI thread instead.
export const SheetMotionView = Reanimated.createAnimatedComponent(Animated.View);

export function clampSheetValue(value: number, input: number[], output: number[]) {
  'worklet';
  return interpolate(value, input, output, 'clamp');
}

export function useSheetMotionStyle(factory: (position: number, medium: number, resting: number) => ViewStyle, fallback: object) {
  const motion = useSheetMotion();
  const position = motion?.position;
  const medium = motion?.mediumTranslateY ?? 0;
  const resting = motion?.restingTranslateY ?? 0;
  const active = useContext(MapSheetPageActivityContext);
  const style = useAnimatedStyle(() => position && active ? factory(position.value, medium, resting) : {});
  return motion ? style : fallback;
}

export function useExpandedSheetOpacity(opacity: Animated.AnimatedInterpolation<number>) {
  return useSheetMotionStyle((position, medium) => {
    'worklet';
    return { opacity: clampSheetValue(position, [Math.max(0, medium - 96), medium], [1, 0]) };
  }, { opacity });
}
