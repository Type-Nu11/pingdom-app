import { ApiError } from '../../../../shared/api/ApiError';

export function getUsernameErrorMessage(error: unknown, fallback: string): string {
  return fallback;
}

export function getPasswordErrorMessage(
  error: unknown,
  messages: { currentPasswordInvalid: string; fallback: string; mismatch: string },
): string {
  if (error instanceof ApiError) {
    if (error.code === 'PASSWORD_MISMATCH') return messages.mismatch;
    if (error.code === 'INVALID_CREDENTIALS') return messages.currentPasswordInvalid;
    return messages.fallback;
  }
  return messages.fallback;
}
