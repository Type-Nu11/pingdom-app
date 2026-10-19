import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const doc = JSON.parse(await readFile('docs/api/place-reviews.openapi.json', 'utf8'));
for (const [path, method, id, status] of [
  ['/places/{placeId}/reviews/{reviewId}', 'patch', 'updateReview', 200],
  ['/places/{placeId}/reviews/{reviewId}', 'delete', 'deleteReview', 204],
  ['/places/{placeId}/reviews/summary', 'get', 'getReviewSummary', 200],
]) {
  const op = doc.paths[path][method];
  assert.equal(op.operationId, id); assert.ok(op.responses[status]);
  assert.ok(op.security.some(entry => 'bearerAuth' in entry));
}
assert.ok(doc.components.schemas.PlaceReviewSummaryResponse.required.includes('participantCount'));
assert.ok(doc.components.schemas.PlaceReviewUpdateRequest.properties.reviewMediaIds);
console.log('Review update/delete/summary contracts verified.');
