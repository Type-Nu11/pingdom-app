import './configureDomainMocks';
import { PlaceMapComposition } from './PlaceMapComposition';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n, initializeI18n } from './i18n';
import {
  AppFontFamilyProvider,
  PRETENDARD_FONT_FAMILY,
  SYSTEM_FONT_FAMILY,
  useAppFonts,
} from '../shared/fonts';
import { AppThemeProvider } from '../shared/theme';
import AppErrorBoundary from './AppErrorBoundary';
import { createQueryClient } from './queryClient';

export default function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const fontStatus = useAppFonts();

  useEffect(() => {
    let isMounted = true;

    void initializeI18n()
      .catch(() => {
        console.warn('[V2 i18n] Initialization failed.');
      })
      .finally(() => {
        if (isMounted) {
          setIsI18nReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

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
