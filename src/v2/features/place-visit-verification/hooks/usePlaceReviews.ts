import { useQuery } from '@tanstack/react-query';

import { placeQueryKeys } from '../../../shared/query/placeQueryKeys';
import {
  visitVerificationApi,
  type PlaceReviewListParams,
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
