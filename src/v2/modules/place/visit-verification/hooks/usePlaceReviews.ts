import { useMemo } from 'react';
import type { SelectedPhoto } from '../model/visitVerification';
import { invalidateReviewQueries } from './useSubmitVisitVerification';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { placeQueryKeys } from '../../core';
import {
  visitVerificationApi,
  type PlaceReviewListParams,
  type UpdatePlaceReviewBody,
} from '../api/visitVerificationApi';

type VisitVerificationApi = Pick<typeof visitVerificationApi, 'getReviews'>;

const REVIEW_COUNT_PARAMS = { limit: 1, page: 1 } satisfies PlaceReviewListParams;

export function createPlaceReviewsQueryOptions(
  placeId: number,
  params: PlaceReviewListParams = REVIEW_COUNT_PARAMS,
  api: VisitVerificationApi = visitVerificationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getReviews(placeId, params, signal),
    queryKey: placeQueryKeys.reviewList(placeId, params),
  };
}

export function usePlaceReviews(placeId: number, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...createPlaceReviewsQueryOptions(placeId), enabled });
}


export function createPlaceReviewSummaryQueryOptions(placeId: number) {
  return { queryKey: [...placeQueryKeys.reviews(placeId), 'summary'] as const,
    queryFn: ({ signal }: { signal?: AbortSignal }) => visitVerificationApi.getReviewSummary(placeId, signal) };
}

export function useUpdatePlaceReview(placeId: number, reviewId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: UpdatePlaceReviewBody) => visitVerificationApi.updateReview(placeId, reviewId, body),
    retry: false, onSuccess: () => invalidateReviewQueries(client, placeId) });
}

export function useDeletePlaceReview(placeId?: number, reviewId?: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => {
    if (!placeId || !reviewId) throw new Error('Review identity missing');
    return visitVerificationApi.deleteReview(placeId, reviewId);
  }, retry: false, onSuccess: () => invalidateReviewQueries(client, placeId!) });
}

export function useReviewEditMedia(placeId: number) {
  return useMemo(() => ({
    upload: async (source: SelectedPhoto) => (await visitVerificationApi.uploadReviewMedia(placeId, source)).reviewMediaId!,
    discard: (id: number) => visitVerificationApi.cancelReviewMedia(placeId, id),
  }), [placeId]);
}
