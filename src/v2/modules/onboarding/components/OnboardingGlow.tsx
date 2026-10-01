import React from 'react';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

type GlowRect = Readonly<{ height: number; left: number; top: number; width: number }>;

// Figma `Ellipse` glows on the first-run and login screens (402x874 frame).
const TOP_GLOW: GlowRect = { height: 227, left: -142, top: 133, width: 489 };
const BOTTOM_GLOW: GlowRect = { height: 212, left: -3, top: 494, width: 528 };

// Figma blurs each ellipse by 101px; react-native-svg has no blur filter, so
// the same footprint is drawn as a radial gradient that fades to transparent.
const BLUR_SPREAD_X = 0.41;
const BLUR_SPREAD_Y = 0.9;

function Glow({ color, rect }: Readonly<{ color: string; rect: GlowRect }>) {
  const padX = rect.width * BLUR_SPREAD_X;
  const padY = rect.height * BLUR_SPREAD_Y;
  const width = rect.width + padX * 2;
  const height = rect.height + padY * 2;

  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ left: rect.left - padX, position: 'absolute', top: rect.top - padY }}
      width={width}
    >
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="glow" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="0.45" stopColor={color} stopOpacity="0.6" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} fill="url(#glow)" rx={width / 2} ry={height / 2} />
    </Svg>
  );
}

export default function OnboardingGlow() {
  const { colors } = useTheme();

  return (
    <>
      <Glow color={colors.primaryGlow} rect={TOP_GLOW} />
      <Glow color={colors.primaryGlow} rect={BOTTOM_GLOW} />
    </>
  );
}
