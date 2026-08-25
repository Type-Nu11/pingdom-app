import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  ScoutProfile,
  ScoutProfileRequest,
} from '../model/scoutProfile.types';

const SCOUT_PROFILE_PATH = '/users/me/scout-profile';

export function createScoutProfileApi(client: ApiClient = apiClient) {
  return {
    getScoutProfile: (signal?: AbortSignal): Promise<ScoutProfile> =>
      client.get<ScoutProfile>(SCOUT_PROFILE_PATH, { signal }),
    applyScoutProfile: (
      body: ScoutProfileRequest,
      signal?: AbortSignal,
    ): Promise<ScoutProfile> =>
      client.post<ScoutProfile, ScoutProfileRequest>(SCOUT_PROFILE_PATH, body, { signal }),
    updateScoutProfile: (
      body: ScoutProfileRequest,
      signal?: AbortSignal,
    ): Promise<ScoutProfile> =>
      client.put<ScoutProfile, ScoutProfileRequest>(SCOUT_PROFILE_PATH, body, { signal }),
  };
}

export const scoutProfileApi = createScoutProfileApi();
