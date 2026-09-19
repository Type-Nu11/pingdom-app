import {
  configureApiAccessTokenProvider,
  configureApiTransport,
  type ApiTransport,
} from '../../v2/shared/api/apiClient';
import { configureTokenSession } from '../../v2/shared/auth/tokenSession';
import { unregisterStoredFcmToken } from '../../v2/modules/user/notifications/lifecycle';

/** Application-owned contract; the existing Axios/Keychain/session implementation is injected. */
export interface ProductionRuntime {
  transport: ApiTransport;
  getAccessToken: () => string | null;
  beforeLogout: (handler: () => Promise<void>) => () => void;
  logout: () => Promise<void>;
}

export function installProductionRuntime(runtime: ProductionRuntime): void {
  configureApiTransport(runtime.transport);
  // Read the live cache: login and refresh both update it, unlike an auth-store snapshot.
  configureApiAccessTokenProvider(runtime.getAccessToken);
  runtime.beforeLogout(unregisterStoredFcmToken);
  configureTokenSession({ clear: runtime.logout });
}
