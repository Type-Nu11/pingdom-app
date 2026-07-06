export type AuthState = {
  accessToken: string | null;
  isLoggedIn: boolean;
};

export const authStore: AuthState = {
  accessToken: null,
  isLoggedIn: false,
};
