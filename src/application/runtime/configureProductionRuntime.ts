import { configureBeforeLogout, logout } from '../../app/store/authStore';
import { api } from '../../shared/api/apiClient';
import { getCachedAccessToken } from '../../shared/api/authTokens';
import { unregisterStoredFcmToken } from '../../v2/features/notifications/services/fcmTokenLifecycle';
import {
  configureApiAccessTokenProvider,
  configureApiTransport,
} from '../../v2/shared/api/apiClient';
import { configureTokenSession } from '../../v2/shared/auth/tokenSession';

let isConfigured = false;

/**
 * Shared application-composition boundary for the production session runtime.
 *
 * V2 features receive the established production transport and token session here;
 * no V2 feature imports the legacy auth store or Axios client directly.
 */
export function configureProductionRuntime(): void {
  if (isConfigured) return;

  configureApiTransport(api);
  // The token cache is updated by both login and the Axios refresh interceptor. Reading it
  // directly prevents V2 fetch fallbacks from reusing the pre-refresh Zustand snapshot.
  configureApiAccessTokenProvider(getCachedAccessToken);
  configureBeforeLogout(unregisterStoredFcmToken);
  configureTokenSession({ clear: logout });
  isConfigured = true;
}
