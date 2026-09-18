import { PlaceMapComposition } from '../v2/app/PlaceMapComposition';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppErrorBoundary from '../v2/app/AppErrorBoundary';
import { createQueryClient } from '../v2/app/queryClient';
import { i18n, initializeI18n } from '../v2/app/i18n';
import {
  AppFontFamilyProvider,
  PRETENDARD_FONT_FAMILY,
  SYSTEM_FONT_FAMILY,
  useAppFonts,
} from '../v2/shared/fonts';
import { AppThemeProvider } from '../v2/shared/theme';

export default function ProductionProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const fontStatus = useAppFonts();

  useEffect(() => {
    let isMounted = true;

    void initializeI18n()
      .catch((error) => {
        console.warn('[Production i18n] Initialization failed:', error);
      })
      .finally(() => {
        if (isMounted) setIsI18nReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);

  const activeFontFamily = fontStatus === 'loaded'
    ? PRETENDARD_FONT_FAMILY
    : SYSTEM_FONT_FAMILY;
  const isBootReady = isI18nReady && fontStatus !== 'loading';

  return (
    <AppFontFamilyProvider fontFamily={activeFontFamily}>
      <SafeAreaProvider>
        <AppThemeProvider fontFamily={activeFontFamily}>
          {isBootReady ? (
            <I18nextProvider i18n={i18n}>
              <AppErrorBoundary>
                <QueryClientProvider client={queryClient}><PlaceMapComposition>{children}</PlaceMapComposition></QueryClientProvider>
              </AppErrorBoundary>
            </I18nextProvider>
          ) : null}
        </AppThemeProvider>
      </SafeAreaProvider>
    </AppFontFamilyProvider>
  );
}
