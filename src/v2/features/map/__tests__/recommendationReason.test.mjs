import assert from 'node:assert/strict';
import test from 'node:test';

import * as presentation from '../model/recommendationPresentation.ts';
import * as placeTypes from '../model/place.types.ts';

const translated = (key) => `translated:${key}`;
const selectReason = (input) => presentation.selectRecommendationReason?.(input, translated);

test('the same place keeps the same reason when its array index changes', () => {
  const place = { placeId: 17, reasonCode: 'NEARBY', reason: 'server text' };
  const reordered = [
    { placeId: 99, reasonCode: 'FRESH_CONTENT' },
    place,
  ];

  assert.deepEqual(selectReason(place), {
    source: 'reason-code',
    text: 'translated:map.recommendations.reasons.nearby',
  });
  assert.deepEqual(selectReason(reordered[1]), selectReason(place));
});

test('all server reason codes map to stable i18n keys', () => {
  const cases = [
    ['BENEFIT_AND_RESERVABLE', 'benefitAndReservable'],
    ['ACTIVE_BENEFIT', 'activeBenefit'],
    ['RESERVABLE', 'reservable'],
    ['CONTEXT_MATCH', 'contextMatch'],
    ['PERSONAL_SIGNAL', 'personalSignal'],
    ['FRESH_CONTENT', 'freshContent'],
    ['HIGH_ENGAGEMENT', 'highEngagement'],
    ['HIGH_CONVERSION', 'highConversion'],
    ['EXPLORATION', 'exploration'],
    ['QUALITY_SIGNAL', 'qualitySignal'],
    ['NEARBY', 'nearby'],
  ];

  for (const [reasonCode, suffix] of cases) {
    assert.deepEqual(selectReason({ placeId: 17, reasonCode, reason: 'ignored' }), {
      source: 'reason-code',
      text: `translated:map.recommendations.reasons.${suffix}`,
    });
  }
});

test('unknown reason codes safely use a non-empty server reason', () => {
  assert.deepEqual(selectReason({
    placeId: 17,
    reasonCode: 'SERVER_ADDED_CODE',
    reason: '  서버가 제공한 이유  ',
  }), {
    source: 'server-reason',
    text: '서버가 제공한 이유',
  });
});

test('blank server reasons use only the matching explanation placeId', () => {
  assert.deepEqual(selectReason({
    placeId: 17,
    reason: '   ',
    explanation: { placeId: 17, source: 'POPULAR' },
  }), {
    source: 'explanation',
    text: 'translated:map.recommendations.explanations.popular',
  });
  assert.deepEqual(selectReason({
    placeId: 17,
    reason: '\n',
    explanation: { placeId: 99, source: 'PERSONAL' },
  }), {
    source: 'neutral',
    text: 'translated:map.recommendations.reasons.neutral',
  });
});

test('all explanation sources map to neutral i18n claims without inspecting scores', () => {
  const cases = [
    ['PERSONAL', 'personal'],
    ['POPULAR', 'popular'],
    ['FRESH', 'fresh'],
    ['GEO', 'geo'],
    ['FALLBACK', 'fallback'],
  ];

  for (const [source, suffix] of cases) {
    assert.deepEqual(selectReason({
      placeId: 17,
      explanation: { placeId: 17, source, finalScore: 999 },
    }), {
      source: 'explanation',
      text: `translated:map.recommendations.explanations.${suffix}`,
    });
  }
});

test('unknown or malformed explanation data falls back to a neutral non-personalized label', () => {
  assert.deepEqual(selectReason({
    placeId: 17,
    explanation: { placeId: 17, source: 'NEW_SOURCE' },
  }), {
    source: 'neutral',
    text: 'translated:map.recommendations.reasons.neutral',
  });
  assert.equal(selectReason({ placeId: 17 }).text.includes('userName'), false);
});

test('explanations are accepted only for the current requestId and indexed by placeId', () => {
  const current = presentation.selectRecommendationExplanationsByPlaceId?.('request-b', {
    requestId: 'request-b',
    items: [
      { placeId: 22, ranking: 1, source: 'POPULAR' },
      { placeId: 11, ranking: 2, source: 'GEO' },
    ],
  });

  assert.equal(current?.get(11)?.source, 'GEO');
  assert.equal(current?.get(22)?.source, 'POPULAR');
  assert.equal(current?.get(1), undefined);

  const stale = presentation.selectRecommendationExplanationsByPlaceId?.('request-new', {
    requestId: 'request-old',
    items: [{ placeId: 11, source: 'PERSONAL' }],
  });
  assert.equal(stale?.size, 0);
});

test('optional generated recommendation items are normalized only after runtime identity checks', () => {
  const selected = placeTypes.selectUsableRecommendedPlaces?.([
    { id: 17, latitude: 37.5, longitude: 127, reasonCode: 'NEARBY' },
    { id: 18, latitude: 37.5 },
  ]);

  assert.deepEqual(selected, [{
    address: '',
    id: 17,
    latitude: 37.5,
    longitude: 127,
    name: '',
    reasonCode: 'NEARBY',
  }]);
});
