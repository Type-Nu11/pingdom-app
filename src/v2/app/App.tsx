import React from 'react';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from '../features/home/screens/HomeScreen';
import PlaceListExampleScreen from '../features/place-list/screens/PlaceListExampleScreen';
import { env } from '../shared/config';
import AppProviders from './AppProviders';

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      {env.featureFlags.placeList ? <PlaceListExampleScreen /> : <HomeScreen />}
    </AppProviders>
  );
}
