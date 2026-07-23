import { apiClient, type ApiClient } from '../../../shared/api';
import type { GetPlaceListParams, PlaceListPage } from '../model/placeList.types';

export function createPlaceListApi(client: ApiClient = apiClient) {
  return {
    getPlaceList: (
      params: GetPlaceListParams,
      signal?: AbortSignal,
    ): Promise<PlaceListPage> =>
      client.get<PlaceListPage>('/places', {
        params,
        signal,
      }),
  };
}

export const placeListApi = createPlaceListApi();
