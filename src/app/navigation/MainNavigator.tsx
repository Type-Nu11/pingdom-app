import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import MapScreen from '../../features/place/screens/MapScreen';
import PlaceCreateFlowScreen from '../../features/place/screens/PlaceCreateFlowScreen';
import PlaceDetailScreen from '../../features/place/screens/PlaceDetailScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import RoutePlaceholderScreen from './RoutePlaceholderScreen';
import {
  MAIN_ROUTES,
  parsePlaceId,
  type MainScreenProps,
  type MainStackParamList,
} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MapRouteScreen = ({ navigation, route }: MainScreenProps<'Map'>) => {
  const focusedPlaceId = route.params?.focusedPlaceId;
  const notificationContext = route.params?.notificationContext;
  const clearFocusedPlace = useCallback(() => {
    navigation.setParams({
      focusedPlaceId: undefined,
      notificationContext,
    });
  }, [navigation, notificationContext]);

  return (
    <MapScreen
      notificationLikeContext={notificationContext ? {
        notificationsId: notificationContext.notificationId?.toString(),
        postId: notificationContext.postId?.toString(),
      } : null}
      openedBookmarkedPlaceId={focusedPlaceId ?? null}
      onClearOpenedBookmarkedPlace={clearFocusedPlace}
      onCreatePlace={() => navigation.navigate(MAIN_ROUTES.PlaceCreate)}
      onOpenLikedPlaces={() => navigation.navigate(MAIN_ROUTES.Profile, { initialTab: 'liked' })}
      onOpenPlaceDetail={(value) => {
        const placeId = parsePlaceId(value);
        if (placeId) {
          navigation.navigate(MAIN_ROUTES.PlaceDetail, { placeId });
        }
      }}
      onOpenProfile={() => navigation.navigate(MAIN_ROUTES.Profile)}
      onOpenSavedPlaces={() => navigation.navigate(MAIN_ROUTES.Profile, { initialTab: 'saved' })}
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
  />
);

const ProfileRouteScreen = ({ navigation, route }: MainScreenProps<'Profile'>) => (
  <ProfileScreen
    initialTab={route.params?.initialTab}
    onBack={navigation.goBack}
    onOpenBookmarkedPost={(value) => {
      const focusedPlaceId = parsePlaceId(value);
      if (focusedPlaceId) {
        navigation.popTo(MAIN_ROUTES.Map, { focusedPlaceId });
      }
    }}
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

const CheckInRouteScreen = ({ navigation, route }: MainScreenProps<'CheckIn'>) => (
  <RoutePlaceholderScreen
    description={`placeId: ${route.params.placeId}`}
    title="체크인"
    onBack={navigation.goBack}
  />
);

const CouponWalletRouteScreen = ({ navigation }: MainScreenProps<'CouponWallet'>) => (
  <RoutePlaceholderScreen
    description="쿠폰 지갑 화면은 준비 중입니다."
    title="쿠폰 지갑"
    onBack={navigation.goBack}
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
    <Stack.Screen name={MAIN_ROUTES.Profile} component={ProfileRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Settings} component={SettingsRouteScreen} />
    <Stack.Screen name={MAIN_ROUTES.Merchant} component={MerchantRouteScreen} />
  </Stack.Navigator>
);

export default MainNavigator;
