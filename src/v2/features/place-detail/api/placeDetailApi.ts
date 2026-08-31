import { apiClient, type ApiClient } from '../../../shared/api';
import type { PlaceAvailabilities, PlaceDetail } from '../model/placeDetail.types';

export function createPlaceDetailApi(client: ApiClient = apiClient) {
  return {
    getPlaceDetail: (placeId: number, signal?: AbortSignal): Promise<PlaceDetail> =>
      client.get<PlaceDetail>(`/places/${placeId}`, { signal }),
    getPlaceAvailabilities: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<PlaceAvailabilities> =>
      client.get<PlaceAvailabilities>(`/places/${placeId}/availabilities`, { signal }),
  };
}

export const placeDetailApi = createPlaceDetailApi();
