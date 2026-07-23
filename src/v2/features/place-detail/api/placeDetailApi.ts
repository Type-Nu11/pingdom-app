import { apiClient, type ApiClient } from '../../../shared/api';
import type { PlaceDetail } from '../model/placeDetail.types';

export function createPlaceDetailApi(client: ApiClient = apiClient) {
  return {
    getPlaceDetail: (placeId: number, signal?: AbortSignal): Promise<PlaceDetail> =>
      client.get<PlaceDetail>(`/places/${placeId}`, { signal }),
  };
}

export const placeDetailApi = createPlaceDetailApi();
