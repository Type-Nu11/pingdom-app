import React, { useEffect, useState } from 'react';
import AppProvider from './src/app/providers/AppProvider';
import { LoginFormScreen } from './src/features/auth/screens/login';
import SignUpDetailsScreen from './src/features/auth/screens/signup/SignUpDetailsScreen';
import SignUpEmailVerifyScreen from './src/features/auth/screens/signup/SignUpEmailVerifyScreen';
import type { OnboardingData } from './src/features/onboarding/types';
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

type AppScreen = 'onboarding' | 'login' | 'signup-details' | 'signup-email-verify';
type MainScreen = 'map' | 'place-create' | 'place-detail' | 'profile';

function AppContent() {
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const { pendingRoute, consumePendingNotificationRoute } = useNotificationState();
  const [appScreen, setAppScreen] = useState<AppScreen>('onboarding');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyUsername, setVerifyUsername] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
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
    setAppScreen('onboarding');
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
          switch (appScreen) {
            case 'onboarding':
              return (
                <OnboardingFlow
                  onSignup={(data) => { setOnboardingData(data); setAppScreen('signup-details'); }}
                  onLogin={() => setAppScreen('login')}
                />
              );
            case 'login':
              return (
                <LoginFormScreen
                  onBack={() => setAppScreen('onboarding')}
                  onSignup={() => setAppScreen('signup-details')}
                />
              );
            case 'signup-details':
              return (
                <SignUpDetailsScreen
                  onBack={() => setAppScreen('onboarding')}
                  onboardingData={onboardingData ?? undefined}
                  onVerify={(email, username, password) => {
                    setVerifyEmail(email);
                    setVerifyUsername(username);
                    setVerifyPassword(password);
                    setAppScreen('signup-email-verify');
                  }}
                />
              );
            default:
              return (
                <SignUpEmailVerifyScreen
                  email={verifyEmail}
                  username={verifyUsername}
                  password={verifyPassword}
                  onBack={() => setAppScreen('signup-details')}
                />
              );
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
