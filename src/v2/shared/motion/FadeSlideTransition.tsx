import React, { type PropsWithChildren, useLayoutEffect, useRef } from 'react';
import {
  Animated,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { MOTION_DURATION, runTimingMotion } from './motionPolicy';
import { useReducedMotion } from './useReducedMotion';

const CONTENT_TRANSITION_OFFSET = 24;

type FadeSlideTransitionProps = PropsWithChildren<{
  direction: number;
  stateKey: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}> & Omit<ViewProps, 'children' | 'style' | 'testID'>;

type TransitionFrameProps = FadeSlideTransitionProps & {
  animate: boolean;
  movementDirection: 1 | -1;
};

function TransitionFrame({
  animate,
  children,
  movementDirection,
  style,
  testID,
  ...viewProps
}: TransitionFrameProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimateOnMount = animate && !reduceMotion;
  const opacity = useRef(new Animated.Value(shouldAnimateOnMount ? 0 : 1)).current;
  const translateX = useRef(new Animated.Value(
    shouldAnimateOnMount ? CONTENT_TRANSITION_OFFSET * movementDirection : 0,
  )).current;

  useLayoutEffect(() => {
    opacity.stopAnimation();
    translateX.stopAnimation();

    if (!animate || reduceMotion) {
      opacity.setValue(1);
      translateX.setValue(0);
      return;
    }

    runTimingMotion(opacity, 1, {
      duration: MOTION_DURATION.transition,
      reduceMotion: false,
      useNativeDriver: true,
    });
    runTimingMotion(translateX, 0, {
      duration: MOTION_DURATION.transition,
      reduceMotion: false,
      useNativeDriver: true,
    });
  }, [animate, opacity, reduceMotion, translateX]);

  useLayoutEffect(() => () => {
    opacity.stopAnimation();
    translateX.stopAnimation();
  }, [opacity, translateX]);

  return (
    <Animated.View
      {...viewProps}
      style={[style, { opacity, transform: [{ translateX }] }]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

export function FadeSlideTransition({
  children,
  direction,
  stateKey,
  style,
  testID,
  ...viewProps
}: FadeSlideTransitionProps) {
  const transition = useRef({
    animate: false,
    direction,
    movementDirection: 1 as 1 | -1,
    stateKey,
  });

  if (transition.current.stateKey !== stateKey) {
    transition.current = {
      animate: true,
      direction,
      movementDirection: direction >= transition.current.direction ? 1 : -1,
      stateKey,
    };
  }

  return (
    <TransitionFrame
      {...viewProps}
      animate={transition.current.animate}
      direction={direction}
      key={stateKey}
      movementDirection={transition.current.movementDirection}
      stateKey={stateKey}
      style={style}
      testID={testID}
    >
      {children}
    </TransitionFrame>
  );
}

export default FadeSlideTransition;
