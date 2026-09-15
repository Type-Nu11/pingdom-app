import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import type { BlurTint } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassViewProps,
} from 'expo-glass-effect';
import { ThemeContext } from 'styled-components/native';
import { lightTheme } from '../../../shared/theme';
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
  blurTint,
  children,
  glassEffectStyle = 'clear',
  intensity = 56,
  interactive = false,
  style,
  tintColor,
  ...viewProps
}: GlassSurfaceProps) => {
  const providedTheme = React.useContext(ThemeContext);
  const theme = providedTheme?.colors ? providedTheme : lightTheme;
  const blurTarget = useMapGlassBackdrop();
  const resolvedBlurTint = blurTint ?? (theme.colorScheme === 'dark'
    ? 'systemUltraThinMaterialDark'
    : 'systemUltraThinMaterialLight');
  const resolvedNativeTint = tintColor ?? theme.liquidGlass.nativeTint;
  const resolvedFallbackTint = tintColor ?? theme.liquidGlass.fallbackSurface;

  if (supportsNativeLiquidGlass()) {
    return (
      <GlassView
        colorScheme={theme.colorScheme}
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive}
        style={[style, { backgroundColor: 'transparent' }]}
        tintColor={resolvedNativeTint}
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
          tint={resolvedBlurTint}
        />
      ) : null}
      <GlassTint
        $backgroundColor={Platform.OS === 'android' && blurTarget
          ? androidTintColor ?? resolvedFallbackTint
          : resolvedFallbackTint}
        pointerEvents="none"
      />
      {children}
    </GlassContainer>
  );
};

export default GlassSurface;
