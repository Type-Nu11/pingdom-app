import React from 'react';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from '../features/home/screens/HomeScreen';
import '../shared/config/env';
import AppProviders from './AppProviders';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <HomeScreen />
    </AppProviders>
  );
}
