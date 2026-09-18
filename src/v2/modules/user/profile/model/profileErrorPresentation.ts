import { ApiError } from '../../../../shared/api/ApiError';

export function getUsernameErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.fieldErrors?.find(({ field }) => field === 'newUsername')?.reason
      ?? error.message
      ?? fallback;
  }
  return fallback;
}

export function getPasswordErrorMessage(
  error: unknown,
  messages: { currentPasswordInvalid: string; fallback: string; mismatch: string },
): string {
  if (error instanceof ApiError) {
    if (error.code === 'PASSWORD_MISMATCH') return messages.mismatch;
    if (error.code === 'INVALID_CREDENTIALS') return messages.currentPasswordInvalid;
    return error.fieldErrors?.find(({ reason }) => Boolean(reason))?.reason
      ?? error.message
      ?? messages.fallback;
  }
  return messages.fallback;
}
