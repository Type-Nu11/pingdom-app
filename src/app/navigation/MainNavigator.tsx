import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styled, { ThemeProvider } from 'styled-components/native';
import { useAuthStore } from '../store/authStore';
import MapScreen from '../../features/place/screens/MapScreen';
import CheckInScreen from '../../features/place/screens/CheckInScreen';
import CouponWalletScreen from '../../features/place/screens/CouponWalletScreen';
import ReservationDetailScreen from '../../v2/features/reservations/screens/ReservationDetailScreen';
import CreateReservationScreen from '../../v2/features/reservations/screens/CreateReservationScreen';
import MyPageScreen from '../../v2/features/my-page/screens/MyPageScreen';
import ProfileEditScreen from '../../v2/features/my-page/screens/ProfileEditScreen';
import VerifiedPlacesScreen from '../../v2/features/my-page/screens/VerifiedPlacesScreen';
import MerchantMyPageContainer from '../../v2/features/merchant-my-page/screens/MerchantMyPageContainer';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { theme as v2Theme } from '../../v2/shared/theme';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
} from '../../v2/features/place-visit-verification';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import { TemporaryAccountSessionApiCheckFlow } from '../../features/profile/dev/account-session-api-check';
import RoutePlaceholderScreen from './RoutePlaceholderScreen';
import { createFocusedPlaceMapParams } from './navigationIntent';
import {
  MAIN_ROUTES,
  parseCheckInId,
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
      <V2ScreenBoundary>
        <MapScreen
          initialSection={initialSection}
          openedBookmarkedPlaceId={focusedPlaceId ?? null}
          onClearOpenedBookmarkedPlace={clearFocusedPlace}
          onOpenProfile={() => navigation.navigate(MAIN_ROUTES.MyPage)}
          onCreateReservation={(place) => {
            const placeId = parsePlaceId(place.id);
            if (placeId) navigation.navigate(MAIN_ROUTES.CreateReservation, {
              category: place.category,
              imageUrl: place.imageUrl,
              placeId,
              placeName: place.name,
            });
          }}
          onOpenReservation={(value) => {
            const reservationId = parseReservationId(value);
            if (reservationId) {
              navigation.navigate(MAIN_ROUTES.ReservationDetail, { reservationId });
            }
          }}
          onOpenVisitVerification={() => navigation.navigate(MAIN_ROUTES.VisitVerificationPlaces)}
        />
      </V2ScreenBoundary>
    </MapRouteContainer>
  );
};

const ProfileRouteScreen = ({ navigation }: MainScreenProps<'Profile'>) => (
  <ProfileScreen
    onBack={navigation.goBack}
    onOpenBookmarkedPlace={(value) => {
      const mapParams = createFocusedPlaceMapParams(value);
      if (mapParams) {
        navigation.popTo(MAIN_ROUTES.Map, mapParams);
      }
    }}
    onOpenApiCheck={() => navigation.navigate(MAIN_ROUTES.ApiCheck)}
    onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
  />
);

const MyPageRouteScreen = ({ navigation }: MainScreenProps<'MyPage'>) => {
  const { profile } = useProfile();

  if (profile?.role === 'MERCHANT_OWNER') {
    return (
      <V2ScreenBoundary>
        <MerchantMyPageContainer
          onBack={navigation.goBack}
          onCreateEvent={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
          onEditAddress={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
          onEditBusinessHours={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
          onEditPhoneNumber={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
          onOpenAllReviews={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
          onOpenProfileEdit={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
          onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
          onOpenVerifiedPlaces={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
          userProfileImageUrl={profile.profileImageUrl}
          username={profile.username}
        />
      </V2ScreenBoundary>
    );
  }

  return (
    <V2ScreenBoundary>
      <MyPageScreen
        onBack={navigation.goBack}
        onOpenProfileEdit={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
        onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
        onOpenVerifiedPlaces={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
      />
    </V2ScreenBoundary>
  );
};

const ProfileEditRouteScreen = ({ navigation }: MainScreenProps<'ProfileEdit'>) => (
  <V2ScreenBoundary>
    <ProfileEditScreen onBack={navigation.goBack} />
  </V2ScreenBoundary>
);

const VerifiedPlacesRouteScreen = ({ navigation }: MainScreenProps<'VerifiedPlaces'>) => (
  <V2ScreenBoundary>
    <VerifiedPlacesScreen onBack={navigation.goBack} />
  </V2ScreenBoundary>
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

const MerchantRouteScreen = ({ navigation, route }: MainScreenProps<'Merchant'>) => (
  <RoutePlaceholderScreen
    description={`merchantId: ${route.params.merchantId}`}
    title="상점"
    onBack={navigation.goBack}
  />
);

const VisitVerificationPlacesRouteScreen = ({ navigation }: MainScreenProps<'VisitVerificationPlaces'>) => (
  <V2ScreenBoundary>
    <VisitVerificationPlacesScreen
      onBack={navigation.goBack}
      onSelectPlace={({ checkInId: value, placeId: placeValue }) => {
        const checkInId = parseCheckInId(value);
        const placeId = parsePlaceId(placeValue);
        if (checkInId && placeId) {
          navigation.navigate(MAIN_ROUTES.VisitVerificationReview, { checkInId, placeId });
        }
      }}
    />
  </V2ScreenBoundary>
);

const VisitVerificationReviewRouteScreen = ({ navigation, route }: MainScreenProps<'VisitVerificationReview'>) => (
  <V2ScreenBoundary>
    <VisitVerificationReviewScreen
      checkInId={route.params.checkInId}
      onBack={navigation.goBack}
      onComplete={() => navigation.popTo(MAIN_ROUTES.Map)}
      placeId={route.params.placeId}
    />
  </V2ScreenBoundary>
);

const MainNavigator = () => (
  <Stack.Navigator
    initialRouteName={MAIN_ROUTES.Map}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name={MAIN_ROUTES.Map} component={MapRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CheckIn} component={CheckInRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CouponWallet} component={CouponWalletRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CreateReservation} component={CreateReservationRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ReservationDetail} component={ReservationDetailRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.MyPage} component={MyPageRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ProfileEdit} component={ProfileEditRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VerifiedPlaces} component={VerifiedPlacesRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Profile} component={ProfileRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ApiCheck} component={ApiCheckRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Settings} component={SettingsRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Merchant} component={MerchantRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRouteScreen} />
  </Stack.Navigator>
);

export default MainNavigator;

const MapRouteContainer = styled.View`
  flex: 1;
`;
