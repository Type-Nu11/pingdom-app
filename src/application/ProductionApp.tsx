import React from 'react';

import ProductionProviders from './ProductionProviders';
import RootNavigator from './navigation/RootNavigator';
import { configureProductionRuntime } from './runtime/configureProductionRuntime';

configureProductionRuntime();

export default function ProductionApp() {
  return (
    <ProductionProviders>
      <RootNavigator />
    </ProductionProviders>
  );
}
