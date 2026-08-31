import { useEffect } from 'react';
import { Animated, Easing } from 'react-native';

const PULSE_DURATION_MS = 750;

/**
 * One driver shared by every skeleton on screen. Each skeleton starting its own
 * loop would run N animations for what reads as a single pulse, and they would
 * drift out of step with each other as they mount at different times.
 */
const pulseValue = new Animated.Value(0);
const pulseOpacity = pulseValue.interpolate({
  inputRange: [0, 1],
  outputRange: [0.45, 1],
});

let subscriberCount = 0;
let animation: Animated.CompositeAnimation | null = null;

function startPulse() {
  animation = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseValue, {
        duration: PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(pulseValue, {
        duration: PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]),
  );

  animation.start();
}

function stopPulse() {
  animation?.stop();
  animation = null;
  pulseValue.setValue(0);
}

export function useSharedPulse(): Animated.AnimatedInterpolation<number> {
  useEffect(() => {
    subscriberCount += 1;
    if (subscriberCount === 1) {
      startPulse();
    }

    return () => {
      subscriberCount -= 1;
      if (subscriberCount === 0) {
        stopPulse();
      }
    };
  }, []);

  return pulseOpacity;
}

export default useSharedPulse;
