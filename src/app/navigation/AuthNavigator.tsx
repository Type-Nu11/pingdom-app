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
import { normalizeSupportedLanguage } from '../../v2/shared/i18n';
import {
  AUTH_ROUTES,
  type AuthScreenProps,
  type AuthStackParamList,
} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

function goBackOrOpenOnboarding(
  navigation: AuthScreenProps<'AuthLanding'>['navigation'],
) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  // Onboarding completion replaces the auth stack, so AuthLanding can be the
  // first route with no history to pop. Let users review or change their
  // language/preferences instead of dispatching an unhandled GO_BACK action.
  navigation.navigate(AUTH_ROUTES.Onboarding);
}

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
        {({ navigation }) => (
          <OnboardingFlow
            onComplete={async (signupContext) => {
              const isRevisitingCompletedOnboarding = completion !== undefined;

              await onComplete(signupContext);

              // The unauthenticated navigation key remains "completed" when
              // an existing onboarding choice is updated, so the stack does
              // not remount as it does after first-time completion.
              if (isRevisitingCompletedOnboarding) {
                navigation.replace(AUTH_ROUTES.AuthLanding);
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.AuthLanding}>
        {({ navigation }) => {
          if (!completion) return null;

          return completion.signupContext.entryVariant === 'kr' ? (
            <LogInKrScreen
              onBack={() => goBackOrOpenOnboarding(navigation)}
              onLogin={() => navigation.navigate(AUTH_ROUTES.Login)}
              onSignup={() => navigation.navigate(AUTH_ROUTES.Signup)}
            />
          ) : (
            <LogInForeignScreen
              onBack={() => goBackOrOpenOnboarding(navigation)}
              onStart={() => navigation.navigate(AUTH_ROUTES.Signup)}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.Login}>
        {({ navigation }) => {
          return (
            <LoginFormScreen
              onBack={() => goBackOrOpenOnboarding(navigation)}
              onSignup={() => navigation.navigate(AUTH_ROUTES.Signup)}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name={AUTH_ROUTES.Signup}>
        {({ navigation }) => {
          return (
            <SignUpDetailsScreen
              onBack={() => goBackOrOpenOnboarding(navigation)}
              onboardingData={completion ? {
                ...completion.signupContext,
                language: normalizeSupportedLanguage(completion.signupContext.language) ?? 'en',
              } : undefined}
            />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
