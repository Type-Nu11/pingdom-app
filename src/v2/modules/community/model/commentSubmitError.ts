import { getApiErrorUx, toApiError, type ApiErrorUxKind } from '../../../shared/api';

export function communityCommentErrorKind(error: unknown): ApiErrorUxKind {
  return getApiErrorUx(error).kind;
}

/**
 * The request body has a single field (`content`), so unlike the write form
 * there is no per-field lookup table: a `ValidationErrorResponse` entry only
 * ever names `content`, or names something this form doesn't recognize.
 */
export function communityCommentFieldError(error: unknown): string | undefined {
  return toApiError(error).fieldErrors?.find((fieldError) => fieldError.field === 'content')?.reason;
}

export type CommentBannerAction = 'none' | 'retry' | 'signIn';

/**
 * A plain 400/`ValidationErrorResponse` with a `content` field error is shown
 * inline under the input instead, so the banner only needs to fire for a 400
 * that leaves nothing else to explain it (no `content` entry at all).
 */
export function communityCommentBannerAction(error: unknown): CommentBannerAction {
  const { action, kind } = getApiErrorUx(error);
  if (action === 'retry' || action === 'signIn') return action;
  if (kind === 'validation' && !communityCommentFieldError(error)) return 'retry';
  return 'none';
}
