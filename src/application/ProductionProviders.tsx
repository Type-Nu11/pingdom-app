import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import AppErrorBoundary from '../v2/app/AppErrorBoundary';
import { createQueryClient } from '../v2/app/queryClient';
import { i18n, initializeI18n } from '../v2/shared/i18n';
import { theme } from '../v2/shared/theme';

export default function ProductionProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const [isI18nReady, setIsI18nReady] = useState(false);

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

  if (!isI18nReady) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <AppErrorBoundary>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </AppErrorBoundary>
        </I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
