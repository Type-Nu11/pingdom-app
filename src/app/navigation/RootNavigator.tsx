import React, { useEffect, useState } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMapSettingsStore } from '../store/mapSettingsStore';
import useAuth from '../../features/auth/hooks/useAuth';
import { useFcmTokenSync } from '../../features/firebase/hooks/useFcmTokenSync';
import { useForegroundFcmNotifications } from '../../features/firebase/hooks/useForegroundFcmNotifications';
import { useNotificationOpenSync } from '../../features/firebase/hooks/useNotificationOpenSync';
import useNotificationState from '../../features/firebase/hooks/useNotificationState';
import type { NotificationRoute } from '../../features/firebase/model/notification.types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {
  MAIN_ROUTES,
  parseNotificationId,
  parsePlaceId,
  parsePostId,
  ROOT_ROUTES,
  type NotificationNavigationContext,
  type RootStackParamList,
} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function createNotificationContext(
  route: NotificationRoute,
): NotificationNavigationContext | undefined {
  const notificationId = parseNotificationId(route.notificationsId);
  const postId = parsePostId(route.postId);

  if (!notificationId && !postId && !route.title && !route.body) {
    return undefined;
  }

  return {
    body: route.body,
    notificationId: notificationId ?? undefined,
    postId: postId ?? undefined,
    title: route.title,
  };
}

const RootNavigator = () => {
  const { bootstrapAuth, isHydrating, isLoggedIn } = useAuth();
  const hydrateMapSettings = useMapSettingsStore((state) => state.hydrateMapSettings);
  const { pendingRoute, consumePendingNotificationRoute } = useNotificationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useFcmTokenSync(isLoggedIn);
  useForegroundFcmNotifications(isLoggedIn);
  useNotificationOpenSync();

  useEffect(() => {
    void bootstrapAuth();
    void hydrateMapSettings();
  }, [bootstrapAuth, hydrateMapSettings]);

  useEffect(() => {
    if (!isLoggedIn || !isNavigationReady || !pendingRoute || !navigationRef.isReady()) {
      return;
    }

    const notificationContext = createNotificationContext(pendingRoute);
    const placeId = parsePlaceId(pendingRoute.placeId);

    if (pendingRoute.screen === 'place-detail' && placeId) {
      navigationRef.navigate(ROOT_ROUTES.Main, {
        params: {
          notificationContext,
          placeId,
        },
        screen: MAIN_ROUTES.PlaceDetail,
      });
    } else {
      navigationRef.navigate(ROOT_ROUTES.Main, {
        params: notificationContext ? { notificationContext } : undefined,
        screen: MAIN_ROUTES.Map,
      });
    }

    consumePendingNotificationRoute();
  }, [
    consumePendingNotificationRoute,
    isLoggedIn,
    isNavigationReady,
    pendingRoute,
  ]);

  if (isHydrating) {
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsNavigationReady(true)}
    >
      <Stack.Navigator screenOptions={{ animation: 'none', headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name={ROOT_ROUTES.Main} component={MainNavigator} />
        ) : (
          <Stack.Screen name={ROOT_ROUTES.Auth} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
