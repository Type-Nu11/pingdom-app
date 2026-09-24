import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useFcmTokenSync } from '../../modules/user/notifications/lifecycle';
import { useForegroundNotifications } from '../../modules/user/notifications/lifecycle';
import { useNotificationOpenSync } from '../../modules/user/notifications/lifecycle';
import type { NotificationRoute } from '../../modules/user/notifications/routing';
import { useSettingsDetailRedirect, useSettingsNavigation } from '../../modules/user/settings';
import HomeScreen from '../home/screens/HomeScreen';
import { MapScreen } from '../../modules/place/map';
import { RoutePlannerScreen } from '../../modules/place/map/routes';
import { CouponBoxScreen } from '../../modules/user/profile/my-page';
import { CouponDetailContainer } from '../../modules/user/profile/my-page';
import { MyPageScreen } from '../../modules/user/profile/my-page';
import { ProfileEditScreen } from '../../modules/user/profile';
import { PlaceListExampleScreen } from '../../modules/place/search';
import { PlaceDetailScreen } from '../../modules/place/detail';
import { CreateReservationScreen } from '../../modules/booking/reservations/routes';
import { ReservationBoxScreen } from '../../modules/booking/reservations/routes';
import { ReservationDetailScreen } from '../../modules/booking/reservations/routes';
import {
  AccountManagementScreen,
  SettingsDetailScreen,
  SETTINGS_DETAIL_IDS,
  SettingsScreen,
} from '../../modules/user/settings';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
  VisitVerificationSessionScreen,
} from '../../modules/place/visit-verification';
import { env } from '../../shared/config';
import { clearTokenSession } from '../../shared/auth/tokenSession';
import {
  claimNotificationMessage,
  createNotificationNavigationIntent,
} from './notificationIntent';
import { V2_ROUTES, parseCheckInId, parsePlaceId, type V2ScreenProps, type V2StackParamList } from './types';
import { useAndroidBackHandler } from './useAndroidBackHandler';
import { useAppNavigationTheme } from '../../shared/theme';
import { useStartupPermissions } from '../permissions/useStartupPermissions';

const Stack = createNativeStackNavigator<V2StackParamList>();
const navigationRef = createNavigationContainerRef<V2StackParamList>();

function HomeRouteScreen() {
  return env.featureFlags.placeList ? <PlaceListExampleScreen /> : <HomeScreen />;
}

function MapRouteScreen({ navigation }: V2ScreenProps<'Map'>) {
  return (
    <MapScreen
      onOpenDirections={(destination) => navigation.navigate(V2_ROUTES.RoutePlanner, { destination })}
      onOpenCoupons={() => navigation.navigate(V2_ROUTES.CouponBox)}
      onOpenVisitVerification={() => navigation.navigate(
        V2_ROUTES.VisitVerificationSession,
        { mode: 'foreground' },
      )}
      onStartVisitVerification={(value) => {
        const placeId = parsePlaceId(value);
        if (placeId) navigation.navigate(V2_ROUTES.VisitVerificationSession, {
          mode: 'place',
          placeId,
        });
      }}
      onSignIn={() => void clearTokenSession()}
    />
  );
}

function MyPageRouteScreen({ navigation }: V2ScreenProps<'MyPage'>) {
  return (
    <MyPageScreen
      onBack={navigation.goBack}
      onOpenCoupons={() => navigation.navigate(V2_ROUTES.CouponBox)}
      onOpenProfileEdit={() => navigation.navigate(V2_ROUTES.ProfileEdit)}
      onOpenPlace={(value) => {
        const placeId = parsePlaceId(value);
        if (placeId) navigation.navigate(V2_ROUTES.PlaceDetail, { placeId });
      }}
      onOpenReservations={() => navigation.navigate(V2_ROUTES.ReservationBox)}
      onOpenSettings={() => navigation.navigate(V2_ROUTES.Settings)}
      onOpenVerifiedPlaces={() => {}}
    />
  );
}

function CouponBoxRouteScreen({ navigation }: V2ScreenProps<'CouponBox'>) {
  return (
    <CouponBoxScreen
      onBack={navigation.goBack}
      onOpenCoupon={(coupon) => navigation.navigate(V2_ROUTES.CouponDetail, {
        couponId: coupon.id,
      })}
      onSignIn={() => void clearTokenSession()}
    />
  );
}

function ReservationBoxRoute({ navigation }: V2ScreenProps<'ReservationBox'>) {
  return (
    <ReservationBoxScreen
      onBack={navigation.goBack}
      onOpenReservation={(reservationId) => navigation.navigate(
        V2_ROUTES.ReservationDetail,
        { reservationId },
      )}
      onOpenSettings={() => navigation.navigate(V2_ROUTES.Settings)}
    />
  );
}

function ReservationDetailRoute({ navigation, route }: V2ScreenProps<'ReservationDetail'>) {
  return (
    <ReservationDetailScreen
      onBack={navigation.goBack}
      reservationId={route.params.reservationId}
    />
  );
}

function CouponDetailRoute({ navigation, route }: V2ScreenProps<'CouponDetail'>) {
  return (
    <CouponDetailContainer
      couponId={route.params.couponId}
      onBack={navigation.goBack}
      onReserve={(placeId) => {
        const parsed = parsePlaceId(placeId);
        if (parsed) {
          navigation.navigate(V2_ROUTES.CreateReservation, { placeId: parsed });
        }
      }}
      onSignIn={() => void clearTokenSession()}
    />
  );
}

export function SettingsRouteScreen({ navigation }: V2ScreenProps<'Settings'>) {
  const openDetail = useSettingsNavigation(navigation);
  return (
    <SettingsScreen
      onBack={navigation.goBack}
      onLogout={clearTokenSession}
      onOpenAccountManagement={() => openDetail(SETTINGS_DETAIL_IDS.AccountManagement)}
      onOpenDetail={openDetail}
      onOpenNotificationSettings={() => openDetail(SETTINGS_DETAIL_IDS.NotificationSettings)}
      onOpenProfileEdit={() => openDetail(SETTINGS_DETAIL_IDS.ProfileEdit)}
    />
  );
}

function ProfileEditRouteScreen({ navigation }: V2ScreenProps<'ProfileEdit'>) {
  return <ProfileEditScreen onBack={navigation.goBack} />;
}

export function AccountManagementRouteScreen({ navigation }: V2ScreenProps<'AccountManagement'>) {
  const openDetail = useSettingsNavigation(navigation);
  return (
    <AccountManagementScreen
      onLogout={clearTokenSession}
      onBack={navigation.goBack}
      onOpenDetail={openDetail}
    />
  );
}

function SettingsDetailRouteScreen({ navigation, route }: V2ScreenProps<'SettingsDetail'>) {
  const redirecting = useSettingsDetailRedirect(navigation, route.params.detail);
  if (redirecting) return null;
  return (
    <SettingsDetailScreen
      detail={route.params.detail}
      onBack={navigation.goBack}
    />
  );
}

function NotificationSettingsRoute({ navigation }: V2ScreenProps<'NotificationSettings'>) {
  return <SettingsScreen initialPage="notifications" onBack={navigation.goBack} />;
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

function VisitVerificationSessionRoute({ navigation, route }: V2ScreenProps<'VisitVerificationSession'>) {
  const commonProps = {
    onBack: navigation.goBack,
    onComplete: () => navigation.replace(V2_ROUTES.VisitVerificationPlaces),
  };
  return route.params.mode === 'foreground' ? (
    <VisitVerificationSessionScreen mode="foreground" {...commonProps} />
  ) : (
    <VisitVerificationSessionScreen
      mode="place"
      placeId={route.params.placeId}
      {...commonProps}
    />
  );
}

export default function RootNavigator() {
  const navigationTheme = useAppNavigationTheme();
  const startupPermissions = useStartupPermissions();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<NotificationRoute | null>(null);
  const handledMessageIds = useRef(new Set<string>());

  useAndroidBackHandler(navigationRef);

  const handleNotificationOpen = useCallback((route: NotificationRoute) => {
    setPendingRoute(route);
  }, []);

  useFcmTokenSync(startupPermissions.ready && startupPermissions.notificationsGranted);
  useForegroundNotifications(startupPermissions.ready && startupPermissions.notificationsGranted);
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

  if (!startupPermissions.ready) {
    return <View style={{ flex: 1, backgroundColor: navigationTheme.colors.background }} />;
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} onReady={() => setIsNavigationReady(true)}>
      <Stack.Navigator initialRouteName={V2_ROUTES.Map} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={V2_ROUTES.CreateReservation} component={CreateReservationScreen} />
        <Stack.Screen name={V2_ROUTES.Map} component={MapRouteScreen} />
        <Stack.Screen name={V2_ROUTES.Home} component={HomeRouteScreen} />
        <Stack.Screen name={V2_ROUTES.MyPage} component={MyPageRouteScreen} />
        <Stack.Screen name={V2_ROUTES.CouponBox} component={CouponBoxRouteScreen} />
        <Stack.Screen name={V2_ROUTES.CouponDetail} component={CouponDetailRoute} />
        <Stack.Screen name={V2_ROUTES.ReservationBox} component={ReservationBoxRoute} />
        <Stack.Screen name={V2_ROUTES.ReservationDetail} component={ReservationDetailRoute} />
        <Stack.Screen name={V2_ROUTES.ProfileEdit} component={ProfileEditRouteScreen} />
        <Stack.Screen name={V2_ROUTES.Settings} component={SettingsRouteScreen} />
        <Stack.Screen name={V2_ROUTES.AccountManagement} component={AccountManagementRouteScreen} />
        <Stack.Screen name={V2_ROUTES.SettingsDetail} component={SettingsDetailRouteScreen} />
        <Stack.Screen name={V2_ROUTES.NotificationSettings} component={NotificationSettingsRoute} />
        <Stack.Screen name={V2_ROUTES.PlaceDetail} component={PlaceDetailScreen} />
        <Stack.Screen name={V2_ROUTES.RoutePlanner} component={RoutePlannerScreen} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRoute} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRoute} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationSession} component={VisitVerificationSessionRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
