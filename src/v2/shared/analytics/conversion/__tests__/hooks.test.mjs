import assert from 'node:assert/strict';
import test from 'node:test';
import { createConversionEventMutationOptions } from '../data/index.ts';

test('conversion Hook keeps one error owner and opts into its idempotent retry policy', () => {
  const options = createConversionEventMutationOptions({ ingestEvents: async () => ({}) });

  assert.equal(typeof options.retry, 'function');
  assert.equal(typeof options.retryDelay, 'function');
  assert.equal('onError' in options, false);
});
