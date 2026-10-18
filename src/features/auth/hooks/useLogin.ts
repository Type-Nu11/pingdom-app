import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loginWithTokens } from '../../../app/store/authStore';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../model/auth.types';
import { getAuthErrorKey } from '../../../v2/modules/user/account/auth';

export const useLogin = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async (payload: LoginRequest) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const tokens = await authApi.login(payload);
      await loginWithTokens(tokens);
      return true;
    } catch (error) {
      setErrorMessage(t(getAuthErrorKey(error, 'login')));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    login,
    isSubmitting,
    errorMessage,
    clearError: () => setErrorMessage(null),
    setError: (msg: string) => setErrorMessage(msg),
  };
};

export default useLogin;
