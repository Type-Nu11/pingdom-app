import { useEffect } from 'react';
import { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '../../../shared/motion';

/** Reveal the edge first; animate presentation without delaying microphone startup. */
export function useAssistantEntrance(enabled = false) {
  const reducedMotion = useReducedMotion();
  const glow = useSharedValue(enabled ? 0 : 0.65);
  const input = useSharedValue(enabled ? 0 : 1);
  useEffect(() => {
    cancelAnimation(glow); cancelAnimation(input);
    if (!enabled || reducedMotion) {
      glow.value = 0.65; input.value = 1;
    } else {
      glow.value = 0; input.value = 0;
      glow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(180, withTiming(0.65, { duration: 420 })),
      );
      input.value = withDelay(160, withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }));
    }
    return () => { cancelAnimation(glow); cancelAnimation(input); };
  }, [enabled, glow, input, reducedMotion]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const inputStyle = useAnimatedStyle(() => ({ opacity: input.value, transform: [{ translateY: 44 * (1 - input.value) }] }));
  return { glowStyle, inputStyle, reducedMotion };
}
