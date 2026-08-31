import { create } from 'zustand';
import { hydrateAuthTokens, persistTokens, removeTokens } from '../../shared/api/authTokens';
import { normalizeAuthTokens, type AuthTokens } from '../../shared/api/authStorage';

export type AuthState = {
  accessToken: string | null;
  isLoggedIn: boolean;
  isHydrating: boolean;
};

type AuthActions = {
  bootstrapAuth: () => Promise<void>;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export type BeforeLogoutHandler = () => Promise<void>;

let beforeLogoutHandler: BeforeLogoutHandler = async () => {};
let isLogoutInProgress = false;

export function configureBeforeLogout(handler: BeforeLogoutHandler): () => void {
  beforeLogoutHandler = handler;

  return () => {
    if (beforeLogoutHandler === handler) beforeLogoutHandler = async () => {};
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isLoggedIn: false,
  isHydrating: true,

  bootstrapAuth: async () => {
    set({ isHydrating: true });

    try {
      const tokens = await hydrateAuthTokens();
      const hasCompleteSession = Boolean(tokens?.accessToken && tokens.refreshToken);

      if (tokens && !hasCompleteSession) {
        await removeTokens();
      }

      set({
        accessToken: hasCompleteSession ? tokens?.accessToken ?? null : null,
        isLoggedIn: hasCompleteSession,
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
    const normalizedTokens = normalizeAuthTokens(tokens);

    if (!normalizedTokens.accessToken || !normalizedTokens.refreshToken) {
      throw new Error('로그인 응답에 accessToken 또는 refreshToken이 없습니다.');
    }

    await persistTokens(normalizedTokens);
    set({
      accessToken: normalizedTokens.accessToken,
      isLoggedIn: true,
      isHydrating: false,
    });
  },

  logout: async () => {
    // A failed refresh can call logout again while the FCM DELETE is in flight.
    // Returning immediately avoids a circular wait between both operations.
    if (isLogoutInProgress) return;

    isLogoutInProgress = true;
    set({ isHydrating: true, isLoggedIn: false });

    try {
      try {
        await beforeLogoutHandler();
      } catch (error) {
        // Device-token cleanup is best effort and must never trap the user in a session.
        console.warn('Before logout cleanup failed:', error);
      }

      await removeTokens();
      set({
        accessToken: null,
        isLoggedIn: false,
        isHydrating: false,
      });
    } finally {
      isLogoutInProgress = false;
    }
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

export async function logout(): Promise<void> {
  return useAuthStore.getState().logout();
}

/**
 * Clears credentials after the server has already rejected the session.
 *
 * The normal logout path first unregisters the device FCM token. That request
 * requires a valid access token, so running it while a failed refresh is still
 * in flight creates a circular wait. An expired session must therefore be
 * cleared locally and return the app to the unauthenticated navigator.
 */
export async function clearExpiredSession(): Promise<void> {
  if (isLogoutInProgress) return;

  isLogoutInProgress = true;
  useAuthStore.setState({ accessToken: null, isHydrating: true, isLoggedIn: false });

  try {
    await removeTokens();
  } finally {
    useAuthStore.setState({ accessToken: null, isHydrating: false, isLoggedIn: false });
    isLogoutInProgress = false;
  }
}
