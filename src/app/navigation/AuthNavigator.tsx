import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFlow } from '../../features/onboarding';
import { LoginFormScreen } from '../../features/auth/screens/login';
import SignUpDetailsScreen from '../../features/auth/screens/signup/SignUpDetailsScreen';
import LogInForeignScreen from '../../features/onboarding/LogInForeignScreen';
import LogInKrScreen from '../../features/onboarding/LogInKrScreen';
import type {
  OnboardingCompletion,
  SignupOnboardingContext,
} from '../../v2/features/onboarding-entry';
import { getAuthInitialRoute } from '../../v2/features/onboarding-entry';
import { AUTH_ROUTES, type AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthNavigatorProps = Readonly<{
  completion?: OnboardingCompletion;
  onComplete: (
    signupContext: Omit<SignupOnboardingContext, 'entryVariant'>,
  ) => Promise<void>;
}>;

const AuthNavigator = ({ completion, onComplete }: AuthNavigatorProps) => {
  const initialRouteName = getAuthInitialRoute(completion);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={AUTH_ROUTES.Onboarding}>
        {() => <OnboardingFlow onComplete={onComplete} />}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.AuthLanding}>
        {({ navigation }) => {
          if (!completion) return null;

          return completion.signupContext.entryVariant === 'kr' ? (
            <LogInKrScreen
              onBack={navigation.goBack}
              onLogin={() => navigation.navigate(AUTH_ROUTES.Login)}
              onSignup={() => navigation.navigate(AUTH_ROUTES.Signup)}
            />
          ) : (
            <LogInForeignScreen
              onBack={navigation.goBack}
              onStart={() => navigation.navigate(AUTH_ROUTES.Signup)}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.Login}>
        {({ navigation }) => (
          <LoginFormScreen
            onBack={navigation.goBack}
            onSignup={() => navigation.navigate(AUTH_ROUTES.Signup)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.Signup}>
        {({ navigation }) => (
          <SignUpDetailsScreen
            onBack={navigation.goBack}
            onboardingData={completion?.signupContext}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
