import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import type { BlurTint } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassViewProps,
} from 'expo-glass-effect';
import { GlassContainer, GlassTint, GlassBlur } from '../styles/GlassSurface.styles';
import { useMapGlassBackdrop } from './MapGlassBackdrop';

type GlassSurfaceProps = ViewProps & {
  androidTintColor?: string;
  blurTint?: BlurTint;
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  intensity?: number;
  interactive?: boolean;
  tintColor?: string;
};

export const supportsNativeLiquidGlass = () => (
  Platform.OS === 'ios'
  && isGlassEffectAPIAvailable()
  && isLiquidGlassAvailable()
);

const GlassSurface = ({
  androidTintColor,
  blurTint = 'systemUltraThinMaterialLight',
  children,
  glassEffectStyle = 'clear',
  intensity = 56,
  interactive = false,
  style,
  tintColor = 'rgba(255,255,255,0.18)',
  ...viewProps
}: GlassSurfaceProps) => {
  const blurTarget = useMapGlassBackdrop();

  if (supportsNativeLiquidGlass()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive}
        style={[style, { backgroundColor: 'transparent' }]}
        tintColor={tintColor}
        {...viewProps}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <GlassContainer style={[style, { backgroundColor: 'transparent' }]} {...viewProps}>
      {Platform.OS !== 'android' || blurTarget ? (
        <GlassBlur
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
          blurReductionFactor={4}
          blurTarget={blurTarget}
          intensity={intensity}
          pointerEvents="none"
          tint={blurTint}
        />
      ) : null}
      <GlassTint
        $backgroundColor={Platform.OS === 'android' && blurTarget ? androidTintColor ?? tintColor : tintColor}
        pointerEvents="none"
      />
      {children}
    </GlassContainer>
  );
};

export default GlassSurface;
