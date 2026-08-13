import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { clearTokenSession, type TokenSession } from '../../../shared/auth/tokenSession';
import { authApi } from '../api/authApi';
import type {
  EmailResendRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
} from '../model/auth.types';

type AuthApi = typeof authApi;

export function createPasswordResetRequestMutationOptions(
  api: Pick<AuthApi, 'requestPasswordReset'> = authApi,
) {
  return {
    mutationFn: (body: PasswordResetRequest) => api.requestPasswordReset(body),
  };
}

export function createPasswordResetConfirmMutationOptions(
  api: Pick<AuthApi, 'confirmPasswordReset'> = authApi,
) {
  return {
    mutationFn: (body: PasswordResetConfirmRequest) => api.confirmPasswordReset(body),
  };
}

export function createEmailResendMutationOptions(
  api: Pick<AuthApi, 'resendVerificationEmail'> = authApi,
) {
  return {
    mutationFn: (body: EmailResendRequest) => api.resendVerificationEmail(body),
  };
}

type LogoutDependencies = {
  api: Pick<AuthApi, 'logout'>;
  queryClient: Pick<QueryClient, 'cancelQueries' | 'removeQueries'>;
  tokenSession: TokenSession;
};

export async function logoutAndClearSession({
  api,
  queryClient,
  tokenSession,
}: LogoutDependencies): Promise<void> {
  let serverError: unknown;
  let cleanupError: unknown;

  try {
    await api.logout();
  } catch (error) {
    serverError = error;
  }

  // Prevent in-flight authenticated queries from repopulating cache after credentials are removed.
  try {
    await queryClient.cancelQueries();
  } catch (error) {
    cleanupError = error;
  }

  try {
    await tokenSession.clear();
  } catch (error) {
    cleanupError ??= error;
  } finally {
    queryClient.removeQueries();
  }

  if (cleanupError) {
    throw cleanupError;
  }

  if (serverError) {
    throw serverError;
  }
}

export function usePasswordResetRequest() {
  return useMutation(createPasswordResetRequestMutationOptions());
}

export function usePasswordResetConfirm() {
  return useMutation(createPasswordResetConfirmMutationOptions());
}

export function useResendVerificationEmail() {
  return useMutation(createEmailResendMutationOptions());
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAndClearSession({
      api: authApi,
      queryClient,
      tokenSession: { clear: clearTokenSession },
    }),
  });
}
