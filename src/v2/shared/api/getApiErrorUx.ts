import { ApiError, toApiError } from './ApiError';

export type ApiErrorUxKind =
  | 'authentication'
  | 'authorization'
  | 'conflict'
  | 'expired'
  | 'generic'
  | 'notFound'
  | 'outOfRange'
  | 'updateRequired'
  | 'validation';

export type ApiErrorUx = {
  action: 'back' | 'none' | 'retry' | 'signIn' | 'update';
  error: ApiError;
  kind: ApiErrorUxKind;
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

export function getApiErrorUx(value: unknown): ApiErrorUx {
  const error = toApiError(value);
  const { code, status } = error;

  if (code === 'UNSUPPORTED_APP_VERSION' || (!code && status === 426)) {
    return { action: 'update', error, kind: 'updateRequired' };
  }

  if (AUTHENTICATION_CODES.has(code ?? '') || (!code && status === 401)) {
    return { action: 'signIn', error, kind: 'authentication' };
  }

  if (AUTHORIZATION_CODES.has(code ?? '') || (!code && status === 403)) {
    return { action: 'none', error, kind: 'authorization' };
  }

  if (
    code === 'VALIDATION_FAILED' ||
    code === 'INVALID_TRAVEL_SCHEDULE_PERIOD' ||
    (!code && status === 400)
  ) {
    return { action: 'none', error, kind: 'validation' };
  }

  if (code === 'EVENT_BATCH_TOO_LARGE') {
    return { action: 'none', error, kind: 'validation' };
  }

  if (code === 'CHECK_IN_OUT_OF_RANGE') {
    return { action: 'none', error, kind: 'outOfRange' };
  }

  if (code === 'TRAVEL_SCHEDULE_RULE_VIOLATION' || (!code && status === 422)) {
    return { action: 'none', error, kind: 'validation' };
  }

  if (
    code === 'COUPON_EXPIRED' ||
    code === 'RESOURCE_EXPIRED' ||
    (!code && status === 410)
  ) {
    return { action: 'none', error, kind: 'expired' };
  }

  if (code?.endsWith('_NOT_FOUND') || (!code && status === 404)) {
    return { action: 'back', error, kind: 'notFound' };
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
    return { action: 'none', error, kind: 'conflict' };
  }

  return { action: 'retry', error, kind: 'generic' };
}
