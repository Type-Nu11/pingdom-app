import React, { memo, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import Animated, {
  cancelAnimation, interpolateColor, ReduceMotion, useAnimatedProps,
  useFrameCallback, useSharedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import Svg, { G, Rect } from 'react-native-svg';
import styled from 'styled-components/native';

const FLOW_SEGMENTS = 24;
const FLOW_DURATION_MS = 5000;
const SPEAKING_SPEED = 1.6;
const FLOW_COLORS = ['#FF1956', '#FFC9D3', '#FF4A75', '#FFF2F5', '#FF1956', '#FFC9D3', '#FF1956'];
const FLOW_STEPS = FLOW_COLORS.map((_, index) => index / (FLOW_COLORS.length - 1));
const FLOW_HAZE_LAYERS = Array.from({ length: 8 }, (_, index) => ({
  width: 8 + index * 12,
  opacity: 0.06 * Math.exp(-index * index / 22.5),
}));
const FlowGroup = Animated.createAnimatedComponent(G);

// One UI-thread color update per segment; all eight haze layers inherit it.
const FlowSegment = memo(function FlowSegment({ progress, segment, width, height, perimeter }: {
  progress: SharedValue<number>; segment: number; width: number; height: number; perimeter: number;
}) {
  const animatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(((segment / FLOW_SEGMENTS - progress.value) % 1 + 1) % 1, FLOW_STEPS, FLOW_COLORS),
  }));
  return <FlowGroup animatedProps={animatedProps}>
    {FLOW_HAZE_LAYERS.map(layer => <Rect key={layer.width} x={1} y={1}
      width={width - 2} height={height - 2} rx={8} ry={8} fill="none"
      strokeWidth={layer.width} opacity={layer.opacity} strokeLinecap="round"
      strokeDasharray={[perimeter / FLOW_SEGMENTS + 0.8, perimeter - perimeter / FLOW_SEGMENTS - 0.8]}
      strokeDashoffset={-perimeter * segment / FLOW_SEGMENTS} />)}
  </FlowGroup>;
});

// Input focus and text changes do not rebuild the glow or occupy the JS thread.
export const AssistantEdgeGlow = memo(function AssistantEdgeGlow({ speaking = false }: { speaking?: boolean }) {
  const progress = useSharedValue(0);
  const speed = useSharedValue(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const perimeter = Math.max(1, 2 * (size.width + size.height - 4) - 64 + 16 * Math.PI);
  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    const elapsed = Math.min(timeSincePreviousFrame ?? 0, 64);
    progress.value = (progress.value + elapsed * speed.value / FLOW_DURATION_MS) % 1;
  }, false);
  useEffect(() => {
    speed.value = withTiming(speaking ? SPEAKING_SPEED : 1, { duration: 220, reduceMotion: ReduceMotion.Never });
  }, [speaking, speed]);
  useEffect(() => {
    const update = (status: string) => {
      frame.setActive(status === 'active');
    };
    update(AppState.currentState);
    const subscription = AppState.addEventListener('change', update);
    return () => { frame.setActive(false); cancelAnimation(speed); subscription.remove(); };
  }, [frame, speed]);
  return <GlowContainer pointerEvents="none" onLayout={({ nativeEvent: { layout } }) => setSize({ width: layout.width, height: layout.height })}>
    <Glow source={require('../assets/edge-glow-transparent.png')} resizeMode="stretch" accessible={false} />
    {size.width > 0 && size.height > 0 && <Svg width="100%" height="100%" accessible={false}>
      {Array.from({ length: FLOW_SEGMENTS }, (_, segment) => <FlowSegment key={segment}
        segment={segment} progress={progress} width={size.width} height={size.height} perimeter={perimeter} />)}
    </Svg>}
  </GlowContainer>;
});
const GlowContainer = styled.View`overflow: hidden; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;`;
const Glow = styled.Image`position: absolute; width: 100%; height: 100%; opacity: 0.8;`;
