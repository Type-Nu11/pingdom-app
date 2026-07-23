import { useMutation } from '@tanstack/react-query';

import {
  conversionApi,
  type ConversionEventBatchBody,
} from '../api/conversionApi';

type ConversionApi = typeof conversionApi;

export function createConversionEventMutationOptions(
  api: Pick<ConversionApi, 'ingestEvents'> = conversionApi,
) {
  return { mutationFn: (body: ConversionEventBatchBody) => api.ingestEvents(body) };
}

export function useIngestConversionEvents() {
  return useMutation(createConversionEventMutationOptions());
}
