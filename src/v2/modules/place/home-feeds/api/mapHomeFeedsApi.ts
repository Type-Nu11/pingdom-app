import { apiClient, type ApiClient } from '../../../../shared/api';
import type {
  LocalHotContractQuery,
  LocalHotResponse,
  NationalTrendsContractQuery,
  NationalTrendsResponse,
} from '../model/mapHomeFeeds.types';

export function createMapHomeFeedsApi(client: Pick<ApiClient, 'get'> = apiClient) {
  return {
    getLocalHot: (params: LocalHotContractQuery, signal?: AbortSignal): Promise<LocalHotResponse> =>
      client.get<LocalHotResponse>('/places/local-hot', { params, signal }),
    getNationalTrends: (
      params: NationalTrendsContractQuery,
      signal?: AbortSignal,
    ): Promise<NationalTrendsResponse> =>
      client.get<NationalTrendsResponse>('/places/trends', { params, signal }),
  };
}

export const mapHomeFeedsApi = createMapHomeFeedsApi();
