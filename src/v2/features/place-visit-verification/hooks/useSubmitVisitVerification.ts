import { useMutation, useQueryClient } from '@tanstack/react-query';

import { myReviewsQueryKeys } from '../../my-page/model/profileQueryKeys';
import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import {
  visitVerificationApi,
  type CreatePlaceReviewBody,
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
  queryClient: ReturnType<typeof useQueryClient>,
  placeId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: placeQueryKeys.reviews(placeId) }),
    queryClient.invalidateQueries({ queryKey: myReviewsQueryKeys.all }),
  ]);
}

export function useSubmitVisitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createVisitVerificationMutationOptions(),
    onSuccess: (_review, variables) => invalidateReviewQueries(queryClient, variables.placeId),
  });
}
