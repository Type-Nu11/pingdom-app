import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { api } from '../../shared/api/apiClient';
import { createQueryClient } from './queryClient';
import { getAuthState, logout } from '../store/authStore';
import {
  configureApiAccessTokenProvider,
  configureApiTransport,
} from '../../v2/shared/api';
import { configureTokenSession } from '../../v2/shared/auth/tokenSession';

const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => createQueryClient());

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

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default AppProvider;
