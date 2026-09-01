import { ApiError, toApiError } from './ApiError';

export type ApiErrorUxKind =
  | 'authentication'
  | 'authorization'
  | 'conflict'
  | 'expired'
  | 'generic'
  | 'network'
  | 'notFound'
  | 'outOfRange'
  | 'updateRequired'
  | 'validation';

export type ApiErrorUx = {
  action: 'back' | 'none' | 'retry' | 'signIn' | 'update';
  error: ApiError;
  kind: ApiErrorUxKind;
  /**
   * Whether retrying the same request can plausibly succeed without the user
   * changing anything. Only transport failures and unclassified/5xx errors are
   * retryable; every classified 4xx domain outcome is not.
   */
  retryable: boolean;
};

const AUTHENTICATION_CODES = new Set([
  'AUTH_REQUIRED',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'SIGNATURE_REQUIRED',
  'INVALID_SIGNATURE',
  'REQUEST_TIMESTAMP_OUT_OF_RANGE',
  'SIGNING_KEY_EXPIRED',
]);

const AUTHORIZATION_CODES = new Set([
  'FORBIDDEN',
  'ROLE_REQUIRED',
  'RESOURCE_OWNERSHIP_REQUIRED',
]);

const RETRYABLE_KINDS = new Set<ApiErrorUxKind>(['generic', 'network']);

function build(
  error: ApiError,
  kind: ApiErrorUxKind,
  action: ApiErrorUx['action'],
): ApiErrorUx {
  return { action, error, kind, retryable: RETRYABLE_KINDS.has(kind) };
}

export function getApiErrorUx(value: unknown): ApiErrorUx {
  const error = toApiError(value);
  const { code, status } = error;

  // Transport failure: no HTTP response reached the client. Distinct from a 5xx
  // or an empty list, and always safe to retry.
  if (error.isNetworkError) {
    return build(error, 'network', 'retry');
  }

  if (code === 'UNSUPPORTED_APP_VERSION' || (!code && status === 426)) {
    return build(error, 'updateRequired', 'update');
  }

  if (AUTHENTICATION_CODES.has(code ?? '') || (!code && status === 401)) {
    return build(error, 'authentication', 'signIn');
  }

  if (AUTHORIZATION_CODES.has(code ?? '') || (!code && status === 403)) {
    return build(error, 'authorization', 'none');
  }

  if (
    code === 'VALIDATION_FAILED' ||
    code === 'INVALID_TRAVEL_SCHEDULE_PERIOD' ||
    code === 'COUPON_LIST_FILTER_INVALID' ||
    (!code && status === 400)
  ) {
    return build(error, 'validation', 'none');
  }

  if (code === 'EVENT_BATCH_TOO_LARGE') {
    return build(error, 'validation', 'none');
  }

  if (code === 'CHECK_IN_OUT_OF_RANGE') {
    return build(error, 'outOfRange', 'none');
  }

  if (code === 'TRAVEL_SCHEDULE_RULE_VIOLATION' || (!code && status === 422)) {
    return build(error, 'validation', 'none');
  }

  if (
    code === 'COUPON_EXPIRED' ||
    code === 'RESOURCE_EXPIRED' ||
    (!code && status === 410)
  ) {
    return build(error, 'expired', 'none');
  }

  if (code?.endsWith('_NOT_FOUND') || (!code && status === 404)) {
    return build(error, 'notFound', 'back');
  }

  if (
    code === 'REPLAY_DETECTED' ||
    code === 'INVALID_STATE_TRANSITION' ||
    code === 'CAPACITY_EXCEEDED' ||
    code === 'COUPON_ALREADY_ISSUED' ||
    code === 'COUPON_ALREADY_REDEEMED' ||
    code === 'TRAVEL_SCHEDULE_NOT_EDITABLE' ||
    code === 'TRAVEL_SCHEDULE_CONCURRENT_MODIFICATION' ||
    code?.endsWith('_ALREADY_EXISTS') ||
    (!code && status === 409)
  ) {
    return build(error, 'conflict', 'none');
  }

  return build(error, 'generic', 'retry');
}
