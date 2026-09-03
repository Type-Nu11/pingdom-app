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
import CouponBoxScreen from '../../features/my-page/screens/CouponBoxScreen';
import CouponDetailContainer from '../../features/my-page/screens/CouponDetailContainer';
import MyPageScreen from '../../features/my-page/screens/MyPageScreen';
import ProfileEditScreen from '../../features/my-page/screens/ProfileEditScreen';
import PlaceListExampleScreen from '../../features/place-list/screens/PlaceListExampleScreen';
import PlaceDetailScreen from '../../features/place-detail/screens/PlaceDetailScreen';
import CreateReservationScreen from '../../features/reservations/screens/CreateReservationScreen';
import ReservationBoxScreen from '../../features/reservations/screens/ReservationBoxScreen';
import ReservationDetailScreen from '../../features/reservations/screens/ReservationDetailScreen';
import {
  AccountManagementScreen,
  SettingsDetailPendingScreen,
  SettingsScreen,
} from '../../features/settings';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
  VisitVerificationSessionScreen,
} from '../../features/place-visit-verification';
import { env } from '../../shared/config';
import { clearTokenSession } from '../../shared/auth/tokenSession';
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

function MapRouteScreen({ navigation }: V2ScreenProps<'Map'>) {
  return (
    <MapScreen
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

function VisitVerificationSessionRoute({ navigation, route }: V2ScreenProps<'VisitVerificationSession'>) {
  const commonProps = {
    onBack: navigation.goBack,
    onWriteReview: ({ checkInId: value, placeId: placeValue }: {
      checkInId: number;
      placeId: number;
    }) => {
      const checkInId = parseCheckInId(value);
      const placeId = parsePlaceId(placeValue);
      if (checkInId && placeId) {
        navigation.navigate(V2_ROUTES.VisitVerificationReview, { checkInId, placeId });
      }
    },
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
        <Stack.Screen name={V2_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRoute} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRoute} />
        <Stack.Screen name={V2_ROUTES.VisitVerificationSession} component={VisitVerificationSessionRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
