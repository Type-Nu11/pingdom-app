import React, { useCallback, useEffect, useState } from 'react';
import AppProvider from './src/app/providers/AppProvider';
import { OnboardingFlow } from './src/features/onboarding';
import useAuth from './src/features/auth/hooks/useAuth';
import { useFcmTokenSync } from './src/features/firebase/hooks/useFcmTokenSync';
import { useForegroundFcmNotifications } from './src/features/firebase/hooks/useForegroundFcmNotifications';
import { useNotificationOpenSync } from './src/features/firebase/hooks/useNotificationOpenSync';
import useNotificationState from './src/features/firebase/hooks/useNotificationState';
import type { NotificationRoute } from './src/features/firebase/model/notification.types';
import MapScreen from './src/features/place/screens/MapScreen';
import PlaceCreateFlowScreen from './src/features/place/screens/PlaceCreateFlowScreen';
import PlaceDetailScreen from './src/features/place/screens/PlaceDetailScreen';
import ProfileScreen from './src/features/profile/screens/ProfileScreen';
import SettingsScreen from './src/features/settings/screens/SettingsScreen';
import { useMapSettingsStore } from './src/app/store/mapSettingsStore';

type MainScreen = 'map' | 'place-create' | 'place-detail' | 'profile' | 'settings';
type ProfileTab = 'liked' | 'saved';

function AppContent() {
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const hydrateMapSettings = useMapSettingsStore((state) => state.hydrateMapSettings);
  const { pendingRoute, consumePendingNotificationRoute } = useNotificationState();
  const [mainScreen, setMainScreen] = useState<MainScreen>('map');
  const [openedBookmarkedPlaceId, setOpenedBookmarkedPlaceId] = useState<number | null>(null);
  const [openedNotificationRoute, setOpenedNotificationRoute] = useState<NotificationRoute | null>(null);
  const [profileInitialTab, setProfileInitialTab] = useState<ProfileTab>('liked');

  useFcmTokenSync(isLoggedIn);
  useForegroundFcmNotifications(isLoggedIn);
  useNotificationOpenSync();

  useEffect(() => {
    void bootstrapAuth();
    void hydrateMapSettings();
  }, [bootstrapAuth, hydrateMapSettings]);

  useEffect(() => {
    if (!isLoggedIn || !pendingRoute) {
      return;
    }

    setOpenedNotificationRoute(pendingRoute);

    if (pendingRoute.screen === 'place-detail' && pendingRoute.placeId) {
      setMainScreen('place-detail');
    } else {
      setMainScreen('map');
    }

    consumePendingNotificationRoute();
  }, [consumePendingNotificationRoute, isLoggedIn, pendingRoute]);

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }

    setMainScreen('map');
    setOpenedNotificationRoute(null);
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    setMainScreen('map');
    setOpenedNotificationRoute(null);
  };
  const clearOpenedBookmarkedPlace = useCallback(() => {
    setOpenedBookmarkedPlaceId(null);
  }, []);
  const openProfile = useCallback((tab: ProfileTab = 'liked') => {
    setProfileInitialTab(tab);
    setMainScreen('profile');
  }, []);

  if (isHydrating) return null;

  return (
    <>
      {isLoggedIn ? (
        mainScreen === 'place-create' ? (
          <PlaceCreateFlowScreen onClose={() => setMainScreen('map')} />
        ) : mainScreen === 'place-detail' && openedNotificationRoute?.placeId ? (
          <PlaceDetailScreen
            placeId={openedNotificationRoute.placeId}
            notificationTitle={openedNotificationRoute.title}
            notificationBody={openedNotificationRoute.body}
            onBack={() => setMainScreen('map')}
          />
        ) : mainScreen === 'settings' ? (
          <SettingsScreen onBack={() => setMainScreen('profile')} onLogout={handleLogout} />
        ) : mainScreen === 'profile' ? (
          <ProfileScreen
            initialTab={profileInitialTab}
            onBack={() => {
              setOpenedBookmarkedPlaceId(null);
              setMainScreen('map');
            }}
            onLogout={handleLogout}
            onOpenBookmarkedPost={(placeId) => {
              setOpenedBookmarkedPlaceId(placeId);
              setMainScreen('map');
            }}
            onOpenSettings={() => setMainScreen('settings')}
          />
        ) : (
          <MapScreen
            openedBookmarkedPlaceId={openedBookmarkedPlaceId}
            onClearOpenedBookmarkedPlace={clearOpenedBookmarkedPlace}
            notificationLikeContext={openedNotificationRoute}
            onCreatePlace={() => setMainScreen('place-create')}
            onOpenLikedPlaces={() => openProfile('liked')}
            onOpenProfile={() => openProfile('liked')}
            onOpenSavedPlaces={() => openProfile('saved')}
          />
        )
      ) : (
        <OnboardingFlow />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
