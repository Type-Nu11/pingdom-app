import React from 'react';

import V1App from './App.v1';
import { useAuthStore } from './src/app/store/authStore';
import { api } from './src/shared/api/apiClient';
import V2App from './src/v2/app/App';
import { configureApiTransport } from './src/v2/shared/api/apiClient';

// Keep the V2 feature boundary isolated while reusing the production transport's
// token injection, single-flight refresh, one-request replay, and logout behavior.
configureApiTransport(api);

export default function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // V2 does not own an authentication screen yet. Reuse the established auth root
  // during bootstrap and after refresh failure; a successful login switches back.
  return isLoggedIn ? <V2App /> : <V1App />;
}
