import React, { useEffect, useRef, useState } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import { useMapSettingsStore } from '../store/mapSettingsStore';
import useAuth from '../../features/auth/hooks/useAuth';
import { useFcmTokenSync } from '../../features/firebase/hooks/useFcmTokenSync';
import { useForegroundFcmNotifications } from '../../features/firebase/hooks/useForegroundFcmNotifications';
import { useNotificationOpenSync } from '../../features/firebase/hooks/useNotificationOpenSync';
import useNotificationState from '../../features/firebase/hooks/useNotificationState';
import {
  getInitialAppRoute,
  getUnauthenticatedNavigationKey,
  useOnboardingEntry,
} from '../../v2/features/onboarding-entry';
import AuthNavigator from './AuthNavigator';
import { parseDeepLink } from './deepLink';
import MainNavigator from './MainNavigator';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
  getRootRouteName,
  toMainNavigatorParams,
  type MainNavigationIntent,
} from './navigationIntent';
import {
  ROOT_ROUTES,
  type RootStackParamList,
} from './types';
import { useAndroidBackHandler } from './useAndroidBackHandler';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const RootNavigator = () => {
  const { bootstrapAuth, isHydrating, isLoggedIn } = useAuth();
  const { complete: completeOnboarding, hydrate: hydrateOnboarding, state: onboardingState } =
    useOnboardingEntry();
  const hydrateMapSettings = useMapSettingsStore((state) => state.hydrateMapSettings);
  const { pendingRoute, consumePendingNotificationRoute } = useNotificationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [pendingDeepLinkIntent, setPendingDeepLinkIntent] = useState<MainNavigationIntent | null>(null);
  const handledNotificationIds = useRef(new Set<string>());
  const previousIsLoggedIn = useRef(isLoggedIn);

  useAndroidBackHandler(navigationRef);

  useFcmTokenSync(isLoggedIn);
  useForegroundFcmNotifications(isLoggedIn);
  useNotificationOpenSync();

  useEffect(() => {
    void bootstrapAuth();
    void hydrateOnboarding();
    void hydrateMapSettings();
  }, [bootstrapAuth, hydrateMapSettings, hydrateOnboarding]);

  useEffect(() => {
    let isActive = true;

    const receiveUrl = (url: string) => {
      const intent = parseDeepLink(url);
      if (intent) {
        setPendingDeepLinkIntent(intent);
      }
    };

    void Linking.getInitialURL()
      .then((url) => {
        if (isActive && url) {
          receiveUrl(url);
        }
      })
      .catch((error) => {
        console.warn('Initial deep link hydrate failed:', error);
      });

    const subscription = Linking.addEventListener('url', ({ url }) => receiveUrl(url));

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !isNavigationReady || !pendingRoute || !navigationRef.isReady()) {
      return;
    }

    if (!claimNotificationMessage(pendingRoute, handledNotificationIds.current)) {
      consumePendingNotificationRoute();
      return;
    }

    const intent = createNotificationNavigationIntent(pendingRoute);
    navigationRef.navigate(ROOT_ROUTES.Main, toMainNavigatorParams(intent));

    consumePendingNotificationRoute();
  }, [
    consumePendingNotificationRoute,
    isLoggedIn,
    isNavigationReady,
    pendingRoute,
  ]);

  useEffect(() => {
    if (
      !isLoggedIn
      || !isNavigationReady
      || !pendingDeepLinkIntent
      || pendingRoute
      || !navigationRef.isReady()
    ) {
      return;
    }

    navigationRef.navigate(
      ROOT_ROUTES.Main,
      toMainNavigatorParams(pendingDeepLinkIntent),
    );
    setPendingDeepLinkIntent(null);
  }, [
    isLoggedIn,
    isNavigationReady,
    pendingDeepLinkIntent,
    pendingRoute,
  ]);

  useEffect(() => {
    if (previousIsLoggedIn.current && !isLoggedIn) {
      setPendingDeepLinkIntent(null);
      handledNotificationIds.current.clear();
      if (pendingRoute) {
        consumePendingNotificationRoute();
      }
    }

    previousIsLoggedIn.current = isLoggedIn;
  }, [consumePendingNotificationRoute, isLoggedIn, pendingRoute]);

  const initialAppRoute = getInitialAppRoute(
    isHydrating,
    isLoggedIn,
    onboardingState,
  );

  if (initialAppRoute === 'loading') {
    return null;
  }

  const rootRouteName = getRootRouteName(initialAppRoute === 'main');
  const completion = onboardingState.kind === 'completed'
    ? onboardingState.completion
    : undefined;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsNavigationReady(true)}
    >
      <Stack.Navigator screenOptions={{ animation: 'none', headerShown: false }}>
        {rootRouteName === ROOT_ROUTES.Main ? (
          <Stack.Screen
            navigationKey="authenticated"
            name={ROOT_ROUTES.Main}
            component={MainNavigator}
          />
        ) : (
          <Stack.Screen
            navigationKey={getUnauthenticatedNavigationKey(completion)}
            name={ROOT_ROUTES.Auth}
          >
            {() => (
              <AuthNavigator
                completion={completion}
                onComplete={completeOnboarding}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
