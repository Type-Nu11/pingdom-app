import { StatusBar } from 'expo-status-bar';
import React from 'react';

import ProductionProviders from './ProductionProviders';
import RootNavigator from './navigation/RootNavigator';
import { configureProductionRuntime } from './runtime/configureProductionRuntime';

configureProductionRuntime();

export default function ProductionApp() {
  return (
    <ProductionProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </ProductionProviders>
  );
}
