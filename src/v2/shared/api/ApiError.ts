import axios from 'axios';

type ApiErrorDetails = {
  code?: string;
  status?: number;
};

export class ApiError extends Error {
  readonly code?: string;
  readonly status?: number;

  constructor(message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = details.code;
    this.status = details.status;
  }
}

function getErrorResponseData(value: unknown): { code?: string; message?: string } {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const response = value as { code?: unknown; message?: unknown };

  return {
    code: typeof response.code === 'string' ? response.code : undefined,
    message: typeof response.message === 'string' ? response.message : undefined,
  };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const response = getErrorResponseData(error.response?.data);

    return new ApiError(response.message ?? error.message, {
      code: response.code ?? error.code,
      status: error.response?.status,
    });
  }

  return new ApiError(error instanceof Error ? error.message : 'Unknown API error');
}
