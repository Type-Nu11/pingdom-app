import { useAuthStore } from '../../../app/store/authStore';

export const useAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    accessToken,
    isLoggedIn,
    isHydrating,
    bootstrapAuth,
    login,
    logout,
  };
};

export default useAuth;
