import { getAuthErrorKey } from '../../../v2/modules/user/account/auth';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { SignupRequest, SignupResponse } from '../model/auth.types';

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
      setErrorMessage(t(getAuthErrorKey(error, 'signup')));
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
