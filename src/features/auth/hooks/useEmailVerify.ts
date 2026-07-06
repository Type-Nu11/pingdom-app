import axios from 'axios';
import { useState } from 'react';
import { authApi } from '../api/authApi';

function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string> } | undefined;
    const fieldErrors = data?.errors ? Object.values(data.errors).filter(Boolean) : [];
    if (fieldErrors.length > 0) return fieldErrors.join('\n');
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  }
  return error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.';
}

export const useEmailVerify = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verify = async (email: string, code: string): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authApi.verifyEmail({ email, code });
      return true;
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    verify,
    isSubmitting,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
};

export default useEmailVerify;
