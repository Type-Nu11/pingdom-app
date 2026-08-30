import axios from 'axios';
import { useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { PasswordResetConfirmRequest } from '../model/auth.types';

type PasswordResetErrorResponse = {
  message?: string;
  errors?: Record<string, string>;
  code?: string;
};

function toPasswordResetErrorMessage(error: unknown, t: TFunction): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as PasswordResetErrorResponse | undefined;

    if (data?.code === 'INVALID_PASSWORD_RESET_TOKEN') {
      return t('auth.passwordReset.invalidToken');
    }

    const fieldErrors = data?.errors ? Object.values(data.errors).filter(Boolean) : [];
    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : t('auth.passwordReset.unknownError');
}

export const usePasswordReset = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const run = async (operation: () => Promise<void>): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await operation();
      return true;
    } catch (error) {
      setErrorMessage(toPasswordResetErrorMessage(error, t));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    confirmReset: (payload: PasswordResetConfirmRequest) =>
      run(() => authApi.confirmPasswordReset(payload)),
    requestReset: (email: string) => run(() => authApi.requestPasswordReset({ email })),
    isSubmitting,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
};

export default usePasswordReset;
