import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFcmTokenSync } from '../../features/notifications/hooks/useFcmTokenSync';
import { useForegroundNotifications } from '../../features/notifications/hooks/useForegroundNotifications';
import { useNotificationOpenSync } from '../../features/notifications/hooks/useNotificationOpenSync';
import type { NotificationRoute } from '../../features/notifications/model/notification.types';
import HomeScreen from '../../features/home/screens/HomeScreen';
import MapScreen from '../../features/map/screens/MapScreen';
import PlaceListExampleScreen from '../../features/place-list/screens/PlaceListExampleScreen';
import PlaceDetailScreen from '../../features/place-detail/screens/PlaceDetailScreen';
import PlaceReportFlowScreen from '../../features/place-report/screens/PlaceReportFlowScreen';
import CreateReservationScreen from '../../features/reservations/screens/CreateReservationScreen';
import { env } from '../../shared/config';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
} from './notificationIntent';
import { V2_ROUTES, type V2StackParamList } from './types';
import { useAndroidBackHandler } from './useAndroidBackHandler';

const Stack = createNativeStackNavigator<V2StackParamList>();
const navigationRef = createNavigationContainerRef<V2StackParamList>();

function HomeRouteScreen() {
  return env.featureFlags.placeList ? <PlaceListExampleScreen /> : <HomeScreen />;
}

export default function RootNavigator() {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<NotificationRoute | null>(null);
  const handledMessageIds = useRef(new Set<string>());

  useAndroidBackHandler(navigationRef);

  const handleNotificationOpen = useCallback((route: NotificationRoute) => {
    setPendingRoute(route);
  }, []);

  useFcmTokenSync();
  useForegroundNotifications();
  useNotificationOpenSync(handleNotificationOpen);

  useEffect(() => {
    if (!isNavigationReady || !pendingRoute || !navigationRef.isReady()) {
      return;
    }

    if (!claimNotificationMessage(pendingRoute.messageId, handledMessageIds.current)) {
      setPendingRoute(null);
      return;
    }

    const intent = createNotificationNavigationIntent(pendingRoute);

    if (intent.screen === V2_ROUTES.PlaceDetail) {
      navigationRef.navigate(V2_ROUTES.PlaceDetail, intent.params);
    } else {
      navigationRef.navigate(V2_ROUTES.Home);
    }

    setPendingRoute(null);
  }, [isNavigationReady, pendingRoute]);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setIsNavigationReady(true)}>
      <Stack.Navigator initialRouteName={V2_ROUTES.Map} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={V2_ROUTES.CreateReservation} component={CreateReservationScreen} />
        <Stack.Screen name={V2_ROUTES.Map} component={MapScreen} />
        <Stack.Screen name={V2_ROUTES.Home} component={HomeRouteScreen} />
        <Stack.Screen name={V2_ROUTES.PlaceDetail} component={PlaceDetailScreen} />
        <Stack.Screen name={V2_ROUTES.PlaceReport} component={PlaceReportFlowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
