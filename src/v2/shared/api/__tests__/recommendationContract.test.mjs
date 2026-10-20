import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contractPath = new URL('../../../../../docs/api/place-exploration.openapi.json', import.meta.url);

test('recommendation snapshot preserves deployed optional, nullable, enum, and error contracts', async () => {
  const document = JSON.parse(await readFile(contractPath, 'utf8'));
  const recommendation = document.paths['/places/recommendations'].get;
  const explanation = document.paths['/places/recommendations/{requestId}/explanation'].get;
  const click = document.paths['/places/recommendations/click'].post;
  const item = document.components.schemas.PlaceRecommendationItem;
  const response = document.components.schemas.PlaceRecommendationResponse;
  const explanationItem = document.components.schemas.PlaceRecommendationExplanationItem;
  const explanationResponse = document.components.schemas.PlaceRecommendationExplanationResponse;
  const clickBody = document.components.schemas.PlaceRecommendationClickRequest;

  assert.deepEqual(Object.keys(recommendation.responses).sort(), ['200', '400', '401', '403']);
  assert.deepEqual(Object.keys(explanation.responses).sort(), ['200', '401', '403', '404']);
  assert.deepEqual(Object.keys(click.responses).sort(), ['201', '400', '401', '403', '404']);
  assert.equal(item.required, undefined);
  assert.equal(response.required, undefined);
  assert.equal(explanationItem.required, undefined);
  assert.equal(explanationResponse.required, undefined);
  assert.equal(item.properties.currentlyOperating.nullable, true);
  assert.equal(response.properties.appliedActivityIntent.nullable, true);
  assert.deepEqual(item.properties.reasonCode.enum, [
    'BENEFIT_AND_RESERVABLE',
    'ACTIVE_BENEFIT',
    'RESERVABLE',
    'CONTEXT_MATCH',
    'PERSONAL_SIGNAL',
    'FRESH_CONTENT',
    'HIGH_ENGAGEMENT',
    'HIGH_CONVERSION',
    'EXPLORATION',
    'QUALITY_SIGNAL',
    'NEARBY',
  ]);
  assert.deepEqual(explanationItem.properties.source.enum, [
    'PERSONAL', 'POPULAR', 'FRESH', 'GEO', 'FALLBACK',
  ]);
  assert.deepEqual(clickBody.required.sort(), [
    'placeId', 'recommendationVersion', 'requestId',
  ]);
});
