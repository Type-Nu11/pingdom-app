import { apiClient, type ApiClient, type PlaceExplorationOperationResponse } from '../../../../shared/api';

// Preserve the Place-detail projection from its existing canonical snapshot.
// Do not merge it with reservation-create DTOs or change its established cache identity.
export type PlaceAvailabilities = PlaceExplorationOperationResponse<'list_6', 200>;

export function createPlaceAvailabilityApi(client: ApiClient = apiClient) {
  return {
    getPlaceAvailabilities: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<PlaceAvailabilities> =>
      client.get<PlaceAvailabilities>(`/places/${placeId}/availabilities`, { signal }),
  };
}

export const placeAvailabilityApi = createPlaceAvailabilityApi();
