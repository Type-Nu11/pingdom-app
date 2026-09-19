import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, getApiErrorUx } from '../../../../shared/api/index.ts';
import { shouldRetryQuery } from '../../../queryClient.ts';

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
