import React, { createContext, useContext } from 'react';
import { Platform, type View, type ViewProps } from 'react-native';
import { BlurView, type BlurViewProps } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

type GlassSurfaceProps = ViewProps & {
  blurTarget?: BlurViewProps['blurTarget'];
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
  blurTarget,
  children,
  intensity = 90,
  interactive = false,
  style,
  tintColor = 'rgba(255,255,255,0.18)',
  ...viewProps
}: GlassSurfaceProps) => {
  const inheritedBlurTarget = useContext(GlassBlurTargetContext);
  const resolvedBlurTarget = blurTarget ?? inheritedBlurTarget;
  const shouldUseAndroidBlur = Boolean(resolvedBlurTarget) && supportsAndroidNativeBlur();

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
      blurMethod={shouldUseAndroidBlur
        ? 'dimezisBlurViewSdk31Plus'
        : 'none'}
      blurReductionFactor={Platform.OS === 'android' ? 1 : undefined}
      blurTarget={resolvedBlurTarget}
      intensity={intensity}
      style={[
        {
          backgroundColor: Platform.OS === 'android'
            ? shouldUseAndroidBlur
              ? tintColor
              : 'rgba(247,250,252,0.9)'
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
