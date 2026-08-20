import React, { createContext, useContext } from 'react';
import { Platform, type View, type ViewProps } from 'react-native';
import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassViewProps,
} from 'expo-glass-effect';
import {
  AndroidStaticSurface,
  MaterialTint,
} from '../styles/GlassSurface.styles';

type GlassSurfaceProps = ViewProps & {
  androidBlurEnabled?: boolean;
  androidFallbackTintColor?: string;
  blurTarget?: BlurViewProps['blurTarget'];
  glassEffectStyle?: GlassViewProps['glassEffectStyle'];
  intensity?: number;
  interactive?: boolean;
  tintColor?: string;
};

type GlassBlurTargetProviderProps = {
  blurTarget: React.RefObject<View | null>;
  children: React.ReactNode;
};

const GlassBlurTargetContext = createContext<BlurViewProps['blurTarget']>(undefined);

export const GlassBlurTargetProvider = ({
  blurTarget,
  children,
}: GlassBlurTargetProviderProps) => (
  <GlassBlurTargetContext.Provider value={blurTarget}>
    {children}
  </GlassBlurTargetContext.Provider>
);

export const supportsNativeLiquidGlass = () => (
  Platform.OS === 'ios'
  && isGlassEffectAPIAvailable()
  && isLiquidGlassAvailable()
);

export const supportsAndroidNativeBlur = () => (
  Platform.OS === 'android' && Number(Platform.Version) >= 31
);

const GlassSurface = ({
  androidBlurEnabled = true,
  androidFallbackTintColor = 'rgba(247,250,252,0.9)',
  blurTarget,
  children,
  glassEffectStyle = 'clear',
  intensity = 56,
  interactive = false,
  style,
  tintColor = 'rgba(255,255,255,0.18)',
  ...viewProps
}: GlassSurfaceProps) => {
  const inheritedBlurTarget = useContext(GlassBlurTargetContext);
  const resolvedBlurTarget = blurTarget ?? inheritedBlurTarget;
  const shouldUseAndroidBlur = androidBlurEnabled
    && Boolean(resolvedBlurTarget)
    && supportsAndroidNativeBlur();

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
    // Keep the material tint independent from the blur backend. During map motion we
    // disable only the expensive backdrop blur, leaving this tint in place so the
    // surface does not flash into a different colour.
    if (!shouldUseAndroidBlur) {
      const preserveMaterialTint = !androidBlurEnabled
        || (Boolean(resolvedBlurTarget) && supportsAndroidNativeBlur());
      const fallbackTint = preserveMaterialTint
        ? tintColor
        : androidFallbackTintColor;

      return (
        <AndroidStaticSurface $backgroundColor={fallbackTint} style={style} {...viewProps}>
          {children}
        </AndroidStaticSurface>
      );
    }

    return (
      <BlurView
        blurMethod="dimezisBlurViewSdk31Plus"
        blurReductionFactor={4}
        blurTarget={resolvedBlurTarget}
        intensity={intensity}
        style={[style, { backgroundColor: 'transparent' }]}
        tint="systemUltraThinMaterial"
        {...viewProps}
      >
        <MaterialTint $tintColor={tintColor} pointerEvents="none" />
        {children}
      </BlurView>
    );
  }

  return (
    <BlurView
      blurMethod="none"
      blurReductionFactor={undefined}
      blurTarget={resolvedBlurTarget}
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
