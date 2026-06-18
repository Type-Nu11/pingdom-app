import { useState } from 'react';
import { authApi } from '../api/authApi';

export const usePhoneVerification = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendCode = async (phoneNumber: string) => {
    setIsSending(true);
    setErrorMessage(null);
    try {
      await authApi.sendPhoneCode({ phoneNumber });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '인증번호 전송에 실패했습니다.';
      setErrorMessage(message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (phoneNumber: string, code: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      await authApi.verifyPhoneCode({ phoneNumber, code });
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '인증번호가 올바르지 않습니다.';
      setErrorMessage(message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    sendCode,
    verifyCode,
    isSending,
    isVerifying,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
};

export default usePhoneVerification;
