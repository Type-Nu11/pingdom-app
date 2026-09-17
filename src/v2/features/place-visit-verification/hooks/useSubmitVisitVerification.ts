import { useState } from 'react';
import {
  assertReviewSubmissionDraft,
  requireReviewMediaId,
  serializeRecommendReasons,
  type SelectedPhoto,
  type RecommendReason,
} from '../model/visitVerification';
import { visitVerificationSessionQueryKeys } from '../model/visitVerificationSession';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { myReviewsQueryKeys } from '../../my-page/model/profileQueryKeys';
import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import {
  visitVerificationApi,
  type PlaceReview,
  type PlaceReviewPage,
} from '../api/visitVerificationApi';

type VisitVerificationApi = Pick<typeof visitVerificationApi, 'createReview' | 'uploadReviewMedia' | 'cancelReviewMedia'>;
export type ReviewSubmissionPhase = 'idle' | 'uploading' | 'submitting';
export type SubmitVisitVerificationVariables = {
  content: string;
  reasons: readonly RecommendReason[];
  photos: readonly SelectedPhoto[];
  placeId: number;
};

export function createVisitVerificationMutationOptions(
  api: VisitVerificationApi = visitVerificationApi,
  onPhase: (phase: ReviewSubmissionPhase) => void = () => {},
) {
  let inFlight: Promise<PlaceReview> | undefined;
  const submit = async ({ content, reasons, photos, placeId }: SubmitVisitVerificationVariables) => {
    const recommendReasons = serializeRecommendReasons(reasons);
    assertReviewSubmissionDraft({ content, reasons, photos });
    const reviewMediaIds: number[] = [];
    try {
      if (photos.length) onPhase('uploading');
      for (const photo of photos) {
        const uploaded = await api.uploadReviewMedia(placeId, photo);
        reviewMediaIds.push(requireReviewMediaId(uploaded.reviewMediaId));
      }
      onPhase('submitting');
      return await api.createReview(placeId, { content: content.trim(), recommendReasons, reviewMediaIds });
    } catch (error) {
      for (const id of reviewMediaIds) {
        try {
          await api.cancelReviewMedia(placeId, id);
        } catch {
          // Best effort: preserve the original failure.
        }
      }
      throw error;
    } finally {
      onPhase('idle');
    }
  };
  return {
    mutationFn: (variables: SubmitVisitVerificationVariables) => {
      if (inFlight) return inFlight;
      inFlight = submit(variables).finally(() => { inFlight = undefined; });
      return inFlight;
    },
    retry: false as const,
  };
}

export async function invalidateReviewQueries(
  queryClient: QueryClient,
  placeId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.reviews(placeId) }),
    queryClient.invalidateQueries({ queryKey: myReviewsQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.detail(placeId) }),
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.verificationMedia(placeId) }),
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.explorationMedia(placeId) }),
    queryClient.invalidateQueries({
      queryKey: visitVerificationSessionQueryKeys.all,
      predicate: (query) => (query.state.data as { placeId?: number } | undefined)?.placeId === placeId,
    }),
  ]);
}

export function primeSubmittedReviewQueries(
  queryClient: QueryClient,
  review: PlaceReview,
) {
  const placeId = review.placeId;
  const reviewId = review.reviewId;
  if (!placeId || !reviewId) return;

  queryClient.setQueriesData<PlaceReviewPage>(
    {
      queryKey: placeQueryKeys.reviews(placeId),
      predicate: (query) => (query.queryKey.at(-1) as { page?: number })?.page === 1,
    },
    (current) => {
      if (!current) return current;
      const alreadyIncluded = (current.content ?? []).some((item) => item.reviewId === reviewId);
      const content = [review, ...(current.content ?? []).filter(
        (item) => item.reviewId !== reviewId,
      )].slice(0, current.size ?? 20);
      return {
        ...current,
        content,
        empty: false,
        numberOfElements: content.length,
        totalElements: (current.totalElements ?? 0) + (alreadyIncluded ? 0 : 1),
      };
    },
  );
}

export function useSubmitVisitVerification() {
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<ReviewSubmissionPhase>('idle');
  const [options] = useState(() => createVisitVerificationMutationOptions(visitVerificationApi, setPhase));
  const mutation = useMutation({
    ...options,
    onSuccess: (review, variables) => {
      primeSubmittedReviewQueries(queryClient, review);
      // A cache refresh failure must not turn a persisted review into a retryable submission.
      void invalidateReviewQueries(queryClient, variables.placeId).catch(() => {});
    },
  });
  return { ...mutation, phase };
}
