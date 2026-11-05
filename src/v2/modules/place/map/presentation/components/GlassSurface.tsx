import React from 'react';
import { Platform, type View, type ViewProps } from 'react-native';
import type { BlurTint } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassViewProps,
} from 'expo-glass-effect';
import { ThemeContext } from 'styled-components/native';
import { lightTheme } from '../../../../../shared/theme';
import { GlassContainer, GlassTint, GlassBlur, GlassNativeLayer } from '../styles/GlassSurface.styles';
import { useMapGlassBackdrop } from './MapGlassBackdrop';

type GlassSurfaceProps = ViewProps & {
  androidTintColor?: string;
  backdropBlurEnabled?: boolean;
  blurTarget?: React.RefObject<View | null>;
  blurTint?: BlurTint;
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  intensity?: number;
  interactive?: boolean;
  material?: 'liquid' | 'frosted' | 'balanced';
  cornerRadius?: number;
  tintColor?: string;
};

export const supportsNativeLiquidGlass = () => (
  Platform.OS === 'ios'
  && isGlassEffectAPIAvailable()
  && isLiquidGlassAvailable()
);

const GlassSurface = ({
  androidTintColor,
  backdropBlurEnabled = true,
  blurTarget: contentBlurTarget,
  blurTint,
  children,
  glassEffectStyle = 'clear',
  intensity = 56,
  interactive = false,
  material = 'liquid',
  cornerRadius = 0,
  style,
  tintColor,
  ...viewProps
}: GlassSurfaceProps) => {
  const providedTheme = React.useContext(ThemeContext);
  const theme = providedTheme?.colors ? providedTheme : lightTheme;
  const mapBlurTarget = useMapGlassBackdrop();
  const blurTarget = contentBlurTarget ?? mapBlurTarget;
  const resolvedBlurTint = blurTint ?? (theme.colorScheme === 'dark'
    ? 'systemUltraThinMaterialDark'
    : 'systemUltraThinMaterialLight');
  const resolvedNativeTint = tintColor ?? theme.liquidGlass.nativeTint;
  const resolvedFallbackTint = tintColor ?? theme.liquidGlass.fallbackSurface;
  const surfaceTint = Platform.OS === 'android' && material === 'frosted'
    ? androidTintColor ?? resolvedFallbackTint
    : resolvedFallbackTint;
  const androidSurfaceTint = androidTintColor ?? resolvedFallbackTint;
  const opaqueAndroidTint = Platform.OS === 'android' && /^#[0-9a-f]{6}(ff)?$/i.test(androidSurfaceTint);
  const shouldRenderBlur = backdropBlurEnabled && !opaqueAndroidTint && (Platform.OS !== 'android' || Boolean(blurTarget));
  const nativeGlassAvailable = supportsNativeLiquidGlass();

  if (nativeGlassAvailable && material === 'liquid') {
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
      {shouldRenderBlur ? (
        <GlassBlur
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
          blurReductionFactor={4}
          blurTarget={blurTarget}
          intensity={intensity}
          pointerEvents="none"
          tint={resolvedBlurTint}
        />
      ) : null}
      {nativeGlassAvailable && material === 'balanced' ? (
        <GlassNativeLayer
          colorScheme={theme.colorScheme}
          glassEffectStyle={glassEffectStyle}
          isInteractive={false}
          pointerEvents="none"
          style={{ borderRadius: cornerRadius }}
          tintColor={theme.liquidGlass.nativeTint}
        />
      ) : null}
      <GlassTint
        $backgroundColor={Platform.OS === 'android' && blurTarget
          ? androidTintColor ?? resolvedFallbackTint
          : surfaceTint}
        pointerEvents="none"
      />
      {children}
    </GlassContainer>
  );
};

export default GlassSurface;
