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

export type ProfileImageApiErrorKind = 'failed' | 'tooLarge' | 'typeUnsupported';

// Server contract for POST /users/me/profile-image: 400 = empty file or a type
// other than JPEG/PNG, 413 = file too large. Anything else is retryable.
export function getProfileImageApiErrorKind(error: unknown): ProfileImageApiErrorKind {
  if (error instanceof ApiError) {
    if (error.status === 413) return 'tooLarge';
    if (error.status === 400) return 'typeUnsupported';
  }
  return 'failed';
}
