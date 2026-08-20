import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassViewProps,
} from 'expo-glass-effect';
import {
  AndroidStaticSurface,
} from '../styles/GlassSurface.styles';

type GlassSurfaceProps = ViewProps & {
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
  children,
  glassEffectStyle = 'clear',
  intensity = 56,
  interactive = false,
  style,
  tintColor = 'rgba(255,255,255,0.18)',
  ...viewProps
}: GlassSurfaceProps) => {
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

  if (Platform.OS === 'android') {
    return (
      <AndroidStaticSurface $backgroundColor={tintColor} style={style} {...viewProps}>
        {children}
      </AndroidStaticSurface>
    );
  }

  return (
    <BlurView
      blurMethod="none"
      blurReductionFactor={undefined}
      intensity={intensity}
      style={[
        style,
        { backgroundColor: tintColor },
      ]}
      tint="systemUltraThinMaterialLight"
      {...viewProps}
    >
      {children}
    </BlurView>
  );
};

export default GlassSurface;
