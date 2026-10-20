import { getAuthErrorKey } from '../../../v2/modules/user/account/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { PasswordResetConfirmRequest } from '../model/auth.types';

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
      setErrorMessage(t(getAuthErrorKey(error, 'passwordReset')));
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
