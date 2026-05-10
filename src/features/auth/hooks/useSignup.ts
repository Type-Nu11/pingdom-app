import { useState } from 'react';
import { authApi } from '../api/authApi';
import type { SignupRequest } from '../model/auth.types';

export const useSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signup = async (payload: SignupRequest) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authApi.signup(payload);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '회원가입 중 알 수 없는 오류가 발생했습니다.';
      setErrorMessage(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    signup,
    isSubmitting,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
};

export default useSignup;
