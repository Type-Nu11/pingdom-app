import { reviewPhotoPart, type SelectedPhoto } from '../model/visitVerification';
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
export type ForegroundVisitVerificationStartBody =
  VisitVerificationOperationRequestBody<'startForeground'>;
export type VisitVerificationObservationBody = VisitVerificationOperationRequestBody<'submitObservation'>;
export type VisitVerificationSession = VisitVerificationOperationResponse<'start', 201>;

export type CreatePlaceReviewBody =
  Pick<PlaceExplorationOperationRequestBody<'create_3'>, 'content' | 'recommendReasons' | 'reviewMediaIds'>;
export type PlaceReview =
  PlaceExplorationOperationResponse<'create_3', 200>;
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
    startForegroundSession: (
      body: ForegroundVisitVerificationStartBody,
      signal?: AbortSignal,
    ): Promise<VisitVerificationSession> => client.post<
      VisitVerificationSession,
      ForegroundVisitVerificationStartBody
    >('/visit-verification-sessions/foreground', body, { signal }),
    getSession: (
      sessionId: number,
      signal?: AbortSignal,
    ): Promise<VisitVerificationSession> => client.get<VisitVerificationSession>(
      `/visit-verification-sessions/${sessionId}`,
      { signal },
    ),
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
    uploadReviewMedia: (placeId: number, photo: SelectedPhoto, signal?: AbortSignal): Promise<PlaceExplorationOperationResponse<'upload_1', 201>> => {
      const form = new FormData();
      // React Native transports this file descriptor without reading the file into JS memory.
      form.append('file', reviewPhotoPart(photo) as unknown as Blob);
      return client.post(`/places/${placeId}/reviews/media`, form, { signal });
    },
    cancelReviewMedia: (placeId: number, reviewMediaId: number, signal?: AbortSignal): Promise<PlaceExplorationOperationResponse<'cancel_4', 204>> =>
      client.delete(`/places/${placeId}/reviews/media/${reviewMediaId}`, undefined, { signal }),
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
