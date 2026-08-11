import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  EmailResendRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
} from '../model/auth.types';

const PASSWORD_RESET_REQUEST_PATH = '/auth/password-reset/request';
const PASSWORD_RESET_CONFIRM_PATH = '/auth/password-reset/confirm';
const LOGOUT_PATH = '/auth/logout';
const EMAIL_RESEND_PATH = '/auth/email/resend';

export function createAuthApi(client: ApiClient = apiClient) {
  return {
    requestPasswordReset: (
      body: PasswordResetRequest,
      signal?: AbortSignal,
    ): Promise<void> =>
      client.post<void, PasswordResetRequest>(PASSWORD_RESET_REQUEST_PATH, body, { signal }),
    confirmPasswordReset: (
      body: PasswordResetConfirmRequest,
      signal?: AbortSignal,
    ): Promise<void> =>
      client.post<void, PasswordResetConfirmRequest>(PASSWORD_RESET_CONFIRM_PATH, body, { signal }),
    logout: (signal?: AbortSignal): Promise<void> =>
      client.post<void>(LOGOUT_PATH, undefined, { signal }),
    resendVerificationEmail: (
      body: EmailResendRequest,
      signal?: AbortSignal,
    ): Promise<void> =>
      client.post<void, EmailResendRequest>(EMAIL_RESEND_PATH, body, { signal }),
  };
}

export const authApi = createAuthApi();
