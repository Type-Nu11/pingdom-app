import React from 'react';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './navigation/RootNavigator';
import AppProviders from './AppProviders';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
