import { useMutation } from '@tanstack/react-query';

import {
  conversionApi,
  type ConversionEventBatchBody,
} from '../api/conversionApi';
import {
  getConversionRetryDelay,
  shouldRetryConversionEventMutation,
} from '../model/conversionRetry';

type ConversionApi = typeof conversionApi;

export function createConversionEventMutationOptions(
  api: Pick<ConversionApi, 'ingestEvents'> = conversionApi,
) {
  return {
    mutationFn: (body: ConversionEventBatchBody) => api.ingestEvents(body),
    retry: shouldRetryConversionEventMutation,
    retryDelay: getConversionRetryDelay,
  };
}

export function useIngestConversionEvents() {
  return useMutation(createConversionEventMutationOptions());
}
