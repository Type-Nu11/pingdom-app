import axios from 'axios';
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
    return '서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.';
  }

  if (status === 401) {
    return serverMessage ?? '로그인이 만료됐어요. 다시 로그인해 주세요.';
  }

  return fieldErrorMessage ?? serverMessage ?? fallbackMessage;
}
