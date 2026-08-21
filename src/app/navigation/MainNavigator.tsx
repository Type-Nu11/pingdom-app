import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import MapScreen from '../../features/place/screens/MapScreen';
import PlaceCreateFlowScreen from '../../features/place/screens/PlaceCreateFlowScreen';
import PlaceDetailScreen from '../../features/place/screens/PlaceDetailScreen';
import CheckInScreen from '../../features/place/screens/CheckInScreen';
import CouponWalletScreen from '../../features/place/screens/CouponWalletScreen';
import ReservationDetailScreen from '../../features/reservation/screens/ReservationDetailScreen';
import VerificationScreen from '../../features/reservation/screens/VerificationScreen';
import VerificationReviewScreen from '../../features/reservation/screens/VerificationReviewScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import { TemporaryAccountSessionApiCheckFlow } from '../../features/profile/dev/account-session-api-check';
import RoutePlaceholderScreen from './RoutePlaceholderScreen';
import { createFocusedPlaceMapParams } from './navigationIntent';
import {
  MAIN_ROUTES,
  parsePlaceId,
  parseReservationId,
  type MainScreenProps,
  type MainStackParamList,
} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MapRouteScreen = ({ navigation, route }: MainScreenProps<'Map'>) => {
  const focusedPlaceId = route.params?.focusedPlaceId;
  const initialSection = route.params?.initialSection;
  const notificationContext = route.params?.notificationContext;
  const clearFocusedPlace = useCallback(() => {
    navigation.setParams({
      focusedPlaceId: undefined,
      initialSection,
      notificationContext,
    });
  }, [initialSection, navigation, notificationContext]);

  return (
    <MapScreen
      initialSection={initialSection}
      notificationLikeContext={notificationContext ? {
        notificationsId: notificationContext.notificationId?.toString(),
        postId: notificationContext.postId?.toString(),
      } : null}
      openedBookmarkedPlaceId={focusedPlaceId ?? null}
      onClearOpenedBookmarkedPlace={clearFocusedPlace}
      onOpenPlaceDetail={(value) => {
        const placeId = parsePlaceId(value);
        if (placeId) {
          navigation.navigate(MAIN_ROUTES.PlaceDetail, { placeId });
        }
      }}
      onOpenProfile={() => navigation.navigate(MAIN_ROUTES.Profile)}
      onOpenVerification={() => navigation.navigate(MAIN_ROUTES.Verification)}
      onOpenReservation={(value) => {
        const reservationId = parseReservationId(value);
        if (reservationId) {
          navigation.navigate(MAIN_ROUTES.ReservationDetail, { reservationId });
        }
      }}
    />
  );
};

const PlaceCreateRouteScreen = ({ navigation }: MainScreenProps<'PlaceCreate'>) => (
  <PlaceCreateFlowScreen onClose={navigation.goBack} />
);

const PlaceDetailRouteScreen = ({
  navigation,
  route,
}: MainScreenProps<'PlaceDetail'>) => (
  <PlaceDetailScreen
    notificationBody={route.params.notificationContext?.body}
    notificationTitle={route.params.notificationContext?.title}
    placeId={String(route.params.placeId)}
    onBack={navigation.goBack}
    onCheckIn={() => navigation.navigate(MAIN_ROUTES.CheckIn, { placeId: route.params.placeId })}
    onCoupon={() => navigation.navigate(MAIN_ROUTES.CouponWallet)}
  />
);

const ProfileRouteScreen = ({ navigation, route }: MainScreenProps<'Profile'>) => (
  <ProfileScreen
    initialTab={route.params?.initialTab}
    onBack={navigation.goBack}
    onOpenBookmarkedPost={(value) => {
      const mapParams = createFocusedPlaceMapParams(value);
      if (mapParams) {
        navigation.popTo(MAIN_ROUTES.Map, mapParams);
      }
    }}
    onOpenApiCheck={() => navigation.navigate(MAIN_ROUTES.ApiCheck)}
    onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
  />
);

const SettingsRouteScreen = ({ navigation }: MainScreenProps<'Settings'>) => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SettingsScreen
      onBack={navigation.goBack}
      onLogout={logout}
    />
  );
};

const ApiCheckRouteScreen = ({ navigation }: MainScreenProps<'ApiCheck'>) => (
  // TEMPORARY device-QA flow for the #161, #165, #166, and #168 endpoints.
  <TemporaryAccountSessionApiCheckFlow onExit={navigation.goBack} />
);

const CheckInRouteScreen = ({ navigation, route }: MainScreenProps<'CheckIn'>) => (
  <CheckInScreen
    placeId={route.params.placeId}
    onBack={navigation.goBack}
  />
);

const CouponWalletRouteScreen = ({ navigation }: MainScreenProps<'CouponWallet'>) => (
  <CouponWalletScreen
    onBack={navigation.goBack}
    onExplore={() => navigation.popTo(MAIN_ROUTES.Map)}
  />
);

const ReservationDetailRouteScreen = ({
  navigation,
  route,
}: MainScreenProps<'ReservationDetail'>) => (
  <ReservationDetailScreen
    onBack={navigation.goBack}
    reservationId={route.params.reservationId}
  />
);

const VerificationRouteScreen = ({ navigation }: MainScreenProps<'Verification'>) => (
  <VerificationScreen
    onBack={navigation.goBack}
    onOpenPlace={(place) => navigation.navigate(MAIN_ROUTES.VerificationReview, place)}
  />
);

const VerificationReviewRouteScreen = ({
  navigation,
  route,
}: MainScreenProps<'VerificationReview'>) => (
  <VerificationReviewScreen
    category={route.params.category}
    imageUrl={route.params.imageUrl}
    onBack={navigation.goBack}
    placeName={route.params.placeName}
  />
);

const MerchantRouteScreen = ({ navigation, route }: MainScreenProps<'Merchant'>) => (
  <RoutePlaceholderScreen
    description={`merchantId: ${route.params.merchantId}`}
    title="상점"
    onBack={navigation.goBack}
  />
);

const MainNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.Map}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name={MAIN_ROUTES.Map} component={MapRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.PlaceCreate} component={PlaceCreateRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.PlaceDetail} component={PlaceDetailRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CheckIn} component={CheckInRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CouponWallet} component={CouponWalletRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ReservationDetail} component={ReservationDetailRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Verification} component={VerificationRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VerificationReview} component={VerificationReviewRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Profile} component={ProfileRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ApiCheck} component={ApiCheckRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Settings} component={SettingsRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Merchant} component={MerchantRouteScreen} />
  </Stack.Navigator>
);

export default MainNavigator;
