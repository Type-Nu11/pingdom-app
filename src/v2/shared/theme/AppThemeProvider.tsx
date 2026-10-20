import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { type ColorSchemeName, useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';

import type { AppearancePreference, ResolvedColorScheme } from './appearance';
import { resolveColorScheme } from './appearance';
import { type AppearanceStore, useAppearanceStore } from './appearanceStore';
import { createTheme } from './theme';

type AppearanceContextValue = {
  preference: AppearancePreference;
  resolvedScheme: ResolvedColorScheme;
  setPreference: (preference: AppearancePreference) => Promise<void>;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

type AppThemeProviderProps = PropsWithChildren<{
  appearanceStore?: AppearanceStore;
  fontFamily: string;
  systemSchemeOverride?: ColorSchemeName | string;
}>;

export function AppThemeProvider({
  appearanceStore = useAppearanceStore,
  children,
  fontFamily,
  systemSchemeOverride,
}: AppThemeProviderProps) {
  const detectedSystemScheme = useColorScheme();
  const systemScheme = systemSchemeOverride === undefined
    ? detectedSystemScheme
    : systemSchemeOverride;
  const preference = appearanceStore((state) => state.preference);
  const hydrationStatus = appearanceStore((state) => state.hydrationStatus);
  const hydrate = appearanceStore((state) => state.hydrate);
  const setPreference = appearanceStore((state) => state.setPreference);
  const resolvedScheme = resolveColorScheme(preference, systemScheme);
  const activeTheme = useMemo(
    () => createTheme(fontFamily, resolvedScheme),
    [fontFamily, resolvedScheme],
  );
  const contextValue = useMemo(() => ({
    preference,
    resolvedScheme,
    setPreference,
  }), [preference, resolvedScheme, setPreference]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (hydrationStatus !== 'hydrated') return null;

  return (
    <AppearanceContext.Provider value={contextValue}>
      <ThemeProvider theme={activeTheme}>
        <StatusBar
          animated
          backgroundColor={activeTheme.colors.background}
          style={resolvedScheme === 'dark' ? 'light' : 'dark'}
        />
        {children}
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used within AppThemeProvider.');
  return context;
}

export function useAppNavigationTheme(): NavigationTheme {
  const { resolvedScheme } = useAppearance();
  const base = resolvedScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme;
  return useMemo(() => {
    const theme = createTheme('', resolvedScheme);
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        border: theme.colors.border,
        card: theme.colors.surfaceElevated,
        notification: theme.colors.danger,
        primary: theme.colors.primary,
        text: theme.colors.text,
      },
    };
  }, [base, resolvedScheme]);
}
