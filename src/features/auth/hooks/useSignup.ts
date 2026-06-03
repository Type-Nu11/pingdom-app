import axios from 'axios';
import { useState } from 'react';
import { authApi } from '../api/authApi';
import type { SignupRequest, SignupResponse } from '../model/auth.types';

type SignupErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
  code?: string;
};

function toSignupErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as SignupErrorResponse | undefined;
    const fieldErrors = data?.errors ? Object.values(data.errors).filter(Boolean) : [];

    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : '회원가입 중 알 수 없는 오류가 발생했습니다.';
}

export const useSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signup = async (payload: SignupRequest): Promise<SignupResponse | null> => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await authApi.signup(payload);
    } catch (error) {
      setErrorMessage(toSignupErrorMessage(error));
      return null;
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
