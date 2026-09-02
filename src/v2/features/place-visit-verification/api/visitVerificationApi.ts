import {
  apiClient,
  type ApiClient,
  type PlaceExplorationOperationRequestBody,
  type PlaceExplorationOperationQuery,
  type PlaceExplorationOperationResponse,
  type VisitVerificationOperationRequestBody,
  type VisitVerificationOperationResponse,
} from '../../../shared/api';

export type VisitVerificationStartBody = VisitVerificationOperationRequestBody<'start'>;
export type VisitVerificationObservationBody = VisitVerificationOperationRequestBody<'submitObservation'>;
export type VisitVerificationSession = VisitVerificationOperationResponse<'start', 201>;

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
    startSession: (
      body: VisitVerificationStartBody,
      signal?: AbortSignal,
    ): Promise<VisitVerificationSession> => client.post<
      VisitVerificationSession,
      VisitVerificationStartBody
    >('/visit-verification-sessions', body, { signal }),
    submitObservation: (
      sessionId: number,
      body: VisitVerificationObservationBody,
      signal?: AbortSignal,
    ): Promise<VisitVerificationSession> => client.post<
      VisitVerificationSession,
      VisitVerificationObservationBody
    >(`/visit-verification-sessions/${sessionId}/observations`, body, { signal }),
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
