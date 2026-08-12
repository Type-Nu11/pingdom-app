import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, getApiErrorUx, toApiError } from '../index.ts';
import { shouldRetryQuery } from '../../../app/queryClient.ts';
import {
  getConversionRetryDelay,
  shouldRetryConversionEventMutation,
} from '../../../features/conversion/model/conversionRetry.ts';

test('contract ErrorResponse fields are retained for forms and support logging', () => {
  const response = {
    code: 'VALIDATION_FAILED',
    details: { reason: 'invalid' },
    fieldErrors: [{ field: 'quantity', reason: 'must be positive' }],
    message: 'Validation failed',
    traceId: 'trace-123',
  };
  const error = toApiError({
    isAxiosError: true,
    message: 'Request failed',
    response: { data: response, status: 400 },
  });

  assert.equal(error.code, 'VALIDATION_FAILED');
  assert.equal(error.status, 400);
  assert.equal(error.traceId, 'trace-123');
  assert.deepEqual(error.fieldErrors, response.fieldErrors);
  assert.deepEqual(error.details, response.details);
});

test('current account validation errors normalize legacy errors maps for forms', () => {
  const error = toApiError({
    isAxiosError: true,
    message: 'Request failed',
    response: {
      data: {
        errors: { email: '이메일 형식이 올바르지 않습니다.' },
        message: '입력값을 확인해주세요.',
      },
      status: 400,
    },
  });

  assert.deepEqual(error.fieldErrors, [
    { field: 'email', reason: '이메일 형식이 올바르지 않습니다.' },
  ]);
  assert.equal(error.message, '입력값을 확인해주세요.');
  assert.equal(getApiErrorUx(error).kind, 'validation');
});

test('400/401/403/404/409/410/422/426 errors select contract UX branches', () => {
  const cases = [
    [400, 'VALIDATION_FAILED', 'validation', 'none'],
    [401, 'TOKEN_EXPIRED', 'authentication', 'signIn'],
    [403, 'ROLE_REQUIRED', 'authorization', 'none'],
    [404, 'PLACE_NOT_FOUND', 'notFound', 'back'],
    [409, 'CHECK_IN_ALREADY_EXISTS', 'conflict', 'none'],
    [410, 'COUPON_EXPIRED', 'expired', 'none'],
    [422, 'CHECK_IN_OUT_OF_RANGE', 'outOfRange', 'none'],
    [426, 'UNSUPPORTED_APP_VERSION', 'updateRequired', 'update'],
  ];

  for (const [status, code, kind, action] of cases) {
    const ux = getApiErrorUx(new ApiError('contract error', { code, status }));
    assert.equal(ux.kind, kind);
    assert.equal(ux.action, action);
  }
});

test('network and unexpected errors remain retryable', () => {
  assert.deepEqual(
    (({ action, kind }) => ({ action, kind }))(getApiErrorUx(new Error('offline'))),
    { action: 'retry', kind: 'generic' },
  );
  assert.equal(shouldRetryQuery(0, new Error('offline')), true);
  assert.equal(shouldRetryQuery(1, new Error('offline')), true);
  assert.equal(shouldRetryQuery(2, new Error('offline')), false);
  assert.equal(shouldRetryQuery(0, new ApiError('validation', { status: 400 })), false);
  assert.equal(shouldRetryQuery(0, new ApiError('server unavailable', { status: 503 })), true);
});

test('common conversion identifies transport failures without retrying programmer errors', () => {
  const networkError = toApiError({
    code: 'ERR_NETWORK',
    isAxiosError: true,
    message: 'Network Error',
  });
  const canceledError = toApiError({
    code: 'ERR_CANCELED',
    isAxiosError: true,
    message: 'canceled',
  });

  assert.equal(networkError.isNetworkError, true);
  assert.equal(canceledError.isNetworkError, false);
  assert.equal(toApiError(new TypeError('bug')).isNetworkError, false);
});

test('domain conflict and batch-limit codes branch without relying on HTTP status', () => {
  assert.equal(
    getApiErrorUx(new ApiError('coupon used', { code: 'COUPON_ALREADY_REDEEMED' })).kind,
    'conflict',
  );
  assert.equal(
    getApiErrorUx(new ApiError('capacity', { code: 'CAPACITY_EXCEEDED' })).kind,
    'conflict',
  );
  assert.equal(
    getApiErrorUx(new ApiError('batch', { code: 'EVENT_BATCH_TOO_LARGE' })).kind,
    'validation',
  );
});

test('unknown domain codes are preserved and are not reclassified from status alone', () => {
  const response = {
    code: 'MAP_LINK_CONVERSION_CONFLICT',
    message: 'A domain-specific conversion conflict',
    correlationId: 'server-specific-field',
  };
  const error = toApiError({
    isAxiosError: true,
    message: 'Request failed',
    response: { data: response, status: 409 },
  });

  assert.equal(error.code, response.code);
  assert.equal(error.status, 409);
  assert.equal(error.responseData, response);
  assert.equal(getApiErrorUx(error).kind, 'generic');
});

test('travel schedule validation and conflict codes keep distinct server meanings', () => {
  const cases = [
    [400, 'INVALID_TRAVEL_SCHEDULE_PERIOD', 'validation'],
    [404, 'TRAVEL_SCHEDULE_NOT_FOUND', 'notFound'],
    [409, 'TRAVEL_SCHEDULE_NOT_EDITABLE', 'conflict'],
    [409, 'TRAVEL_SCHEDULE_CONCURRENT_MODIFICATION', 'conflict'],
    [422, 'TRAVEL_SCHEDULE_RULE_VIOLATION', 'validation'],
  ];

  for (const [status, code, kind] of cases) {
    const error = new ApiError('schedule error', { code, status });
    const ux = getApiErrorUx(error);

    assert.equal(error.code, code);
    assert.equal(ux.error, error);
    assert.equal(ux.kind, kind);
  }
});

test('conversion POST retries only transient failures and has a finite retry budget', () => {
  const offline = new ApiError('offline', { isNetworkError: true });

  assert.equal(shouldRetryConversionEventMutation(0, offline), true);
  assert.equal(shouldRetryConversionEventMutation(1, new ApiError('server', { status: 503 })), true);
  assert.equal(shouldRetryConversionEventMutation(2, offline), false);
  assert.equal(
    shouldRetryConversionEventMutation(0, new ApiError('expired token', { status: 401 })),
    false,
  );
  assert.equal(
    shouldRetryConversionEventMutation(0, new ApiError('invalid batch', { status: 400 })),
    false,
  );
  assert.equal(
    shouldRetryConversionEventMutation(0, new ApiError('canceled', { code: 'ERR_CANCELED' })),
    false,
  );
  assert.equal(shouldRetryConversionEventMutation(0, new TypeError('programmer error')), false);
});

test('conversion retry delay is bounded exponential backoff with jitter', () => {
  assert.equal(getConversionRetryDelay(0, () => 0), 375);
  assert.equal(getConversionRetryDelay(0, () => 1), 625);
  assert.equal(getConversionRetryDelay(1, () => 0.5), 1_000);
  assert.equal(getConversionRetryDelay(20, () => 1), 5_000);
});
