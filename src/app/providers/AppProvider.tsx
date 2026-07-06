import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createQueryClient } from './queryClient';

const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => createQueryClient());

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
