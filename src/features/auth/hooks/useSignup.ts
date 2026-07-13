import axios from 'axios';
import { useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { SignupRequest, SignupResponse } from '../model/auth.types';

type SignupErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
  code?: string;
};

function toSignupErrorMessage(error: unknown, t: TFunction): string {
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

  return error instanceof Error ? error.message : t('auth.signup.unknownError');
}

export const useSignup = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signup = async (payload: SignupRequest): Promise<SignupResponse | null> => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      return await authApi.signup(payload);
    } catch (error) {
      setErrorMessage(toSignupErrorMessage(error, t));
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
