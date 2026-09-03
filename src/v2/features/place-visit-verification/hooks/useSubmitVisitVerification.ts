import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { myReviewsQueryKeys } from '../../my-page/model/profileQueryKeys';
import type { MyPlaceReviewPage } from '../../my-page/model/profile.types';
import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import {
  visitVerificationApi,
  type CreatePlaceReviewBody,
  type PlaceReview,
  type PlaceReviewPage,
} from '../api/visitVerificationApi';

type VisitVerificationApi = Pick<typeof visitVerificationApi, 'createReview'>;

export type SubmitVisitVerificationVariables = {
  body: CreatePlaceReviewBody;
  placeId: number;
};

export function createVisitVerificationMutationOptions(
  api: VisitVerificationApi = visitVerificationApi,
) {
  return {
    mutationFn: ({ body, placeId }: SubmitVisitVerificationVariables) =>
      api.createReview(placeId, body),
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
    { queryKey: placeQueryKeys.reviews(placeId) },
    (current) => {
      if (!current) return current;
      const alreadyIncluded = (current.content ?? []).some((item) => item.reviewId === reviewId);
      const content = [review, ...(current.content ?? []).filter(
        (item) => item.reviewId !== reviewId,
      )];
      return {
        ...current,
        content,
        empty: false,
        numberOfElements: content.length,
        totalElements: Math.max(
          (current.totalElements ?? 0) + (alreadyIncluded ? 0 : 1),
          content.length,
        ),
      };
    },
  );
  queryClient.setQueryData<PlaceReviewPage>(
    placeQueryKeys.reviewList(placeId, { limit: 20, page: 1 }),
    (current) => {
      const content = [review, ...(current?.content ?? []).filter(
        (item) => item.reviewId !== reviewId,
      )];
      return {
        ...current,
        content,
        empty: false,
        first: current?.first ?? true,
        last: current?.last ?? true,
        number: current?.number ?? 0,
        numberOfElements: content.length,
        size: current?.size ?? 20,
        totalElements: Math.max(current?.totalElements ?? 0, content.length),
        totalPages: Math.max(current?.totalPages ?? 0, 1),
      };
    },
  );

  queryClient.setQueryData<MyPlaceReviewPage>(
    myReviewsQueryKeys.list({ limit: 1, page: 1 }),
    (current) => {
      const alreadyIncluded = current?.reviews.some((item) => item.reviewId === reviewId) ?? false;
      return {
        hasNext: current?.hasNext ?? false,
        limit: current?.limit ?? 1,
        page: current?.page ?? 1,
        reviews: [{
          content: review.content ?? '',
          createdAt: review.createdAt ?? '',
          imageUrls: review.imageUrls ?? [],
          placeId,
          recommendReason: review.recommendReason ?? '',
          reviewId,
          visibilityStatus: 'VISIBLE',
        }],
        totalElements: Math.max(
          (current?.totalElements ?? 0) + (alreadyIncluded ? 0 : 1),
          1,
        ),
        totalPages: Math.max(current?.totalPages ?? 0, 1),
      };
    },
  );
}

export function useSubmitVisitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createVisitVerificationMutationOptions(),
    onSuccess: (review, variables) => {
      primeSubmittedReviewQueries(queryClient, review);
      return invalidateReviewQueries(queryClient, variables.placeId);
    },
  });
}
