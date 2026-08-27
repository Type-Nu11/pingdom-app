import { Animated, Easing } from 'react-native';

export const MOTION_DURATION = Object.freeze({
  press: 90,
  state: 180,
});

export const MOTION_EASING = Easing.out(Easing.cubic);

export type TimingMotionOptions = Readonly<{
  duration?: number;
  reduceMotion: boolean;
  useNativeDriver: boolean;
}>;

export function runTimingMotion(
  value: Animated.Value,
  toValue: number,
  {
    duration = MOTION_DURATION.state,
    reduceMotion,
    useNativeDriver,
  }: TimingMotionOptions,
) {
  value.stopAnimation();

  if (reduceMotion) {
    value.setValue(toValue);
    return null;
  }

  const animation = Animated.timing(value, {
    duration,
    easing: MOTION_EASING,
    toValue,
    useNativeDriver,
  });
  animation.start();
  return animation;
}
