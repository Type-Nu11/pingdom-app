import { useMutation } from '@tanstack/react-query';
import {
  placeApi,
  type RecordRecommendationClickRequest,
  type RecordRecommendationClickResponse,
} from '../api/placeApi';

export const useRecordPlaceRecommendationClick = () => {
  const recommendationClickMutation = useMutation<
    RecordRecommendationClickResponse,
    Error,
    RecordRecommendationClickRequest
  >({
    mutationFn: (payload) => placeApi.recordRecommendationClick(payload),
  });

  return {
    isPending: recommendationClickMutation.isPending,
    recordRecommendationClick: recommendationClickMutation.mutateAsync,
  };
};

export default useRecordPlaceRecommendationClick;
