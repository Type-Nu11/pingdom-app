import { apiClient } from '../../../shared/api';
import type { GetPlaceListParams, PlaceListPage } from '../model/placeList.types';

export const placeListApi = {
  getPlaceList: (
    params: GetPlaceListParams,
    signal?: AbortSignal,
  ): Promise<PlaceListPage> =>
    apiClient.get<PlaceListPage>('/places', {
      params: {
        limit: params.limit,
        page: params.page,
      },
      signal,
    }),
};
