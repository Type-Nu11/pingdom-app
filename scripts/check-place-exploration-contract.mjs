import { readFile } from 'node:fs/promises';

const contractPath = new URL('../docs/api/place-exploration.openapi.json', import.meta.url);
const document = JSON.parse(await readFile(contractPath, 'utf8'));
const expectedOperations = new Map([
  ['/location-check-ins', ['get', 'listMine_4']],
  ['/places', ['get', 'listPlaces']],
  ['/places/autocomplete', ['get', 'autocompletePlaces']],
  ['/places/map', ['get', 'mapViewport']],
  ['/places/{placeId}/card', ['get', 'getTouristPlaceCard']],
  ['/places/{placeId}/visit-decision', ['get', 'getPlaceVisitDecision']],
  ['/places/{placeId}/operating-notices', ['get', 'listOperatingNotices']],
  ['/places/{id}/media/exploration', ['get', 'getExplorationMedia']],
  ['/places/{id}/media/verification', ['get', 'getVerificationMedia']],
  [
    '/places/recommendations/{requestId}/explanation',
    ['get', 'getRecommendationExplanation'],
  ],
  ['/places/{placeId}/map-link-conversions', ['post', 'record']],
  ['/places/{placeId}/reviews', [
    ['get', 'list_4'],
    ['post', 'create_2'],
  ]],
]);
const failures = [];

if (!/^https?:\/\//.test(document['x-source']?.location ?? '')) {
  failures.push('x-source.location must identify the current server OpenAPI URL');
}
if (!/^[a-f0-9]{64}$/.test(document['x-source']?.sha256 ?? '')) {
  failures.push('x-source.sha256 must identify the complete source document');
}

const actualPaths = Object.keys(document.paths ?? {}).sort();
const expectedPaths = [...expectedOperations.keys()].sort();
if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
  failures.push('scoped contract paths do not match the place exploration endpoints');
}

for (const [path, expectedMethods] of expectedOperations) {
  const operations = typeof expectedMethods[0] === 'string'
    ? [expectedMethods]
    : expectedMethods;

  for (const [method, operationId] of operations) {
    const operation = document.paths?.[path]?.[method];
    if (!operation) failures.push(`${method.toUpperCase()} ${path} is missing`);
    if (operation?.operationId !== operationId) {
      failures.push(`${method.toUpperCase()} ${path} operationId changed from ${operationId}`);
    }
  }
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return;

  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match || !document.components?.schemas?.[match[1]]) {
      failures.push(`unresolved or external reference at ${location}: ${value.$ref}`);
    }
  }

  for (const [key, child] of Object.entries(value)) {
    visit(child, `${location}/${key}`);
  }
}

visit(document);

if (failures.length > 0) {
  console.error(`Place exploration contract validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Place exploration server snapshot is valid: ${expectedOperations.size} operations, all references resolved.`,
  );
}
