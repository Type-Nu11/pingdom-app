import type {
  AccountOperationRequestBody,
} from '../../../shared/api';

export type PasswordResetRequest =
  AccountOperationRequestBody<'requestPasswordReset'>;
export type PasswordResetConfirmRequest =
  AccountOperationRequestBody<'confirmPasswordReset'>;
export type EmailResendRequest =
  AccountOperationRequestBody<'resendVerificationEmail'>;
