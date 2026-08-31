import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useFcmTokenSync } from '../../features/notifications/hooks/useFcmTokenSync';
import { useForegroundNotifications } from '../../features/notifications/hooks/useForegroundNotifications';
import { useNotificationOpenSync } from '../../features/notifications/hooks/useNotificationOpenSync';
import type { NotificationRoute } from '../../features/notifications/model/notification.types';
import NotificationSettingsScreen from '../../features/notifications/screens/NotificationSettingsScreen';
import HomeScreen from '../../features/home/screens/HomeScreen';
import MapScreen from '../../features/map/screens/MapScreen';
import MyPageScreen from '../../features/my-page/screens/MyPageScreen';
import ProfileEditScreen from '../../features/my-page/screens/ProfileEditScreen';
import PlaceListExampleScreen from '../../features/place-list/screens/PlaceListExampleScreen';
import PlaceDetailScreen from '../../features/place-detail/screens/PlaceDetailScreen';
import CreateReservationScreen from '../../features/reservations/screens/CreateReservationScreen';
import {
  AccountManagementScreen,
  SettingsDetailPendingScreen,
  SettingsScreen,
} from '../../features/settings';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
} from '../../features/place-visit-verification';
import { env } from '../../shared/config';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
} from './notificationIntent';
import { V2_ROUTES, parseCheckInId, parsePlaceId, type V2ScreenProps, type V2StackParamList } from './types';
import { useAndroidBackHandler } from './useAndroidBackHandler';

const Stack = createNativeStackNavigator<V2StackParamList>();
const navigationRef = createNavigationContainerRef<V2StackParamList>();

function HomeRouteScreen() {
  return env.featureFlags.placeList ? <PlaceListExampleScreen /> : <HomeScreen />;
}

function MyPageRouteScreen({ navigation }: V2ScreenProps<'MyPage'>) {
  return (
    <MyPageScreen
      onBack={navigation.goBack}
      onOpenProfileEdit={() => navigation.navigate(V2_ROUTES.ProfileEdit)}
      onOpenSettings={() => navigation.navigate(V2_ROUTES.Settings)}
      onOpenVerifiedPlaces={() => {}}
    />
  );
}

function SettingsRouteScreen({ navigation }: V2ScreenProps<'Settings'>) {
  return (
    <SettingsScreen
      onBack={navigation.goBack}
      onOpenAccountManagement={() => navigation.navigate(V2_ROUTES.AccountManagement)}
      onOpenDetail={(detail) => navigation.navigate(V2_ROUTES.SettingsDetail, { detail })}
      onOpenNotificationSettings={() => navigation.navigate(V2_ROUTES.NotificationSettings)}
      onOpenProfileEdit={() => navigation.navigate(V2_ROUTES.ProfileEdit)}
    />
  );
}

function ProfileEditRouteScreen({ navigation }: V2ScreenProps<'ProfileEdit'>) {
  return <ProfileEditScreen onBack={navigation.goBack} />;
}

function AccountManagementRouteScreen({ navigation }: V2ScreenProps<'AccountManagement'>) {
  return (
    <AccountManagementScreen
      onBack={navigation.goBack}
      onOpenDetail={(detail) => navigation.navigate(V2_ROUTES.SettingsDetail, { detail })}
    />
  );
}

function SettingsDetailRouteScreen({ navigation, route }: V2ScreenProps<'SettingsDetail'>) {
  return (
    <SettingsDetailPendingScreen
      detail={route.params.detail}
      onBack={navigation.goBack}
    />
  );
}

function NotificationSettingsRoute({ navigation }: V2ScreenProps<'NotificationSettings'>) {
  return <NotificationSettingsScreen onBack={navigation.goBack} />;
}

function VisitVerificationPlacesRoute({ navigation }: V2ScreenProps<'VisitVerificationPlaces'>) {
  return <VisitVerificationPlacesScreen onBack={navigation.goBack} onSelectPlace={({ checkInId: value, placeId: placeValue }) => {
    const checkInId = parseCheckInId(value);
    const placeId = parsePlaceId(placeValue);
    if (checkInId && placeId) navigation.navigate(V2_ROUTES.VisitVerificationReview, { checkInId, placeId });
  }} />;
}

function VisitVerificationReviewRoute({ navigation, route }: V2ScreenProps<'VisitVerificationReview'>) {
  return <VisitVerificationReviewScreen checkInId={route.params.checkInId} onBack={navigation.goBack} onComplete={() => navigation.popTo(V2_ROUTES.Map)} placeId={route.params.placeId} />;
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
        <Stack.Screen name={V2_ROUTES.MyPage} component={MyPageRouteScreen} />
        <Stack.Screen name={V2_ROUTES.ProfileEdit} component={ProfileEditRouteScreen} />
        <Stack.Screen name={V2_ROUTES.Settings} component={SettingsRouteScreen} />
        <Stack.Screen name={V2_ROUTES.AccountManagement} component={AccountManagementRouteScreen} />
        <Stack.Screen name={V2_ROUTES.SettingsDetail} component={SettingsDetailRouteScreen} />
        <Stack.Screen name={V2_ROUTES.NotificationSettings} component={NotificationSettingsRoute} />
        <Stack.Screen name={V2_ROUTES.PlaceDetail} component={PlaceDetailScreen} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRoute} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
