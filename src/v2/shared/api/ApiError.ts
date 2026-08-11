import axios from 'axios';

import type { ErrorResponse, FieldError } from './contract';

type ApiErrorDetails = {
  code?: string;
  details?: Record<string, unknown> | null;
  fieldErrors?: FieldError[] | null;
  isNetworkError?: boolean;
  response?: ErrorResponse;
  status?: number;
  traceId?: string;
};

export class ApiError extends Error {
  readonly code?: string;
  readonly details: Record<string, unknown> | null;
  readonly fieldErrors: FieldError[] | null;
  readonly isNetworkError: boolean;
  readonly status?: number;
  readonly traceId?: string;

  constructor(message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = details.response?.code ?? details.code;
    this.details = details.response?.details ?? details.details ?? null;
    this.fieldErrors = details.response?.fieldErrors ?? details.fieldErrors ?? null;
    this.isNetworkError = details.isNetworkError ?? false;
    this.status = details.status;
    this.traceId = details.response?.traceId ?? details.traceId;
  }
}

function getErrorResponseData(value: unknown): {
  code?: string;
  details?: Record<string, unknown> | null;
  fieldErrors?: FieldError[] | null;
  message?: string;
  response?: ErrorResponse;
  traceId?: string;
} {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const response = value as Partial<Record<keyof ErrorResponse, unknown>>;
  const legacyErrors = (value as { errors?: unknown }).errors;
  const code = typeof response.code === 'string' ? response.code : undefined;
  const message = typeof response.message === 'string' ? response.message : undefined;
  const traceId = typeof response.traceId === 'string' ? response.traceId : undefined;

  const fieldErrors = Array.isArray(response.fieldErrors)
    ? response.fieldErrors.filter(
        (item): item is FieldError =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as FieldError).field === 'string' &&
          typeof (item as FieldError).reason === 'string',
      )
    : response.fieldErrors === null
      ? null
      : legacyErrors && typeof legacyErrors === 'object' && !Array.isArray(legacyErrors)
        ? Object.entries(legacyErrors)
            .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
            .map(([field, reason]) => ({ field, reason }))
        : undefined;

  const responseDetails =
    response.details === null ||
    (typeof response.details === 'object' && !Array.isArray(response.details))
      ? response.details as Record<string, unknown> | null
      : undefined;

  const contractResponse = code && message && traceId && fieldErrors !== undefined && responseDetails !== undefined
    ? {
        code: code as ErrorResponse['code'],
        details: responseDetails,
        fieldErrors,
        message,
        traceId,
      }
    : undefined;

  return {
    code,
    details: responseDetails,
    fieldErrors,
    message,
    response: contractResponse,
    traceId,
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
      details: response.details,
      fieldErrors: response.fieldErrors,
      isNetworkError: error.response === undefined && error.code !== 'ERR_CANCELED',
      response: response.response,
      status: error.response?.status,
      traceId: response.traceId,
    });
  }

  return new ApiError(error instanceof Error ? error.message : 'Unknown API error');
}
