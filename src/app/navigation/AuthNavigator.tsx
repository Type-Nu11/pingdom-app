import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFlow } from '../../features/onboarding';
import { AUTH_ROUTES, type AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator
    initialRouteName={AUTH_ROUTES.Onboarding}
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name={AUTH_ROUTES.Onboarding} component={OnboardingFlow} />
  </Stack.Navigator>
);

export default AuthNavigator;
