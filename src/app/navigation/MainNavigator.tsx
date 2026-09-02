import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styled, { ThemeProvider } from 'styled-components/native';
import { useAuthStore } from '../store/authStore';
import MapScreen from '../../v2/features/map/screens/MapScreen';
import CheckInScreen from '../../features/place/screens/CheckInScreen';
import ReservationDetailScreen from '../../v2/features/reservations/screens/ReservationDetailScreen';
import CreateReservationScreen from '../../v2/features/reservations/screens/CreateReservationScreen';
import CouponBoxScreen from '../../v2/features/my-page/screens/CouponBoxScreen';
import CouponDetailContainer from '../../v2/features/my-page/screens/CouponDetailContainer';
import MyPageScreen from '../../v2/features/my-page/screens/MyPageScreen';
import ProfileEditScreen from '../../v2/features/my-page/screens/ProfileEditScreen';
import VerifiedPlacesScreen from '../../v2/features/my-page/screens/VerifiedPlacesScreen';
import MerchantMyPageContainer from '../../v2/features/merchant-my-page/screens/MerchantMyPageContainer';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { theme as v2Theme } from '../../v2/shared/theme';
import { clearTokenSession } from '../../v2/shared/auth/tokenSession';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
  VisitVerificationSessionScreen,
} from '../../v2/features/place-visit-verification';
import SettingsScreen from '../../v2/features/settings/screens/SettingsScreen';
import RoutePlaceholderScreen from './RoutePlaceholderScreen';
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
  const isAuthHydrating = useAuthStore((state) => state.isHydrating);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
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
          canQueryBookmarks={isLoggedIn && !isAuthHydrating}
          initialSection={initialSection}
          openedBookmarkedPlaceId={focusedPlaceId ?? null}
          onClearOpenedBookmarkedPlace={clearFocusedPlace}
          onOpenProfile={() => navigation.navigate(MAIN_ROUTES.MyPage)}
          onOpenCoupons={() => navigation.navigate(MAIN_ROUTES.CouponBox)}
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
          onStartVisitVerification={(value) => {
            const placeId = parsePlaceId(value);
            if (placeId) {
              navigation.navigate(MAIN_ROUTES.VisitVerificationSession, { placeId });
            }
          }}
          onSignIn={() => void clearTokenSession()}
        />
      </V2ScreenBoundary>
    </MapRouteContainer>
  );
};

export const MyPageRouteScreen = ({ navigation }: Pick<MainScreenProps<'MyPage'>, 'navigation'> & Partial<Pick<MainScreenProps<'MyPage'>, 'route'>>) => {
  const { profile } = useProfile();
  const profileEditNavigationLock = useRef(false);
  const openProfileEdit = useCallback(() => {
    if (profileEditNavigationLock.current) return;
    profileEditNavigationLock.current = true;
    navigation.navigate(MAIN_ROUTES.ProfileEdit);
  }, [navigation]);

  useEffect(
    () => navigation.addListener('focus', () => {
      profileEditNavigationLock.current = false;
    }),
    [navigation],
  );

  if (profile?.role === 'MERCHANT_OWNER') {
    return (
      <V2ScreenBoundary>
        <MerchantMyPageContainer
          onBack={navigation.goBack}
          onCreateEvent={openProfileEdit}
          onEditAddress={openProfileEdit}
          onEditBusinessHours={openProfileEdit}
          onEditPhoneNumber={openProfileEdit}
          onOpenAllReviews={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
          onOpenProfileEdit={openProfileEdit}
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
        onOpenCoupons={() => navigation.navigate(MAIN_ROUTES.CouponBox)}
        onOpenProfileEdit={openProfileEdit}
        onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
        onOpenVerifiedPlaces={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
      />
    </V2ScreenBoundary>
  );
};

const ProfileAliasRouteScreen = ({ navigation }: MainScreenProps<'Profile'>) => (
  <MyPageRouteScreen navigation={navigation as MainScreenProps<'MyPage'>['navigation']} />
);

export const ProfileEditRouteScreen = ({ navigation }: MainScreenProps<'ProfileEdit'>) => (
  <V2ScreenBoundary>
    <ProfileEditScreen onBack={navigation.goBack} />
  </V2ScreenBoundary>
);

const VerifiedPlacesRouteScreen = ({ navigation }: MainScreenProps<'VerifiedPlaces'>) => (
  <V2ScreenBoundary>
    <VerifiedPlacesScreen onBack={navigation.goBack} />
  </V2ScreenBoundary>
);

export const SettingsRouteScreen = ({ navigation }: MainScreenProps<'Settings'>) => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <V2ScreenBoundary>
      <SettingsScreen
        onBack={navigation.goBack}
        onLogout={logout}
        onOpenProfileEdit={() => navigation.navigate(MAIN_ROUTES.ProfileEdit)}
      />
    </V2ScreenBoundary>
  );
};

const CheckInRouteScreen = ({ navigation, route }: MainScreenProps<'CheckIn'>) => (
  <CheckInScreen
    placeId={route.params.placeId}
    onBack={navigation.goBack}
  />
);

const CouponBoxRouteScreen = ({ navigation }: MainScreenProps<'CouponBox'>) => (
  <CouponBoxScreen
    onBack={navigation.goBack}
    onOpenCoupon={(coupon) => navigation.navigate(MAIN_ROUTES.CouponDetail, {
      coupon,
    })}
    onSignIn={() => void clearTokenSession()}
  />
);

const CouponDetailRouteScreen = ({ navigation, route }: MainScreenProps<'CouponDetail'>) => (
  <CouponDetailContainer
    coupon={route.params.coupon}
    onBack={navigation.goBack}
    onReserve={(placeId) => {
      const parsed = parsePlaceId(placeId);
      if (parsed) {
        navigation.navigate(MAIN_ROUTES.CreateReservation, { placeId: parsed });
      }
    }}
    onSignIn={() => void clearTokenSession()}
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

const MerchantRouteScreen = ({ navigation, route }: MainScreenProps<'Merchant'>) => {
  const { t } = useTranslation();
  return (
    <RoutePlaceholderScreen
      description={t('merchant.pendingDescription', { merchantId: route.params.merchantId })}
      title={t('merchant.title')}
      onBack={navigation.goBack}
    />
  );
};

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

const VisitVerificationSessionRouteScreen = ({ navigation, route }: MainScreenProps<'VisitVerificationSession'>) => (
  <V2ScreenBoundary>
    <VisitVerificationSessionScreen
      onBack={navigation.goBack}
      onWriteReview={({ checkInId: value, placeId: placeValue }) => {
        const checkInId = parseCheckInId(value);
        const placeId = parsePlaceId(placeValue);
        if (checkInId && placeId) {
          navigation.navigate(MAIN_ROUTES.VisitVerificationReview, { checkInId, placeId });
        }
      }}
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
    <Stack.Screen name={MAIN_ROUTES.CouponBox} component={CouponBoxRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CouponDetail} component={CouponDetailRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.CreateReservation} component={CreateReservationRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ReservationDetail} component={ReservationDetailRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.MyPage} component={MyPageRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.ProfileEdit} component={ProfileEditRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VerifiedPlaces} component={VerifiedPlacesRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Profile} component={ProfileAliasRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Settings} component={SettingsRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Merchant} component={MerchantRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.VisitVerificationSession} component={VisitVerificationSessionRouteScreen} />
  </Stack.Navigator>
);

export default MainNavigator;

const MapRouteContainer = styled.View`
  flex: 1;
`;
