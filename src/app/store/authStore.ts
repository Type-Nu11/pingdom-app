import { hydrateAccessToken, persistTokens, removeTokens } from '../../shared/api/authTokens';
import type { AuthTokens } from '../../shared/api/authStorage';

export type AuthState = {
  accessToken: string | null;
  isLoggedIn: boolean;
  isHydrating: boolean;
};

type Listener = () => void;

let state: AuthState = {
  accessToken: null,
  isLoggedIn: false,
  isHydrating: true,
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  emit();
}

export function getAuthState(): AuthState {
  return state;
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function bootstrapAuth(): Promise<void> {
  try {
    const accessToken = await hydrateAccessToken();
    setState({
      accessToken,
      isLoggedIn: Boolean(accessToken),
      isHydrating: false,
    });
  } catch {
    setState({
      accessToken: null,
      isLoggedIn: false,
      isHydrating: false,
    });
  }
}

export async function loginWithTokens(tokens: AuthTokens): Promise<void> {
  await persistTokens(tokens);
  setState({
    accessToken: tokens.accessToken,
    isLoggedIn: true,
    isHydrating: false,
  });
}

export async function logout(): Promise<void> {
  await removeTokens();
  setState({
    accessToken: null,
    isLoggedIn: false,
    isHydrating: false,
  });
}
