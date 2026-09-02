import { apiClient, type ApiClient } from '../../../shared/api';
import type { PlaceMenus } from '../model/placeMenu.types';

export function createPlaceMenuApi(client: ApiClient = apiClient) {
  return {
    listPlaceMenus: (placeId: number, signal?: AbortSignal): Promise<PlaceMenus> =>
      client.get<PlaceMenus>(`/places/${placeId}/menus`, { signal }),
  };
}

export const placeMenuApi = createPlaceMenuApi();
