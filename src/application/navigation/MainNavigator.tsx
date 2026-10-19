import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import { MapScreen } from '../../v2/modules/place/map';
import { CommunityDetailScreen, CommunityEditScreen, CommunityWriteScreen, useDiscardOnLeaveGuard } from '../../v2/modules/community';
import { ReservationDetailScreen } from '../../v2/modules/booking/reservations/routes';
import { ReservationBoxScreen } from '../../v2/modules/booking/reservations/routes';
import { CreateReservationScreen } from '../../v2/modules/booking/reservations/routes';
import { CouponBoxScreen } from '../../v2/modules/user/profile/my-page';
import { CouponDetailContainer } from '../../v2/modules/user/profile/my-page';
import { MyPageScreen, MyReviewScreen, MyReviewEditScreen } from '../../v2/modules/user/profile/my-page';
import { ProfileEditScreen } from '../../v2/modules/user/profile';
import { VerifiedPlacesScreen } from '../../v2/modules/user/profile/my-page';
import { MerchantMyPageContainer } from '../../v2/modules/merchant';
import { useProfile } from '../../v2/modules/user/profile';
import { clearTokenSession } from '../../v2/shared/auth/tokenSession';
import { UnsupportedFeatureScreen } from '../../v2/shared/components';
import {
  VisitVerificationPlacesScreen,
  VisitVerificationReviewScreen,
  useForegroundVisitVerification,
  useVisitVerificationCandidates,
} from '../../v2/modules/place/visit-verification';
import { AccountManagementScreen, SettingsDetailScreen, SETTINGS_DETAIL_IDS } from '../../v2/modules/user/settings';
import { useSettingsDetailRedirect, useSettingsNavigation } from '../../v2/modules/user/settings';
import { SettingsScreen } from '../../v2/modules/user/settings';
import {
  MAIN_ROUTES,
  parseCheckInId,
  parsePlaceId,
  parsePostId,
  parseReservationId,
  type MainScreenProps,
  type MainStackParamList,
} from './types';

/** Existing session selectors and unsupported routes are injected without V1 imports. */
export interface MainNavigationRuntime {
  useAuthStore: <T>(selector: (state: {
    isHydrating: boolean;
    isLoggedIn: boolean;
    logout: () => Promise<void>;
  }) => T) => T;
  CheckInScreen: React.ComponentType<{ placeId: number; onBack: () => void }>;
  RoutePlaceholderScreen: React.ComponentType<{ description: string; title: string; onBack: () => void }>;
}

/** Called once by the explicit legacy bridge, never during render. */
export function createProductionMainNavigator({
  useAuthStore, CheckInScreen, RoutePlaceholderScreen,
}: MainNavigationRuntime) {
  const Stack = createNativeStackNavigator<MainStackParamList>();

  const V2ScreenBoundary = ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  );

  const MapRouteScreen = ({ navigation, route }: MainScreenProps<'Map'>) => {
    const isAuthHydrating = useAuthStore((state) => state.isHydrating);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const { profile } = useProfile();
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
            onEditReview={(reviewId) => navigation.navigate(MAIN_ROUTES.MyReviewEdit, { reviewId })}
            onNavigateAssistantPage={(target) => {
              if (!isLoggedIn || isAuthHydrating) return false;
              if (target.page === 'reservations') navigation.navigate(MAIN_ROUTES.ReservationBox);
              else if (target.page === 'myPage') navigation.navigate(MAIN_ROUTES.MyPage);
              else if (target.page === 'settings') navigation.navigate(MAIN_ROUTES.Settings);
              else if (target.page === 'coupons') navigation.navigate(MAIN_ROUTES.CouponBox);
              else if (target.page === 'verifiedPlaces') {
                if (!profile || profile.role === 'MERCHANT_OWNER') return false;
                navigation.navigate(MAIN_ROUTES.VerifiedPlaces);
              } else if (target.page === 'accountManagement') navigation.navigate(MAIN_ROUTES.AccountManagement);
              else if (target.page === 'notificationSettings') navigation.navigate(MAIN_ROUTES.NotificationSettings);
              else if (target.page === 'loginInformation' || target.page === 'locationSettings'
                || target.page === 'privacySettings' || target.page === 'dataManagement') {
                navigation.navigate(MAIN_ROUTES.SettingsDetail, { detail: target.page });
              } else if (target.page === 'communityPost') {
                const postId = parsePostId(target.postId);
                if (!postId) return false;
                navigation.navigate(MAIN_ROUTES.CommunityDetail, { postId });
              }
              else if (target.page === 'createReservation') {
                const placeId = parsePlaceId(target.placeId);
                if (!placeId) return false;
                navigation.navigate(MAIN_ROUTES.CreateReservation, { placeId });
              } else if (target.page === 'placeDetail') {
                const placeId = parsePlaceId(target.placeId);
                if (!placeId) return false;
                navigation.navigate(MAIN_ROUTES.Map, { focusedPlaceId: placeId });
              } else return false;
              return true;
            }}
            canQueryBookmarks={isLoggedIn && !isAuthHydrating}
            canQueryRankedFeeds={isLoggedIn && !isAuthHydrating}
            initialSection={initialSection}
            openedBookmarkedPlaceId={focusedPlaceId ?? null}
            onClearOpenedBookmarkedPlace={clearFocusedPlace}
            onOpenCommunityPost={(value) => {
              const postId = parsePostId(value);
              if (postId) navigation.navigate(MAIN_ROUTES.CommunityDetail, { postId });
            }}
            onOpenCommunityWrite={(categoryId) => navigation.navigate(
              MAIN_ROUTES.CommunityWrite,
              categoryId ? { initialCategoryId: categoryId } : undefined,
            )}
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
            onOpenVisitVerification={() => navigation.navigate(
              MAIN_ROUTES.VisitVerificationPlaces,
            )}
            onStartVisitVerification={(value) => {
              const placeId = parsePlaceId(value);
              if (placeId) {
                navigation.navigate(MAIN_ROUTES.VisitVerificationPlaces);
              }
            }}
            onSignIn={() => void clearTokenSession()}
          />
        </V2ScreenBoundary>
      </MapRouteContainer>
    );
  };

  const MyPageRouteScreen = ({ navigation }: Pick<MainScreenProps<'MyPage'>, 'navigation'> & Partial<Pick<MainScreenProps<'MyPage'>, 'route'>>) => {
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
            onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
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
          onOpenReview={(reviewId) => navigation.navigate(MAIN_ROUTES.MyReview, { reviewId })}
          onOpenReservations={() => navigation.navigate(MAIN_ROUTES.ReservationBox)}
          onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
          onOpenVerifiedPlaces={() => navigation.navigate(MAIN_ROUTES.VerifiedPlaces)}
        />
      </V2ScreenBoundary>
    );
  };

  const CommunityDetailRouteScreen = ({ navigation, route }: MainScreenProps<'CommunityDetail'>) => (
    <V2ScreenBoundary>
      <CommunityDetailScreen
        onEditPost={(value) => { const postId = parsePostId(value); if (postId) navigation.navigate(MAIN_ROUTES.CommunityEdit, { postId }); }}
        onBack={navigation.goBack}
        onOpenPlace={(value) => {
          const placeId = parsePlaceId(value);
          if (placeId) navigation.navigate(MAIN_ROUTES.Map, { focusedPlaceId: placeId });
        }}
        onSignIn={() => void clearTokenSession()}
        postId={route.params.postId}
      />
    </V2ScreenBoundary>
  );

  const CommunityWriteRouteScreen = ({ navigation, route }: MainScreenProps<'CommunityWrite'>) => {
    const hasUnsavedInput = useDiscardOnLeaveGuard(navigation);

    return (
      <V2ScreenBoundary>
        <CommunityWriteScreen
          initialCategoryId={route.params?.initialCategoryId}
          onBack={navigation.goBack}
          onDirtyChange={(dirty) => { hasUnsavedInput.current = dirty; }}
          onSignIn={() => void clearTokenSession()}
          onSubmitSuccess={({ postId }) => {
            const parsedPostId = parsePostId(postId);
            hasUnsavedInput.current = false;
            if (parsedPostId) navigation.replace(MAIN_ROUTES.CommunityDetail, { postId: parsedPostId });
            else navigation.goBack();
          }}
        />
      </V2ScreenBoundary>
    );
  };

  const ProfileAliasRouteScreen = ({ navigation }: MainScreenProps<'Profile'>) => (
    <MyPageRouteScreen navigation={navigation as MainScreenProps<'MyPage'>['navigation']} />
  );

  const ProfileEditRouteScreen = ({ navigation }: MainScreenProps<'ProfileEdit'>) => {
    const { profile } = useProfile();

    return (
      <V2ScreenBoundary>
        {profile?.role === 'MERCHANT_OWNER' ? (
          <UnsupportedFeatureScreen onBack={navigation.goBack} />
        ) : profile ? (
          <ProfileEditScreen onBack={navigation.goBack} />
        ) : null}
      </V2ScreenBoundary>
    );
  };

  const VerifiedPlacesRouteScreen = ({ navigation }: MainScreenProps<'VerifiedPlaces'>) => {
    const { profile } = useProfile();

    return (
      <V2ScreenBoundary>
        {profile?.role === 'MERCHANT_OWNER' ? (
          <UnsupportedFeatureScreen onBack={navigation.goBack} />
        ) : profile ? (
          <VerifiedPlacesScreen
            onBack={navigation.goBack}
            onOpenReview={(reviewId) => navigation.navigate(MAIN_ROUTES.MyReview, { reviewId })}
          />
        ) : null}
      </V2ScreenBoundary>
    );
  };

  const CommunityEditRouteScreen = ({ navigation, route }: MainScreenProps<'CommunityEdit'>) => {
    const dirty = useDiscardOnLeaveGuard(navigation);
    return <CommunityEditScreen postId={route.params.postId} onBack={navigation.goBack} onDirtyChange={value => { dirty.current = value; }} />;
  };
  const MyReviewEditRouteScreen = ({ navigation, route }: MainScreenProps<'MyReviewEdit'>) => {
    const dirty = useDiscardOnLeaveGuard(navigation);
    return <MyReviewEditScreen reviewId={route.params.reviewId} onBack={navigation.goBack} onDirtyChange={value => { dirty.current = value; }} />;
  };

  const MyReviewRouteScreen = ({ navigation, route }: MainScreenProps<'MyReview'>) => (
    <V2ScreenBoundary><MyReviewScreen onBack={navigation.goBack} reviewId={route.params.reviewId} onEdit={(reviewId) => navigation.navigate(MAIN_ROUTES.MyReviewEdit, { reviewId })} /></V2ScreenBoundary>
  );

  const SettingsRouteScreen = ({ navigation }: MainScreenProps<'Settings'>) => {
    const logout = useAuthStore((state) => state.logout);
    const openDetail = useSettingsNavigation(navigation);

    return (
      <V2ScreenBoundary>
        <SettingsScreen
          onBack={navigation.goBack}
          onLogout={logout}
          onOpenDetail={openDetail}
          onOpenAccountManagement={() => openDetail(SETTINGS_DETAIL_IDS.AccountManagement)}
          onOpenNotificationSettings={() => openDetail(SETTINGS_DETAIL_IDS.NotificationSettings)}
          onOpenProfileEdit={() => openDetail(SETTINGS_DETAIL_IDS.ProfileEdit)}
        />
      </V2ScreenBoundary>
    );
  };

  const AccountManagementRouteScreen = ({ navigation }: MainScreenProps<'AccountManagement'>) => {
    const logout = useAuthStore((state) => state.logout);
    const openDetail = useSettingsNavigation(navigation);
    return <AccountManagementScreen onBack={navigation.goBack} onLogout={logout} onOpenDetail={openDetail} />;
  };

  const SettingsDetailRouteScreen = ({ navigation, route }: MainScreenProps<'SettingsDetail'>) => {
    const redirecting = useSettingsDetailRedirect(navigation, route.params.detail);
    return redirecting ? null : <SettingsDetailScreen detail={route.params.detail} onBack={navigation.goBack} />;
  };

  const NotificationSettingsRouteScreen = ({ navigation }: MainScreenProps<'NotificationSettings'>) => (
    <SettingsScreen initialPage="notifications" onBack={navigation.goBack} />
  );

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

  const ReservationBoxRouteScreen = ({ navigation }: MainScreenProps<'ReservationBox'>) => (
    <V2ScreenBoundary>
      <ReservationBoxScreen
        onBack={navigation.goBack}
        onOpenReservation={(value) => {
          const reservationId = parseReservationId(value);
          if (reservationId) navigation.navigate(MAIN_ROUTES.ReservationDetail, { reservationId });
        }}
        onOpenSettings={() => navigation.navigate(MAIN_ROUTES.Settings)}
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

  const VisitVerificationSessionRouteScreen = ({
    navigation,
  }: MainScreenProps<'VisitVerificationSession'>) => {
    useEffect(() => { navigation.replace(MAIN_ROUTES.VisitVerificationPlaces); }, [navigation]);
    return null;
  };

  const MainNavigator = () => (
    <>
    <ForegroundVisitVerification />
    <Stack.Navigator
      initialRouteName={MAIN_ROUTES.Map}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={MAIN_ROUTES.Map} component={MapRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CheckIn} component={CheckInRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CommunityDetail} component={CommunityDetailRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CommunityWrite} component={CommunityWriteRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CommunityEdit} component={CommunityEditRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.MyReviewEdit} component={MyReviewEditRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CouponBox} component={CouponBoxRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CouponDetail} component={CouponDetailRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.CreateReservation} component={CreateReservationRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.ReservationBox} component={ReservationBoxRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.ReservationDetail} component={ReservationDetailRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.MyPage} component={MyPageRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.ProfileEdit} component={ProfileEditRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.VerifiedPlaces} component={VerifiedPlacesRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.MyReview} component={MyReviewRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.Profile} component={ProfileAliasRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.Settings} component={SettingsRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.AccountManagement} component={AccountManagementRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.SettingsDetail} component={SettingsDetailRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.NotificationSettings} component={NotificationSettingsRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.Merchant} component={MerchantRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.VisitVerificationPlaces} component={VisitVerificationPlacesRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.VisitVerificationReview} component={VisitVerificationReviewRouteScreen} />
      <Stack.Screen name={MAIN_ROUTES.VisitVerificationSession} component={VisitVerificationSessionRouteScreen} />
    </Stack.Navigator>
    </>
  );

  return { MainNavigator, MapRouteScreen, MyPageRouteScreen, ProfileEditRouteScreen, VerifiedPlacesRouteScreen, SettingsRouteScreen, AccountManagementRouteScreen, SettingsDetailRouteScreen, NotificationSettingsRouteScreen };
}

function ForegroundVisitVerification() {
  useForegroundVisitVerification();
  useVisitVerificationCandidates();
  return null;
}

const MapRouteContainer = styled.View`
  flex: 1;
`;
