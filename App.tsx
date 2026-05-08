import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LanguageGateScreen from './src/features/auth/screens/LanguageGateScreen';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import PhoneVerifyScreen from './src/features/auth/screens/PhoneVerifyScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import WelcomeScreen from './src/features/auth/screens/WelcomeScreen';
import useAuth from './src/features/auth/hooks/useAuth';
import MapScreen from './src/features/place/screens/MapScreen';
import Button from './src/shared/components/Button';

type AuthScreen = 'language-gate' | 'welcome' | 'login' | 'signup' | 'phone-verify';

export default function App() {
  const { bootstrapAuth, isHydrating, isLoggedIn, logout } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('language-gate');

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  if (isHydrating) return null;

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
            case 'language-gate': return <LanguageGateScreen onSubmit={() => setAuthScreen('welcome')} />;
            case 'welcome': return <WelcomeScreen onStart={() => setAuthScreen('signup')} onLogin={() => setAuthScreen('login')} />;
            case 'login': return <LoginScreen onBack={() => setAuthScreen('welcome')} />;
            case 'signup': return <SignupScreen onBack={() => setAuthScreen('welcome')} onLogin={() => setAuthScreen('login')} onComplete={() => setAuthScreen('phone-verify')} />;
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
