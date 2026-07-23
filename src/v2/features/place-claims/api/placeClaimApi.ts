import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

export type ListPlaceClaimsParams = OperationQuery<'listMyPlaceClaims'>;
export type CreatePlaceClaimBody = OperationRequestBody<'createPlaceClaim'>;
export type PlaceClaimPage = OperationResponse<'listMyPlaceClaims', 200>;
export type PlaceClaim = OperationResponse<'getMyPlaceClaim', 200>;

export function createPlaceClaimApi(client: ApiClient = apiClient) {
  return {
    cancelPlaceClaim: (claimId: number, signal?: AbortSignal): Promise<PlaceClaim> =>
      client.post<PlaceClaim>(`/merchant-owner/place-claims/${claimId}/cancel`, undefined, {
        signal,
      }),

    createPlaceClaim: (
      body: CreatePlaceClaimBody,
      signal?: AbortSignal,
    ): Promise<PlaceClaim> =>
      client.post<PlaceClaim, CreatePlaceClaimBody>('/merchant-owner/place-claims', body, {
        signal,
      }),

    getPlaceClaim: (claimId: number, signal?: AbortSignal): Promise<PlaceClaim> =>
      client.get<PlaceClaim>(`/merchant-owner/place-claims/${claimId}`, { signal }),

    listPlaceClaims: (
      params: ListPlaceClaimsParams = {},
      signal?: AbortSignal,
    ): Promise<PlaceClaimPage> =>
      client.get<PlaceClaimPage>('/merchant-owner/place-claims', { params, signal }),
  };
}

export const placeClaimApi = createPlaceClaimApi();
