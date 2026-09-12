import React, { createContext, type PropsWithChildren, useContext, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Platform, type PlatformOSType } from 'react-native';

export const PRETENDARD_FONT_FAMILY = 'Pretendard';

export function getSystemFontFamily(platform: PlatformOSType): string {
  if (platform === 'android') return 'sans-serif';
  if (platform === 'ios') return 'System';
  return 'system-ui';
}

export const SYSTEM_FONT_FAMILY = getSystemFontFamily(Platform.OS);

export const appFontAssets = {
  [PRETENDARD_FONT_FAMILY]: require('../../../assets/v2/fonts/PretendardVariable.ttf'),
};

export type AppFontStatus = 'loading' | 'loaded' | 'fallback';

let hasWarnedAboutFontFallback = false;
const AppFontFamilyContext = createContext(PRETENDARD_FONT_FAMILY);

export function AppFontFamilyProvider({
  children,
  fontFamily,
}: PropsWithChildren<{ fontFamily: string }>) {
  return React.createElement(AppFontFamilyContext.Provider, { value: fontFamily }, children);
}

export function useAppFontFamily(): string {
  return useContext(AppFontFamilyContext);
}

export function useAppFonts(): AppFontStatus {
  const [loaded, error] = useFonts(appFontAssets);
  const status: AppFontStatus = error ? 'fallback' : loaded ? 'loaded' : 'loading';

  useEffect(() => {
    if (status !== 'fallback' || hasWarnedAboutFontFallback) return;

    console.warn('[Fonts] Pretendard unavailable; using system font.');
    hasWarnedAboutFontFallback = true;
  }, [status]);

  return status;
}
