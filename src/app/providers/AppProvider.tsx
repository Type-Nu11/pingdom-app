import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { api } from '../../shared/api/apiClient';
import { createQueryClient } from './queryClient';
import { getAuthState, logout } from '../store/authStore';
import {
  configureApiAccessTokenProvider,
  configureApiTransport,
} from '../../v2/shared/api';
import { configureTokenSession } from '../../v2/shared/auth/tokenSession';
import { i18n, initializeI18n } from '../../v2/shared/i18n';

const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => createQueryClient());
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void initializeI18n()
      .catch((error) => {
        console.warn('[App i18n] Initialization failed:', error);
      })
      .finally(() => {
        if (isMounted) setIsI18nReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => configureApiTransport(api), []);
  useEffect(() => configureApiAccessTokenProvider(() => getAuthState().accessToken), []);
  useEffect(() => configureTokenSession({ clear: logout }), []);

  useEffect(() => {
    const handleAppStateChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isI18nReady) return null;

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
};

export default AppProvider;
