import { useMutation } from '@tanstack/react-query';

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

export function useSubmitVisitVerification() {
  return useMutation(createVisitVerificationMutationOptions());
}
