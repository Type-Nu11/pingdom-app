import React from 'react';
import AppProvider from './src/app/providers/AppProvider';
import RootNavigator from './src/app/navigation/RootNavigator';

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
