import { readFile } from 'node:fs/promises';
import { createHash, createHmac } from 'node:crypto';

const CONTRACT_PATH = new URL('../docs/api/mvp.openapi.json', import.meta.url);
const SIGNING_FIXTURE_PATH = new URL('../docs/api/signing-fixture.json', import.meta.url);
const document = JSON.parse(await readFile(CONTRACT_PATH, 'utf8'));
const signingFixture = JSON.parse(await readFile(SIGNING_FIXTURE_PATH, 'utf8'));

const failures = [];
const operations = [];
const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace']);
const SIGNING_PARAMETERS = new Set([
  '#/components/parameters/XAppVersion',
  '#/components/parameters/XDeviceId',
  '#/components/parameters/XSignature',
  '#/components/parameters/XTimestamp',
]);
const REQUIRED_SCHEMAS = new Set([
  'Coupon',
  'ErrorResponse',
  'LiveStatus',
  'PlaceDetail',
  'PlaceSummary',
  'Reservation',
  'TouristSupport',
  'TrustSummary',
]);

function resolveLocalRef(ref) {
  if (!ref.startsWith('#/')) {
    failures.push(`External references are not allowed: ${ref}`);
    return undefined;
  }

  return ref
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((value, part) => value?.[part], document);
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return;

  if ('$ref' in value && typeof value.$ref === 'string' && resolveLocalRef(value.$ref) === undefined) {
    failures.push(`Unresolved reference at ${location}: ${value.$ref}`);
  }

  for (const [key, child] of Object.entries(value)) {
    visit(child, `${location}/${key}`);
  }
}

if (document.openapi !== '3.1.0') {
  failures.push(`Expected OpenAPI 3.1.0, received ${document.openapi ?? 'missing'}`);
}

if (document.info?.version !== '1.0.0') {
  failures.push(`Expected contract version 1.0.0, received ${document.info?.version ?? 'missing'}`);
}

for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!HTTP_METHODS.has(method)) continue;
    operations.push(`${method.toUpperCase()} ${path}`);

    if (!operation.operationId) failures.push(`${method.toUpperCase()} ${path} has no operationId`);
    if (!Array.isArray(operation['x-required-roles']) || operation['x-required-roles'].length === 0) {
      failures.push(`${method.toUpperCase()} ${path} has no x-required-roles`);
    }
    if (!operation.responses || !Object.keys(operation.responses).some((status) => /^2\d\d$/.test(status))) {
      failures.push(`${method.toUpperCase()} ${path} has no success response`);
    }
    if (!operation.responses || !Object.keys(operation.responses).some((status) => /^[45]\d\d$/.test(status))) {
      failures.push(`${method.toUpperCase()} ${path} has no error response`);
    }

    const parameterRefs = new Set(
      (operation.parameters ?? [])
        .map((parameter) => parameter.$ref)
        .filter(Boolean),
    );
    for (const requiredRef of SIGNING_PARAMETERS) {
      if (!parameterRefs.has(requiredRef)) {
        failures.push(`${method.toUpperCase()} ${path} is missing ${requiredRef}`);
      }
    }
  }
}

for (const schemaName of REQUIRED_SCHEMAS) {
  if (!document.components?.schemas?.[schemaName]) {
    failures.push(`Required schema is missing: ${schemaName}`);
  }
}

if (document.components?.parameters?.Page?.schema?.minimum !== 1) {
  failures.push('Pagination must remain 1-based');
}

const fixtureBodyHash = createHash('sha256')
  .update(signingFixture.canonicalJsonBody, 'utf8')
  .digest('hex');
const fixtureCanonicalString = [
  signingFixture.method,
  signingFixture.pathWithSortedQuery,
  String(signingFixture.timestamp),
  signingFixture.deviceId,
  signingFixture.appVersion,
  fixtureBodyHash,
].join('\n');
const fixtureSignature = createHmac('sha256', signingFixture.testOnlySecret)
  .update(fixtureCanonicalString, 'utf8')
  .digest('base64');

if (fixtureBodyHash !== signingFixture.bodySha256) {
  failures.push('Signing fixture bodySha256 does not match its canonical JSON body');
}
if (fixtureCanonicalString !== signingFixture.canonicalString) {
  failures.push('Signing fixture canonicalString does not match the six-line rule');
}
if (fixtureSignature !== signingFixture.signatureBase64) {
  failures.push('Signing fixture signatureBase64 does not match HMAC-SHA256 output');
}

visit(document);

if (operations.length === 0) failures.push('No API operations were found');

if (failures.length > 0) {
  console.error(`MVP API contract validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`MVP API contract is valid: ${operations.length} operations, all local references resolved.`);
}
