import React from 'react';
import { Image } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

// Figma blurs two ellipses (489x227 at -142,133 and 528x212 at -3,494 on the
// 402x874 frame) by 101px. react-native-svg has no blur filter, so the blurred
// footprint is baked into an alpha mask that the theme's glow color tints.
const GLOW_MASK = require('../../../../assets/v2/images/onboarding/glow.png');

// react-native applies tintColor's alpha unevenly across platforms, so the
// token is split into an opaque color and an opacity.
function splitRgba(value: string): { alpha: number; color: string } {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { alpha: 1, color: value };
  return {
    alpha: match[4] === undefined ? 1 : Number(match[4]),
    color: `rgb(${match[1]}, ${match[2]}, ${match[3]})`,
  };
}

export default function OnboardingGlow() {
  const { colors } = useTheme();
  const { alpha, color } = splitRgba(colors.primaryGlow);

  return <Mask resizeMode="stretch" source={GLOW_MASK} style={{ opacity: alpha, pointerEvents: 'none', tintColor: color }} />;
}

const Mask = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
