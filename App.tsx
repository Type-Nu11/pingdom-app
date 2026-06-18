import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import KoreanOnboardingFlow from './src/features/auth/screens/InformationSelect/KoreanOnboardingFlow';
import {
  SignUpWelcomeScreen,
  SignUpPhoneScreen,
  SignUpCertificationScreen,
  SignUpDetailsScreen,
} from './src/features/auth/screens/signup';
import useAuth from './src/features/auth/hooks/useAuth';
import MapScreen from './src/features/place/screens/MapScreen';
import Button from './src/shared/components/Button';
import { usePretendardFont } from './src/shared/fonts';

type AuthScreen =
  | 'korean-onboarding'
  | 'login'
  | 'signup-welcome'
  | 'signup-phone'
  | 'signup-certification'
  | 'signup-details';

export default function App() {
  const fontsLoaded = usePretendardFont();
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('signup-phone');
  const [pendingPhone, setPendingPhone] = useState('');

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  if (!fontsLoaded || isHydrating) return null;

  return (
    <>
      {isLoggedIn ? (
        <View style={styles.container}>
          <MapScreen />
          <View style={styles.logoutButton}>
            <Button label="로그아웃" onPress={() => void logout()} />
          </View>
        </View>
      ) : (
        (() => {
          switch (authScreen) {
            case 'korean-onboarding':
              return <KoreanOnboardingFlow onComplete={() => setAuthScreen('signup-welcome')} />;
            case 'login':
              return <LoginScreen onBack={() => setAuthScreen('signup-welcome')} />;
            case 'signup-welcome':
              return (
                <SignUpWelcomeScreen
                  onStart={() => setAuthScreen('signup-phone')}
                  onLogin={() => setAuthScreen('login')}
                />
              );
            case 'signup-phone':
              return (
                <SignUpPhoneScreen
                  onBack={() => setAuthScreen('signup-welcome')}
                  onNext={(phone) => {
                    setPendingPhone(phone);
                    setAuthScreen('signup-certification');
                  }}
                />
              );
            case 'signup-certification':
              return (
                <SignUpCertificationScreen
                  phoneNumber={pendingPhone}
                  onBack={() => setAuthScreen('signup-phone')}
                  onVerified={() => setAuthScreen('signup-details')}
                />
              );
            default:
              return <SignUpDetailsScreen onBack={() => setAuthScreen('signup-certification')} />;
          }
        })()
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 56,
    width: 120,
  },
});
