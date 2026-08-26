import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import { i18n } from '../shared/i18n';
import { initializeReservationI18n } from '../features/reservations/i18n/reservationResources';
import { initializeVisitVerificationI18n } from '../features/place-visit-verification/i18n/visitVerificationResources';
import { theme } from '../shared/theme';
import AppErrorBoundary from './AppErrorBoundary';
import { createQueryClient } from './queryClient';

export default function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void Promise.all([initializeReservationI18n(), initializeVisitVerificationI18n()])
      .catch((error) => {
        console.warn('[V2 i18n] Initialization failed:', error);
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

  if (!isI18nReady) {
    return null;
  }

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
