import { apiClient, type ApiClient } from '../../../shared/api';
import {
  validateReplaceTravelPurposesBody,
  type ReplaceTravelPurposesBody,
  type TravelPurposePreference,
} from '../model/travelPurpose.types';

const TRAVEL_PURPOSES_PATH = '/users/me/travel-purposes';

export function createTravelPurposeApi(client: ApiClient = apiClient) {
  return {
    getTravelPurposes: (signal?: AbortSignal): Promise<TravelPurposePreference> =>
      client.get<TravelPurposePreference>(TRAVEL_PURPOSES_PATH, { signal }),
    replaceTravelPurposes: (
      body: ReplaceTravelPurposesBody,
      signal?: AbortSignal,
    ): Promise<TravelPurposePreference> =>
      client.put<TravelPurposePreference, ReplaceTravelPurposesBody>(
        TRAVEL_PURPOSES_PATH,
        validateReplaceTravelPurposesBody(body),
        { signal },
      ),
  };
}

export const travelPurposeApi = createTravelPurposeApi();
