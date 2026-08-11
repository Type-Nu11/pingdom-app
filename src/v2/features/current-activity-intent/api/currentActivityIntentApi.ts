import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  CurrentActivityIntent,
  ReplaceCurrentActivityIntentBody,
} from '../model/currentActivityIntent.types';

const CURRENT_ACTIVITY_INTENT_PATH = '/users/me/current-activity-intent';

export function createCurrentActivityIntentApi(client: ApiClient = apiClient) {
  return {
    clearCurrentActivityIntent: (signal?: AbortSignal): Promise<void> =>
      client.delete<void>(CURRENT_ACTIVITY_INTENT_PATH, { signal }),
    getCurrentActivityIntent: (signal?: AbortSignal): Promise<CurrentActivityIntent> =>
      client.get<CurrentActivityIntent>(CURRENT_ACTIVITY_INTENT_PATH, { signal }),
    replaceCurrentActivityIntent: (
      body: ReplaceCurrentActivityIntentBody,
      signal?: AbortSignal,
    ): Promise<CurrentActivityIntent> =>
      client.put<CurrentActivityIntent, ReplaceCurrentActivityIntentBody>(
        CURRENT_ACTIVITY_INTENT_PATH,
        body,
        { signal },
      ),
  };
}

export const currentActivityIntentApi = createCurrentActivityIntentApi();
