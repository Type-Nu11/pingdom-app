import { useState } from 'react';
import { loginWithTokens } from '../../../app/store/authStore';
import { authApi } from '../api/authApi';
import type { LoginRequest } from '../model/auth.types';

export const useLogin = () => {
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
      const message =
        error instanceof Error ? error.message : '로그인 중 알 수 없는 오류가 발생했습니다.';
      setErrorMessage(message);
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
