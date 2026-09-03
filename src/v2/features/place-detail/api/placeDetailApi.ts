import { apiClient, type ApiClient } from '../../../shared/api';
import type { PlaceAvailabilities, PlaceDetail, PlaceMenus } from '../model/placeDetail.types';

export function createPlaceDetailApi(client: ApiClient = apiClient) {
  return {
    getPlaceDetail: (placeId: number, signal?: AbortSignal): Promise<PlaceDetail> =>
      client.get<PlaceDetail>(`/places/${placeId}`, { signal }),
    getPlaceAvailabilities: (
      placeId: number,
      signal?: AbortSignal,
    ): Promise<PlaceAvailabilities> =>
      client.get<PlaceAvailabilities>(`/places/${placeId}/availabilities`, { signal }),
    getPlaceMenus: (placeId: number, signal?: AbortSignal): Promise<PlaceMenus> =>
      client.get<PlaceMenus>(`/places/${placeId}/menus`, { signal }),
  };
}

export const placeDetailApi = createPlaceDetailApi();
