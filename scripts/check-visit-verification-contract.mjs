import { readFile } from 'node:fs/promises';

const document = JSON.parse(await readFile(
  new URL('../docs/api/visit-verification.openapi.json', import.meta.url),
  'utf8',
));
const failures = [];
const expected = [
  ['post', '/visit-verification-sessions', 'start', 201],
  ['post', '/visit-verification-sessions/{sessionId}/observations', 'submitObservation', 200],
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
  'ValidationErrorResponse',
  'VisitVerificationObservationRequest',
  'VisitVerificationSessionResponse',
  'VisitVerificationStartRequest',
]) {
  if (!document.components?.schemas?.[schema]) failures.push(`${schema} missing`);
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
  const getHas200 = Boolean(document.paths?.['/visit-verification-sessions/{sessionId}']?.get?.responses?.['200']);
  console.log(`Visit verification contract valid. GET 200 response contract: ${getHas200 ? 'present' : 'missing (foreground recovery blocked)'}.`);
}
