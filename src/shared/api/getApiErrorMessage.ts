import axios from 'axios';
import i18n from '../../i18n';
import type { ApiCodeErrorResponse, ApiFieldErrorResponse } from '../../types/api.types';

type KnownApiErrorResponse = ApiCodeErrorResponse | ApiFieldErrorResponse;

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError<KnownApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const status = error.response?.status;
  const responseData = error.response?.data;
  const fieldErrorMessage = responseData && 'errors' in responseData && responseData.errors
    ? Object.values(responseData.errors)[0]
    : undefined;
  const serverMessage = responseData?.message;

  if (!status) {
    return i18n.t('apiErrors.networkError');
  }

  if (status === 401) {
    return responseData && 'code' in responseData && responseData.code === 'INVALID_TOKEN'
      ? i18n.t('apiErrors.sessionExpired')
      : serverMessage ?? i18n.t('apiErrors.sessionExpired');
  }

  return fieldErrorMessage ?? serverMessage ?? fallbackMessage;
}
