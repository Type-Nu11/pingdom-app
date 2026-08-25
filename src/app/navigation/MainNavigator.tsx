import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import styled, { ThemeProvider } from 'styled-components/native';
import { useAuthStore } from '../store/authStore';
import MapScreen from '../../features/place/screens/MapScreen';
import CheckInScreen from '../../features/place/screens/CheckInScreen';
import CouponWalletScreen from '../../features/place/screens/CouponWalletScreen';
import ReservationDetailScreen from '../../v2/features/reservations/screens/ReservationDetailScreen';
import CreateReservationScreen from '../../v2/features/reservations/screens/CreateReservationScreen';
import VerificationScreen from '../../v2/features/reservations/screens/VerificationScreen';
import VerificationReviewScreen from '../../v2/features/reservations/screens/VerificationReviewScreen';
import PlaceReportEntryButton from '../../v2/features/place-report/components/PlaceReportEntryButton';
import PlaceReportFlowScreen from '../../v2/features/place-report/screens/PlaceReportFlowScreen';
import { theme as v2Theme } from '../../v2/shared/theme';
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

const V2ScreenBoundary = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider theme={v2Theme}>{children}</ThemeProvider>
);

export const MapRouteScreen = ({ navigation, route }: MainScreenProps<'Map'>) => {
  const { t } = useTranslation();
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
    <MapRouteContainer>
      <MapScreen
        initialSection={initialSection}
        notificationLikeContext={notificationContext ? {
          notificationsId: notificationContext.notificationId?.toString(),
          postId: notificationContext.postId?.toString(),
        } : null}
        openedBookmarkedPlaceId={focusedPlaceId ?? null}
        onClearOpenedBookmarkedPlace={clearFocusedPlace}
        onOpenProfile={() => navigation.navigate(MAIN_ROUTES.Profile)}
        onCreateReservation={(place) => {
          const placeId = parsePlaceId(place.id);
          if (placeId) navigation.navigate(MAIN_ROUTES.CreateReservation, {
            category: place.category,
            imageUrl: place.imageUrl,
            placeId,
            placeName: place.name,
          });
        }}
        onOpenVerification={() => navigation.navigate(MAIN_ROUTES.Verification)}
        onOpenReservation={(value) => {
          const reservationId = parseReservationId(value);
          if (reservationId) {
            navigation.navigate(MAIN_ROUTES.ReservationDetail, { reservationId });
          }
        }}
      />
      <V2ScreenBoundary>
        <CurrentMapPlaceReportEntry
          label={t('placeReport.mapEntry')}
          onPress={() => navigation.navigate(MAIN_ROUTES.PlaceReport)}
          testID="current-map-place-report"
        />
      </V2ScreenBoundary>
    </MapRouteContainer>
  );
};

const PlaceReportRouteScreen = ({ navigation }: MainScreenProps<'PlaceReport'>) => (
  <V2ScreenBoundary>
    <PlaceReportFlowScreen navigation={navigation} />
  </V2ScreenBoundary>
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
  <V2ScreenBoundary>
    <ReservationDetailScreen
      onBack={navigation.goBack}
      reservationId={route.params.reservationId}
    />
  </V2ScreenBoundary>
);

const CreateReservationRouteScreen = ({
  navigation,
  route,
}: MainScreenProps<'CreateReservation'>) => (
  <V2ScreenBoundary>
    <CreateReservationScreen navigation={navigation} route={route} />
  </V2ScreenBoundary>
);

const VerificationRouteScreen = ({ navigation }: MainScreenProps<'Verification'>) => (
  <V2ScreenBoundary>
    <VerificationScreen
      onBack={navigation.goBack}
      onOpenPlace={(place) => navigation.navigate(MAIN_ROUTES.VerificationReview, place)}
    />
  </V2ScreenBoundary>
);

const VerificationReviewRouteScreen = ({
  navigation,
  route,
}: MainScreenProps<'VerificationReview'>) => (
  <V2ScreenBoundary>
    <VerificationReviewScreen
      category={route.params.category}
      imageUrl={route.params.imageUrl}
      onBack={navigation.goBack}
      placeName={route.params.placeName}
    />
  </V2ScreenBoundary>
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
    <Stack.Screen name={MAIN_ROUTES.PlaceReport} component={PlaceReportRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CheckIn} component={CheckInRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CouponWallet} component={CouponWalletRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CreateReservation} component={CreateReservationRouteScreen} />
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

const MapRouteContainer = styled.View`
  flex: 1;
`;

const CurrentMapPlaceReportEntry = styled(PlaceReportEntryButton)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md}px;
  top: 45%;
`;
