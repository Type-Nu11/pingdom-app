import { readFile } from 'node:fs/promises';

const document = JSON.parse(await readFile(
  new URL('../docs/api/visit-verification.openapi.json', import.meta.url),
  'utf8',
));
const failures = [];
const expected = [
  ['post', '/visit-verification-sessions', 'start', 201],
  ['post', '/visit-verification-sessions/foreground', 'startForeground', 201],
  ['post', '/visit-verification-sessions/{sessionId}/observations', 'submitObservation', 200],
  ['get', '/visit-verification-sessions/{sessionId}', 'get', 200],
];

if (!/^https?:\/\//.test(document['x-source']?.location ?? '')) failures.push('source URL missing');
if (!Number.isFinite(Date.parse(document['x-source']?.checkedAt ?? ''))) failures.push('checkedAt missing');
if (!/^[a-f0-9]{64}$/.test(document['x-source']?.sha256 ?? '')) failures.push('source hash missing');

for (const [method, path, operationId, success] of expected) {
  const operation = document.paths?.[path]?.[method];
  if (!operation) failures.push(`${method.toUpperCase()} ${path} missing`);
  if (operation?.operationId !== operationId) failures.push(`${method.toUpperCase()} ${path} operationId changed`);
  if (!operation?.responses?.[success]) failures.push(`${method.toUpperCase()} ${path} ${success} response missing`);
  if (!operation?.security?.some((entry) => 'bearerAuth' in entry)) failures.push(`${method.toUpperCase()} ${path} bearerAuth missing`);
}

for (const schema of [
  'ErrorResponse',
  'ForegroundVisitVerificationStartRequest',
  'ValidationErrorResponse',
  'VisitVerificationObservationRequest',
  'VisitVerificationSessionResponse',
  'VisitVerificationStartRequest',
]) {
  if (!document.components?.schemas?.[schema]) failures.push(`${schema} missing`);
}

const foregroundOperation = document.paths?.['/visit-verification-sessions/foreground']?.post;
const foregroundRequestRef = foregroundOperation?.requestBody?.content?.['application/json']?.schema?.$ref;
if (foregroundRequestRef !== '#/components/schemas/ForegroundVisitVerificationStartRequest') {
  failures.push('foreground start request schema changed');
}

const foregroundRequest = document.components?.schemas?.ForegroundVisitVerificationStartRequest;
const foregroundFields = Object.keys(foregroundRequest?.properties ?? {}).sort();
const expectedForegroundFields = ['accuracyMeters', 'latitude', 'longitude', 'observedAt'];
if (JSON.stringify(foregroundFields) !== JSON.stringify(expectedForegroundFields)) {
  failures.push(`foreground start fields changed: ${foregroundFields.join(', ')}`);
}
if (foregroundFields.includes('placeId')) failures.push('foreground start must not accept placeId');
if (JSON.stringify([...(foregroundRequest?.required ?? [])].sort()) !== JSON.stringify(expectedForegroundFields)) {
  failures.push('foreground start required fields changed');
}

const foregroundResponseRef = foregroundOperation?.responses?.[201]?.content?.['*/*']?.schema?.$ref;
if (foregroundResponseRef !== '#/components/schemas/VisitVerificationSessionResponse') {
  failures.push('foreground start 201 response schema changed');
}
const foregroundErrorStatuses = [400, 401, 403, 404, 409, 422];
for (const status of foregroundErrorStatuses) {
  if (!foregroundOperation?.responses?.[status]) failures.push(`foreground start ${status} response missing`);
}
if (!foregroundOperation?.description?.includes('진행 중인 동일 장소 세션은 우선 복구')) {
  failures.push('foreground active-session recovery contract missing');
}
if (!foregroundOperation?.description?.includes('GPS 정확도 두 배')) {
  failures.push('foreground nearest-place disambiguation contract missing');
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match || !document.components?.schemas?.[match[1]]) failures.push(`unresolved ref at ${location}`);
  }
  Object.entries(value).forEach(([key, child]) => visit(child, `${location}/${key}`));
}
visit(document);

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Visit verification contract valid, including foreground start and session recovery.');
}
