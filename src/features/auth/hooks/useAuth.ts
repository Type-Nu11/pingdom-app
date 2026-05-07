import { useSyncExternalStore } from 'react';
import {
  bootstrapAuth,
  getAuthState,
  loginWithTokens,
  logout,
  subscribeAuth,
} from '../../../app/store/authStore';
import type { AuthTokens } from '../../../shared/api/authStorage';

export const useAuth = () => {
  const state = useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);

  return {
    ...state,
    bootstrapAuth,
    login: async (tokens: AuthTokens) => loginWithTokens(tokens),
    logout,
  };
};

export default useAuth;
