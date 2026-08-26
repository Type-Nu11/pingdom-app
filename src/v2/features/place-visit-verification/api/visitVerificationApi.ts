import {
  apiClient,
  type ApiClient,
  type PlaceExplorationOperationRequestBody,
  type PlaceExplorationOperationResponse,
} from '../../../shared/api';

export type CreatePlaceReviewBody =
  PlaceExplorationOperationRequestBody<'create_3'>;
export type PlaceReview =
  PlaceExplorationOperationResponse<'create_3', 200>;

export function createVisitVerificationApi(client: ApiClient = apiClient) {
  return {
    createReview: (
      placeId: number,
      body: CreatePlaceReviewBody,
      signal?: AbortSignal,
    ): Promise<PlaceReview> => client.post<PlaceReview, CreatePlaceReviewBody>(
      `/places/${placeId}/reviews`,
      body,
      { signal },
    ),
  };
}

export const visitVerificationApi = createVisitVerificationApi();
