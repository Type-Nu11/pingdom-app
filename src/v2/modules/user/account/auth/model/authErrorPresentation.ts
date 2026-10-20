import { getApiErrorUx } from '../../../../../shared/api/getApiErrorUx';

export type AuthOperation = 'login' | 'signup' | 'passwordReset';

/** Select app-owned copy. HTTP messages and validation reasons are diagnostic data. */
export function getAuthErrorKey(value: unknown, operation: AuthOperation): string {
  const { error, kind } = getApiErrorUx(value);
  const fallback = `auth.${operation}.unknownError`;
  const isHtml = typeof error.responseData === 'string' && /^\s*</.test(error.responseData);
  if (isHtml) return fallback;

  if (kind === 'network' || kind === 'timeout' || kind === 'server' || kind === 'rateLimited') {
    return `common.apiError.${kind}.description`;
  }
  if (operation === 'login' && (error.status === 401 || error.code === 'INVALID_CREDENTIALS')) {
    return 'authErrors.invalidCredentials';
  }
  if (operation === 'passwordReset' && error.code === 'INVALID_PASSWORD_RESET_TOKEN') {
    return 'auth.passwordReset.invalidToken';
  }
  if (operation === 'signup' && (error.status === 409 || error.code?.endsWith('_ALREADY_EXISTS'))) {
    return 'authErrors.signupConflict';
  }
  if (error.status === 400 || error.status === 422 || kind === 'validation') {
    return 'common.apiError.validation.description';
  }
  if (error.status === 403) return 'common.apiError.authorization.description';
  if (kind === 'updateRequired') return 'common.apiError.updateRequired.description';
  // Auth forms are already outside a session: never ask the user to sign in again here.
  return fallback;
}
