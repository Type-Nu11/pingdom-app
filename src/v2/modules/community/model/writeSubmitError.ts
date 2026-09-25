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

/**
 * True when a 400 leaves something the inline field errors don't already
 * explain: either no `errors` entry mapped onto a known form field at all
 * (a plain `ErrorResponse`, or a `ValidationErrorResponse` naming only
 * fields this form doesn't have), or the server named fields beyond the
 * ones already shown inline. Either way it must still surface somewhere,
 * so the banner picks it up.
 */
export function communityWriteHasUnmappedFieldError(error: unknown): boolean {
  const totalFieldErrors = toApiError(error).fieldErrors?.length ?? 0;
  const mappedFieldErrors = Object.keys(communityWriteServerFieldErrors(error)).length;
  return mappedFieldErrors === 0 || mappedFieldErrors < totalFieldErrors;
}

export type WriteBannerAction = 'none' | 'retry' | 'signIn';

/**
 * `getApiErrorUx` sends a 404 to the 'back' action, which is right for a
 * detail screen but wrong here: a missing connected place must not pop the
 * write form and discard the user's draft. A plain 400 with no actionable
 * field detail also gets a retry affordance here, even though the shared
 * classification treats validation as non-retryable elsewhere — a write
 * form has nothing else useful to offer beyond letting the user try again.
 */
export function communityWriteBannerAction(error: unknown): WriteBannerAction {
  const { action, kind } = getApiErrorUx(error);
  if (action === 'retry' || action === 'signIn') return action;
  if (kind === 'validation') return 'retry';
  return 'none';
}
