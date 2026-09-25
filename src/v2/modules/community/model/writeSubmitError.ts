import { getApiErrorUx, toApiError, type ApiErrorUxKind } from '../../../shared/api';

export type WriteServerFieldErrors = Partial<Record<'categoryId' | 'content' | 'placeIds' | 'title', string>>;

const KNOWN_FIELDS = ['categoryId', 'title', 'content', 'placeIds'] as const;

/**
 * Maps a 400 `ValidationErrorResponse.errors` entry (normalized by `ApiError`
 * into `fieldErrors`) onto the write form's own field keys. The request body
 * field names and the form field names are identical by construction, so no
 * separate lookup table is needed — only unrecognized fields are dropped.
 */
export function communityWriteServerFieldErrors(error: unknown): WriteServerFieldErrors {
  const apiError = toApiError(error);
  const result: WriteServerFieldErrors = {};

  for (const fieldError of apiError.fieldErrors ?? []) {
    if ((KNOWN_FIELDS as readonly string[]).includes(fieldError.field)) {
      result[fieldError.field as (typeof KNOWN_FIELDS)[number]] = fieldError.reason;
    }
  }

  return result;
}

export function communityWriteErrorKind(error: unknown): ApiErrorUxKind {
  return getApiErrorUx(error).kind;
}
