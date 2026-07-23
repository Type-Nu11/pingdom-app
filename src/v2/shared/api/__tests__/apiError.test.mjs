import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, getApiErrorUx, toApiError } from '../index.ts';
import { shouldRetryQuery } from '../../../app/queryClient.ts';

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
