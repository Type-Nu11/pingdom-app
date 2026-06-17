import React, { useEffect, useState } from 'react';
import AppProvider from './src/app/providers/AppProvider';
import LanguageGateScreen from './src/features/auth/screens/LanguageGateScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import PhoneVerifyScreen from './src/features/auth/screens/PhoneVerifyScreen';
import SignupDetailsScreen from './src/features/auth/screens/SignupDetailsScreen';
import WelcomeScreen from './src/features/auth/screens/WelcomeScreen';
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

type AuthScreen = 'language-gate' | 'welcome' | 'login' | 'signup' | 'phone-verify';
type MainScreen = 'map' | 'place-create' | 'place-detail' | 'profile';

function AppContent() {
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const { pendingRoute, consumePendingNotificationRoute } = useNotificationState();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('language-gate');
  const [mainScreen, setMainScreen] = useState<MainScreen>('map');
  const [openedNotificationRoute, setOpenedNotificationRoute] = useState<NotificationRoute | null>(null);

  useFcmTokenSync(isLoggedIn);
  useForegroundFcmNotifications(isLoggedIn);
  useNotificationOpenSync();

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

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
    setAuthScreen('login');
    setMainScreen('map');
    setOpenedNotificationRoute(null);
  };

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
        ) : mainScreen === 'profile' ? (
          <ProfileScreen onBack={() => setMainScreen('map')} onLogout={handleLogout} />
        ) : (
          <MapScreen
            onCreatePlace={() => setMainScreen('place-create')}
            onOpenProfile={() => setMainScreen('profile')}
          />
        )
      ) : (
        (() => {
          switch (authScreen) {
            case 'language-gate': return <LanguageGateScreen onSubmit={() => setAuthScreen('welcome')} />;
            case 'welcome': return <WelcomeScreen onStart={() => setAuthScreen('signup')} onLogin={() => setAuthScreen('login')} />;
            case 'login': return <LoginScreen onBack={() => setAuthScreen('welcome')} />;
            case 'signup': return <SignupDetailsScreen onBack={() => setAuthScreen('welcome')} onLogin={() => setAuthScreen('login')} onComplete={() => setAuthScreen('phone-verify')} />;
            default: return <PhoneVerifyScreen onBack={() => setAuthScreen('signup')} onLogin={() => setAuthScreen('login')} />;
          }
        })()
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
