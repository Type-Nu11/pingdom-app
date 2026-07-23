import {
  apiClient,
  type ApiClient,
  type OperationRequestBody,
  type OperationResponse,
} from '../../../shared/api';

export type ConversionEventBatchBody = OperationRequestBody<'ingestConversionEventBatch'>;
export type ConversionEventBatchResult = OperationResponse<'ingestConversionEventBatch', 202>;

export function createConversionApi(client: ApiClient = apiClient) {
  return {
    ingestEvents: (
      body: ConversionEventBatchBody,
      signal?: AbortSignal,
    ): Promise<ConversionEventBatchResult> =>
      client.post<ConversionEventBatchResult, ConversionEventBatchBody>(
        '/conversion-events/batch',
        body,
        { signal },
      ),
  };
}

export const conversionApi = createConversionApi();
