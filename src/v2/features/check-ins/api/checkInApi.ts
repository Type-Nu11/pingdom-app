import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

export type ListCheckInsParams = OperationQuery<'listMyLocationCheckIns'>;
export type CreateCheckInBody = OperationRequestBody<'createLocationCheckIn'>;
export type CreateStatusVoteBody = OperationRequestBody<'createPlaceStatusVote'>;
export type LocationCheckInPage = OperationResponse<'listMyLocationCheckIns', 200>;
export type LocationCheckIn = OperationResponse<'createLocationCheckIn', 201>;
export type StatusVote = OperationResponse<'createPlaceStatusVote', 201>;

export function createCheckInApi(client: ApiClient = apiClient) {
  return {
    createCheckIn: (body: CreateCheckInBody, signal?: AbortSignal): Promise<LocationCheckIn> =>
      client.post<LocationCheckIn, CreateCheckInBody>('/location-check-ins', body, { signal }),

    createStatusVote: (
      placeId: number,
      body: CreateStatusVoteBody,
      signal?: AbortSignal,
    ): Promise<StatusVote> =>
      client.post<StatusVote, CreateStatusVoteBody>(
        `/places/${placeId}/status-votes`,
        body,
        { signal },
      ),

    listCheckIns: (
      params: ListCheckInsParams = {},
      signal?: AbortSignal,
    ): Promise<LocationCheckInPage> =>
      client.get<LocationCheckInPage>('/location-check-ins', { params, signal }),
  };
}

export const checkInApi = createCheckInApi();
