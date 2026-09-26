import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, getApiErrorUx, toApiError } from '../index.ts';

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

test('unknown server error codes and payload fields are preserved losslessly', () => {
  const response = {
    code: 'FUTURE_ACTIVITY_INTENT_ERROR',
    context: { expiresAt: '2026-08-11T14:00:00Z' },
    message: 'Future server error',
    nested: ['untouched'],
  };
  const error = toApiError({
    isAxiosError: true,
    message: 'Request failed',
    response: { data: response, status: 409 },
  });

  assert.equal(error.code, 'FUTURE_ACTIVITY_INTENT_ERROR');
  assert.equal(error.status, 409);
  assert.equal(error.responseBody, response);
  assert.equal(error.responseData, response);
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


test('transport failures classify as a distinct retryable network kind', () => {
  const networkError = toApiError({
    code: 'ERR_NETWORK',
    isAxiosError: true,
    message: 'Network Error',
  });
  const ux = getApiErrorUx(networkError);

  assert.equal(ux.kind, 'network');
  assert.equal(ux.action, 'retry');
  assert.equal(ux.retryable, true);

  // A 5xx with a response is NOT a network error: still generic + retryable.
  const serverError = getApiErrorUx(new ApiError('unavailable', { status: 503 }));
  assert.equal(serverError.kind, 'server');
  assert.equal(serverError.retryable, true);
});

test('retryable is true only for network and generic, false for every classified domain kind', () => {
  const retryable = [
    getApiErrorUx(new Error('offline')),
    getApiErrorUx(toApiError({ code: 'ERR_NETWORK', isAxiosError: true, message: 'Network Error' })),
  ];
  for (const ux of retryable) {
    assert.equal(ux.retryable, true);
  }

  const notRetryable = [
    new ApiError('x', { code: 'TOKEN_EXPIRED', status: 401 }),
    new ApiError('x', { code: 'ROLE_REQUIRED', status: 403 }),
    new ApiError('x', { code: 'VALIDATION_FAILED', status: 400 }),
    new ApiError('x', { code: 'COUPON_NOT_FOUND', status: 404 }),
    new ApiError('x', { code: 'COUPON_ALREADY_ISSUED', status: 409 }),
    new ApiError('x', { code: 'COUPON_EXPIRED', status: 410 }),
    new ApiError('x', { status: 409 }),
    new ApiError('x', { code: 'UNSUPPORTED_APP_VERSION', status: 426 }),
  ];
  for (const error of notRetryable) {
    assert.equal(getApiErrorUx(error).retryable, false);
  }
});

test('coupon and offer operation errors map to stable UX kinds', () => {
  // status, code, expectedKind — code omitted when the server may not send one.
  const cases = [
    // getOffer / listIssuableOffers
    [401, undefined, 'authentication'],
    [403, undefined, 'authorization'],
    [404, 'OFFER_NOT_FOUND', 'notFound'],
    // issueCoupon
    [404, 'COUPON_NOT_FOUND', 'notFound'],
    [409, 'COUPON_ALREADY_ISSUED', 'conflict'],
    [409, 'CAPACITY_EXCEEDED', 'conflict'],
    [409, undefined, 'conflict'],
    [410, 'COUPON_EXPIRED', 'expired'],
    // listMyCoupons
    [400, undefined, 'generic'],
    // redeemCoupon
    [409, 'COUPON_ALREADY_REDEEMED', 'conflict'],
  ];

  for (const [status, code, kind] of cases) {
    assert.equal(getApiErrorUx(new ApiError('coupon error', { code, status })).kind, kind);
  }
});

test('a bare 409 is not reclassified as sold-out, expired, or duplicate from status alone', () => {
  const ux = getApiErrorUx(new ApiError('conflict', { status: 409 }));

  assert.equal(ux.kind, 'conflict');
  assert.equal(ux.error.code, undefined);
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
  assert.equal(
    getApiErrorUx(
      new ApiError('bad coupon filter', { code: 'COUPON_LIST_FILTER_INVALID', status: 400 }),
    ).kind,
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

test('unclassified 400 and signing failures never blame input or require sign-in', () => {
  assert.equal(getApiErrorUx(new ApiError('html', { status: 400 })).kind, 'generic');
  for (const code of ['SIGNATURE_REQUIRED', 'INVALID_SIGNATURE', 'REQUEST_TIMESTAMP_OUT_OF_RANGE', 'SIGNING_KEY_EXPIRED']) {
    assert.equal(getApiErrorUx(new ApiError('secret', { code, status: 401 })).action, 'none');
  }
});

test('rate limits, timeouts, server outages and cancellation have explicit presentation', () => {
  assert.equal(getApiErrorUx(new ApiError('secret', { status: 429 })).kind, 'rateLimited');
  assert.equal(getApiErrorUx(new ApiError('html', { status: 503 })).kind, 'server');
  assert.equal(getApiErrorUx(toApiError({ isAxiosError: true, code: 'ECONNABORTED' })).kind, 'timeout');
  assert.equal(getApiErrorUx(toApiError({ isAxiosError: true, code: 'ERR_CANCELED' })).kind, 'canceled');
});

test('Axios transport codes do not shadow HTTP 401/403/400 classification', () => {
  for (const [status, kind] of [[401, 'authentication'], [403, 'authorization'], [400, 'generic']]) {
    const error = toApiError({ isAxiosError: true, code: 'ERR_BAD_REQUEST', response: { status, data: {} } });
    assert.equal(getApiErrorUx(error).kind, kind);
  }
  const abort = new Error('screen left');
  abort.name = 'AbortError';
  assert.equal(getApiErrorUx(abort).kind, 'canceled');
});


test('HTML proxy 401 does not suggest sign-in', () => {
  const error = toApiError({ isAxiosError: true, response: { status: 401, data: '<html>proxy</html>' } });
  assert.equal(getApiErrorUx(error).kind, 'generic');
  assert.equal(getApiErrorUx(error).action, 'none');
});
