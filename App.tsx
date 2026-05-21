import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import PhoneVerifyScreen from './src/features/auth/screens/SignupDetailsScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import KoreanOnboardingFlow from './src/features/auth/screens/InformationSelect/KoreanOnboardingFlow';
import useAuth from './src/features/auth/hooks/useAuth';
import MapScreen from './src/features/place/screens/MapScreen';
import Button from './src/shared/components/Button';
import { usePretendardFont } from './src/shared/fonts';

type AuthScreen = 'korean-onboarding' | 'login' | 'signup' | 'phone-verify';

export default function App() {
  const fontsLoaded = usePretendardFont();
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('korean-onboarding');

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
            case 'korean-onboarding': return <KoreanOnboardingFlow onComplete={() => setAuthScreen('signup')} />;
            case 'login': return <LoginScreen onBack={() => setAuthScreen('signup')} />;
            case 'signup': return <SignupScreen onBack={() => setAuthScreen('korean-onboarding')} onLogin={() => setAuthScreen('login')} onComplete={() => setAuthScreen('phone-verify')} />;
            default: return <PhoneVerifyScreen onBack={() => setAuthScreen('signup')} />;
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
