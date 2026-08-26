import {
  apiClient,
  type ApiClient,
  type PlaceExplorationOperationRequestBody,
  type PlaceExplorationOperationQuery,
  type PlaceExplorationOperationResponse,
} from '../../../shared/api';

export type CreatePlaceReviewBody =
  PlaceExplorationOperationRequestBody<'create_2'>;
export type PlaceReview =
  PlaceExplorationOperationResponse<'create_2', 200>;
export type PlaceReviewListParams =
  PlaceExplorationOperationQuery<'list_4'>;
export type PlaceReviewPage =
  PlaceExplorationOperationResponse<'list_4', 200>;

export function createVisitVerificationApi(client: ApiClient = apiClient) {
  return {
    getReviews: (
      placeId: number,
      params: PlaceReviewListParams,
      signal?: AbortSignal,
    ): Promise<PlaceReviewPage> => client.get<PlaceReviewPage>(
      `/places/${placeId}/reviews`,
      { params, signal },
    ),
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
