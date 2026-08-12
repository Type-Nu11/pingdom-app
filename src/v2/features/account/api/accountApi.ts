import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  GoogleAccountResponse,
  GoogleLinkStartResponse,
  GoogleUnlinkRequest,
  UserDataExport,
} from '../model/account.types';

const GOOGLE_LINK_PATH = '/users/me/oauth-accounts/google/link';
const GOOGLE_ACCOUNT_PATH = '/users/me/oauth-accounts/google';
const USER_DATA_EXPORT_PATH = '/users/me/export';

export function createAccountApi(client: ApiClient = apiClient) {
  return {
    startGoogleLink: (signal?: AbortSignal): Promise<GoogleLinkStartResponse> =>
      client.post<GoogleLinkStartResponse>(GOOGLE_LINK_PATH, undefined, { signal }),
    unlinkGoogle: (
      body: GoogleUnlinkRequest = {},
      signal?: AbortSignal,
    ): Promise<GoogleAccountResponse> =>
      client.delete<GoogleAccountResponse, GoogleUnlinkRequest>(
        GOOGLE_ACCOUNT_PATH,
        body,
        { signal },
      ),
    getUserDataExport: (signal?: AbortSignal): Promise<UserDataExport> =>
      client.get<UserDataExport>(USER_DATA_EXPORT_PATH, { signal }),
  };
}

export const accountApi = createAccountApi();
