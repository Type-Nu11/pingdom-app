import { useEffect } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

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
let motionSubscription: ReturnType<typeof AccessibilityInfo.addEventListener> | null = null;
let generation = 0;

function startPulse() {
  animation = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseValue, {
        duration: PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
        isInteraction: false,
      }),
      Animated.timing(pulseValue, {
        duration: PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]),
  );

  animation.start();
}

function stopPulse() {
  animation?.stop();
  animation = null;
  pulseValue.setValue(1);
}

export function useSharedPulse(): Animated.AnimatedInterpolation<number> {
  useEffect(() => {
    subscriberCount += 1;
    if (subscriberCount === 1) {
      const currentGeneration = ++generation;
      let motionEventReceived = false;
      const updateMotion = (reduceMotion: boolean) => {
        if (generation !== currentGeneration || subscriberCount === 0) return;
        stopPulse();
        if (!reduceMotion) startPulse();
      };
      // Stay static until the OS preference is known, including on slow bridges.
      pulseValue.setValue(1);
      motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        motionEventReceived = true;
        updateMotion(enabled);
      });
      void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (!motionEventReceived) updateMotion(enabled);
      }).catch(() => { /* Keep the static placeholder if the native preference is unavailable. */ });
    }

    return () => {
      subscriberCount -= 1;
      if (subscriberCount === 0) {
        generation += 1;
        motionSubscription?.remove();
        motionSubscription = null;
        stopPulse();
      }
    };
  }, []);

  return pulseOpacity;
}

export default useSharedPulse;
