import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

type GlassSurfaceProps = ViewProps & {
  intensity?: number;
  interactive?: boolean;
  tintColor?: string;
};

const supportsNativeLiquidGlass = () => (
  Platform.OS === 'ios'
  && isGlassEffectAPIAvailable()
  && isLiquidGlassAvailable()
);

const GlassSurface = ({
  children,
  intensity = 62,
  interactive = false,
  style,
  tintColor = 'rgba(255,255,255,0.18)',
  ...viewProps
}: GlassSurfaceProps) => {
  if (supportsNativeLiquidGlass()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
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
    <BlurView
      intensity={intensity}
      style={[
        {
          backgroundColor: Platform.OS === 'android'
            ? 'rgba(247,250,252,0.9)'
            : tintColor,
        },
        style,
      ]}
      tint="systemUltraThinMaterialLight"
      {...viewProps}
    >
      {children}
    </BlurView>
  );
};

export default GlassSurface;
