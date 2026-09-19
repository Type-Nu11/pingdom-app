import '../../v2/app/configureDomainMocks';
import { configureBeforeLogout, logout } from '../../app/store/authStore';
import { api } from '../../shared/api/apiClient';
import { getCachedAccessToken } from '../../shared/api/authTokens';
import { installProductionRuntime } from './productionRuntime';

let isConfigured = false;

/**
 * Shared application-composition boundary for the production session runtime.
 *
 * V2 features receive the established production transport and token session here;
 * no V2 feature imports the legacy auth store or Axios client directly.
 */
export function configureProductionRuntime(): void {
  if (isConfigured) return;

  installProductionRuntime({
    transport: api,
    getAccessToken: getCachedAccessToken,
    beforeLogout: configureBeforeLogout,
    logout,
  });
  isConfigured = true;
}
