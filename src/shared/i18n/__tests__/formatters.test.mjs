import assert from 'node:assert/strict';
import test from 'node:test';

import { formatRelativeMinutes } from '../formatters.ts';

test('relative minutes use Intl.RelativeTimeFormat when the runtime supports it', () => {
  assert.equal(formatRelativeMinutes(7, 'en'), '7 minutes ago');
  assert.ok(formatRelativeMinutes(0, 'ko').length > 0);
});

test('relative minutes fall back when Hermes does not provide Intl.RelativeTimeFormat', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, 'RelativeTimeFormat');

  Object.defineProperty(Intl, 'RelativeTimeFormat', {
    configurable: true,
    value: undefined,
  });

  try {
    assert.equal(formatRelativeMinutes(18, 'ko-KR'), '18분 전');
    assert.equal(formatRelativeMinutes(7, 'ja-JP'), '7分前');
    assert.equal(formatRelativeMinutes(5, 'en-US'), '5 min ago');
  } finally {
    if (descriptor) {
      Object.defineProperty(Intl, 'RelativeTimeFormat', descriptor);
    } else {
      delete Intl.RelativeTimeFormat;
    }
  }
});
