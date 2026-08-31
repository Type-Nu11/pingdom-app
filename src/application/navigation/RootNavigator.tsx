import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';

import AuthNavigator from '../../app/navigation/AuthNavigator';
import { parseDeepLink } from '../../app/navigation/deepLink';
import MainNavigator from '../../app/navigation/MainNavigator';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
  getRootRouteName,
  toMainNavigatorParams,
  type MainNavigationIntent,
} from '../../app/navigation/navigationIntent';
import { ROOT_ROUTES, type RootStackParamList } from '../../app/navigation/types';
import { useAndroidBackHandler } from '../../app/navigation/useAndroidBackHandler';
import { useMapSettingsStore } from '../../app/store/mapSettingsStore';
import { useAuthStore } from '../../app/store/authStore';
import { useFcmTokenSync } from '../../v2/features/notifications/hooks/useFcmTokenSync';
import { useForegroundNotifications } from '../../v2/features/notifications/hooks/useForegroundNotifications';
import { useNotificationOpenSync } from '../../v2/features/notifications/hooks/useNotificationOpenSync';
import type { NotificationRoute } from '../../v2/features/notifications/model/notification.types';
import {
  getUnauthenticatedNavigationKey,
  useOnboardingEntry,
} from '../../v2/features/onboarding-entry';
import {
  canDeliverProtectedIntent,
  resolveProductionRootState,
} from './runtimeState';
import { claimDeepLinkEvent, type DeepLinkEventReceipt } from './deepLinkDedupe';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function RootNavigator() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { complete: completeOnboarding, hydrate: hydrateOnboarding, state: onboardingState } =
    useOnboardingEntry();
  const hydrateMapSettings = useMapSettingsStore((state) => state.hydrateMapSettings);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<NotificationRoute | null>(null);
  const [pendingDeepLinkIntent, setPendingDeepLinkIntent] = useState<MainNavigationIntent | null>(null);
  const handledNotificationIds = useRef(new Set<string>());
  const lastDeepLinkEvent = useRef<DeepLinkEventReceipt | null>(null);
  const previousIsLoggedIn = useRef(isLoggedIn);
  const rootState = resolveProductionRootState(isHydrating, isLoggedIn, onboardingState);

  useAndroidBackHandler(navigationRef);
  useFcmTokenSync(isLoggedIn);
  useForegroundNotifications(isLoggedIn);
  useNotificationOpenSync(useCallback((route) => setPendingNotification(route), []));

  useEffect(() => {
    void bootstrapAuth();
    void hydrateOnboarding();
    void hydrateMapSettings();
  }, [bootstrapAuth, hydrateMapSettings, hydrateOnboarding]);

  useEffect(() => {
    let isActive = true;

    const receiveUrl = (url: string) => {
      const intent = parseDeepLink(url);
      if (!intent) return;

      const receipt = claimDeepLinkEvent(url, Date.now(), lastDeepLinkEvent.current);
      if (!receipt) return;

      lastDeepLinkEvent.current = receipt;
      setPendingDeepLinkIntent(intent);
    };

    void Linking.getInitialURL()
      .then((url) => {
        if (isActive && url) receiveUrl(url);
      })
      .catch((error) => console.warn('Initial deep link hydrate failed:', error));

    const subscription = Linking.addEventListener('url', ({ url }) => receiveUrl(url));

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (
      !canDeliverProtectedIntent(rootState, isNavigationReady)
      || !pendingNotification
      || !navigationRef.isReady()
    ) {
      return;
    }

    if (claimNotificationMessage(pendingNotification, handledNotificationIds.current)) {
      navigationRef.navigate(
        ROOT_ROUTES.Main,
        toMainNavigatorParams(createNotificationNavigationIntent(pendingNotification)),
      );
    }
    setPendingNotification(null);
  }, [isNavigationReady, pendingNotification, rootState]);

  useEffect(() => {
    if (
      !canDeliverProtectedIntent(rootState, isNavigationReady)
      || !pendingDeepLinkIntent
      || pendingNotification
      || !navigationRef.isReady()
    ) {
      return;
    }

    navigationRef.navigate(ROOT_ROUTES.Main, toMainNavigatorParams(pendingDeepLinkIntent));
    setPendingDeepLinkIntent(null);
  }, [isNavigationReady, pendingDeepLinkIntent, pendingNotification, rootState]);

  useEffect(() => {
    if (previousIsLoggedIn.current && !isLoggedIn) {
      setPendingNotification(null);
      setPendingDeepLinkIntent(null);
      handledNotificationIds.current.clear();
    }
    previousIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  if (rootState === 'loading') return null;

  const rootRouteName = getRootRouteName(rootState === 'main');
  const completion = onboardingState.kind === 'completed'
    ? onboardingState.completion
    : undefined;

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setIsNavigationReady(true)}>
      <Stack.Navigator screenOptions={{ animation: 'none', headerShown: false }}>
        {rootRouteName === ROOT_ROUTES.Main ? (
          <Stack.Screen
            component={MainNavigator}
            navigationKey="authenticated"
            name={ROOT_ROUTES.Main}
          />
        ) : (
          <Stack.Screen
            navigationKey={getUnauthenticatedNavigationKey(completion)}
            name={ROOT_ROUTES.Auth}
          >
            {() => (
              <AuthNavigator completion={completion} onComplete={completeOnboarding} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
