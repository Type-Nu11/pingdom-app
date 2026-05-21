import { create } from 'zustand';
import { hydrateAccessToken, persistTokens, removeTokens } from '../../shared/api/authTokens';
import type { AuthTokens } from '../../shared/api/authStorage';

export type AuthState = {
  accessToken: string | null;
  isLoggedIn: boolean;
  isHydrating: boolean;
};

type AuthActions = {
  bootstrapAuth: () => Promise<void>;
  login: (tokens: AuthTokens) => Promise<void>;
  loginWithGoogle: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isLoggedIn: false,
  isHydrating: true,

  bootstrapAuth: async () => {
    set({ isHydrating: true });

    try {
      const accessToken = await hydrateAccessToken();
      set({
        accessToken,
        isLoggedIn: Boolean(accessToken),
        isHydrating: false,
      });
    } catch {
      set({
        accessToken: null,
        isLoggedIn: false,
        isHydrating: false,
      });
    }
  },

  login: async (tokens: AuthTokens) => {
    await persistTokens(tokens);
    set({
      accessToken: tokens.accessToken,
      isLoggedIn: true,
      isHydrating: false,
    });
  },

  loginWithGoogle: async (tokens: AuthTokens) => {
    await persistTokens(tokens);
    set({
      accessToken: tokens.accessToken,
      isLoggedIn: true,
      isHydrating: false,
    });
  },

  logout: async () => {
    await removeTokens();
    set({
      accessToken: null,
      isLoggedIn: false,
      isHydrating: false,
    });
  },
}));

export function getAuthState(): AuthState {
  const { accessToken, isLoggedIn, isHydrating } = useAuthStore.getState();
  return { accessToken, isLoggedIn, isHydrating };
}

export function subscribeAuth(listener: () => void): () => void {
  return useAuthStore.subscribe(listener);
}

export async function bootstrapAuth(): Promise<void> {
  return useAuthStore.getState().bootstrapAuth();
}

export async function loginWithTokens(tokens: AuthTokens): Promise<void> {
  return useAuthStore.getState().login(tokens);
}

export async function loginWithGoogle(tokens: AuthTokens): Promise<void> {
  return useAuthStore.getState().loginWithGoogle(tokens);
}

export async function logout(): Promise<void> {
  return useAuthStore.getState().logout();
}
