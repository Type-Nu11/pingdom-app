import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from '../../../api/index.ts';
import { getConversionRetryDelay, shouldRetryConversionEventMutation } from '../model/conversionRetry.ts';

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
