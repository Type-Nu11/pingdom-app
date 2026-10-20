import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { placeExplorationApi } from '../api/placeExplorationApi';
import type { RecommendationClickBody, RecommendationClickResult } from '../model/placeExploration.types';
import { recordRecommendationClickOnce } from '../model/recommendationClick';

export const useRecordPlaceRecommendationClick = () => {
  const sentClickKeys = useRef(new Set<string>());
  const recommendationClickMutation = useMutation<
    RecommendationClickResult,
    Error,
    RecommendationClickBody
  >({
    mutationFn: (payload) => placeExplorationApi.recordRecommendationClick(payload),
    retry: false,
  });

  const recordRecommendationClick = useCallback((payload: RecommendationClickBody) => {
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
