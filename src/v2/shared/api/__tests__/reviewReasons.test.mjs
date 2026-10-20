import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeReviewReasons,
  reviewReasonsFromResponse,
} from '../reviewReasons.ts';

test('missing, null and empty reason fields normalize to an empty list', () => {
  assert.deepEqual(normalizeReviewReasons(undefined), []);
  assert.deepEqual(normalizeReviewReasons(null), []);
  assert.deepEqual(normalizeReviewReasons([]), []);
  assert.deepEqual(reviewReasonsFromResponse({}), []);
  assert.deepEqual(reviewReasonsFromResponse({ recommendReasons: null }), []);
});

test('server order is kept and duplicate codes collapse to the first occurrence', () => {
  assert.deepEqual(
    normalizeReviewReasons(['CLEAN', 'FRIENDLY', 'CLEAN', 'GOOD_FOOD', 'FRIENDLY']),
    ['clean', 'kind', 'delicious'],
  );
});

test('unknown codes are dropped and never surface as raw text', () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(message);
  try {
    assert.deepEqual(normalizeReviewReasons(['SOMETHING_NEW', '맛있어요']), []);
    assert.deepEqual(normalizeReviewReasons(['PARKING', 'SOMETHING_NEW', 'PHOTO_SPOT']), ['parking', 'photoSpot']);
  } finally {
    console.warn = originalWarn;
  }
  assert.ok(warnings.every((message) => message.startsWith('[review-reasons]')));
});

test('every server enum code maps to one reason', () => {
  assert.deepEqual(
    normalizeReviewReasons(['FRIENDLY', 'EASY_TO_FIND', 'GOOD_FOOD', 'MULTILINGUAL_SUPPORT', 'PARKING', 'PHOTO_SPOT', 'CLEAN']),
    ['kind', 'easyToFind', 'delicious', 'multilingual', 'parking', 'photoSpot', 'clean'],
  );
});

test('recommendReasons wins over the deprecated single recommendReason', () => {
  assert.deepEqual(
    reviewReasonsFromResponse({ recommendReason: 'PARKING', recommendReasons: ['CLEAN'] }),
    ['clean'],
  );
  assert.deepEqual(
    reviewReasonsFromResponse({ recommendReason: 'PARKING', recommendReasons: [] }),
    [],
  );
});

test('the deprecated recommendReason only counts when it is a known code', () => {
  assert.deepEqual(reviewReasonsFromResponse({ recommendReason: 'PARKING' }), ['parking']);
  assert.deepEqual(reviewReasonsFromResponse({ recommendReason: '음식이 맛있어요' }), []);
  assert.deepEqual(reviewReasonsFromResponse({ recommendReason: '' }), []);
});
