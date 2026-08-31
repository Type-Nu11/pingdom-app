import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  placeApi,
  type RecordRecommendationClickRequest,
  type RecordRecommendationClickResponse,
} from '../api/placeApi';
import { recordRecommendationClickOnce } from '../model/recommendationClick';

export const useRecordPlaceRecommendationClick = () => {
  const sentClickKeys = useRef(new Set<string>());
  const recommendationClickMutation = useMutation<
    RecordRecommendationClickResponse,
    Error,
    RecordRecommendationClickRequest
  >({
    mutationFn: (payload) => placeApi.recordRecommendationClick(payload),
    retry: false,
  });

  const recordRecommendationClick = useCallback((payload: RecordRecommendationClickRequest) => {
    return recordRecommendationClickOnce(
      payload,
      sentClickKeys.current,
      recommendationClickMutation.mutateAsync,
    );
  }, [recommendationClickMutation]);

  return {
    isPending: recommendationClickMutation.isPending,
    recordRecommendationClick,
  };
};

export default useRecordPlaceRecommendationClick;
