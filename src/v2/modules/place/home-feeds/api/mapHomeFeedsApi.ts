import { apiClient, type ApiClient } from '../../../../shared/api';
import type {
  LocalHotContractQuery,
  LocalHotResponse,
  NationalTrendsContractQuery,
  NationalTrendsResponse,
} from '../model/mapHomeFeeds.types';
import { toRankedPlaceViewModels } from '../model/mapHomeFeeds';

export function createMapHomeFeedsApi(client: Pick<ApiClient, 'get'> = apiClient) {
  return {
    getLocalHot: (params: LocalHotContractQuery, signal?: AbortSignal): Promise<LocalHotResponse> =>
      client.get<LocalHotResponse>('/places/local-hot', { params, signal }),
    getNationalTrends: async (
      params: NationalTrendsContractQuery,
      signal?: AbortSignal,
    ): Promise<NationalTrendsResponse> => {
      const response = await client.get<NationalTrendsResponse>('/places/trends', { params, signal });
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        const places = Array.isArray(response?.places) ? response.places : undefined;
        console.info('[V2 national trends response]', JSON.stringify({
          placesArrayPresent: places !== undefined,
          receivedCount: places?.length ?? null,
          displayableCount: toRankedPlaceViewModels(places).length,
          totalElements: response?.totalElements,
          page: response?.page,
          hasNext: response?.hasNext,
        }));
      }
      return response;
    },
  };
}

export const mapHomeFeedsApi = createMapHomeFeedsApi();
