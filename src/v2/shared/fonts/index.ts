import React, { createContext, type PropsWithChildren, useContext, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Platform, type PlatformOSType, type TextStyle } from 'react-native';

export const PRETENDARD_FONT_FAMILY = 'Pretendard';

export function getSystemFontFamily(platform: PlatformOSType): string {
  if (platform === 'android') return 'sans-serif';
  if (platform === 'ios') return 'System';
  return 'system-ui';
}

export const SYSTEM_FONT_FAMILY = getSystemFontFamily(Platform.OS);

// `PretendardVariable.ttf` is registered under the `Pretendard` alias, but iOS
// resolves `fontWeight` only against real family members, so every weight
// rendered as Regular. The file ships named instances (fvar) whose PostScript
// names iOS can open directly, so weights are mapped onto those instead.
const PRETENDARD_INSTANCE_BY_WEIGHT: Record<string, string> = {
  100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium',
  600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black', bold: 'Bold', normal: 'Regular',
};

export type FontFace = { fontFamily: string; fontWeight?: TextStyle['fontWeight'] };

export function resolveFontFace(
  fontFamily: string,
  fontWeight: TextStyle['fontWeight'],
  platform: PlatformOSType = Platform.OS,
): FontFace {
  if (fontFamily !== PRETENDARD_FONT_FAMILY || platform !== 'ios') return { fontFamily, fontWeight };
  const instance = PRETENDARD_INSTANCE_BY_WEIGHT[String(fontWeight ?? 400)] ?? 'Regular';
  // The instance already encodes the weight. Leaving `fontWeight` set makes iOS
  // re-resolve it against the family and land on a heavier member for 500.
  return { fontFamily: `PretendardStdVariable-${instance}`, fontWeight: undefined };
}

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
