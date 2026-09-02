import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const TARGET_OPERATIONS = new Map([
  ['/visit-verification-sessions', ['post']],
  ['/visit-verification-sessions/{sessionId}/observations', ['post']],
  ['/visit-verification-sessions/{sessionId}', ['get']],
]);
const REQUIRED_SCHEMAS = [
  'ErrorResponse',
  'ValidationErrorResponse',
  'VisitVerificationObservationRequest',
  'VisitVerificationSessionResponse',
  'VisitVerificationStartRequest',
];

const source = process.argv[2];
const sourceLocation = process.argv[3] ?? source;
const outputPath = new URL('../docs/api/visit-verification.openapi.json', import.meta.url);

if (!source) {
  throw new Error('Usage: node scripts/sync-visit-verification-openapi.mjs <OpenAPI URL or JSON file> [source metadata URL]');
}

async function readSource(value) {
  if (/^https?:\/\//i.test(value)) {
    const response = await fetch(value);
    if (!response.ok) throw new Error(`OpenAPI download failed with HTTP ${response.status}`);
    return response.text();
  }
  return readFile(value, 'utf8');
}

function collectSchemaReferences(value, names) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (match) names.add(match[1]);
  }
  Object.values(value).forEach((child) => collectSchemaReferences(child, names));
}

const sourceText = await readSource(source);
const document = JSON.parse(sourceText);
const paths = Object.fromEntries([...TARGET_OPERATIONS].map(([path, methods]) => {
  const pathItem = document.paths?.[path];
  if (!pathItem) throw new Error(`Latest OpenAPI is missing required path: ${path}`);
  return [path, Object.fromEntries(methods.map((method) => {
    const operation = pathItem[method];
    if (!operation) throw new Error(`Latest OpenAPI is missing required operation: ${method} ${path}`);
    return [method, operation];
  }))];
}));

const schemaNames = new Set(REQUIRED_SCHEMAS);
collectSchemaReferences(paths, schemaNames);
for (const schemaName of schemaNames) {
  const schema = document.components?.schemas?.[schemaName];
  if (!schema) throw new Error(`Latest OpenAPI has an unresolved schema: ${schemaName}`);
  collectSchemaReferences(schema, schemaNames);
}

const scopedDocument = {
  openapi: document.openapi,
  info: {
    ...document.info,
    title: `${document.info?.title ?? 'PingDom OpenAPI'} - visit verification contract`,
  },
  'x-source': {
    checkedAt: new Date().toISOString(),
    location: sourceLocation,
    sha256: createHash('sha256').update(sourceText).digest('hex'),
  },
  paths,
  components: {
    securitySchemes: document.components?.securitySchemes,
    schemas: Object.fromEntries([...schemaNames].sort().map((name) => [name, document.components.schemas[name]])),
  },
};

await writeFile(outputPath, `${JSON.stringify(scopedDocument, null, 2)}\n`, 'utf8');
console.log(`Wrote ${TARGET_OPERATIONS.size} paths and ${schemaNames.size} schemas to ${outputPath.pathname}`);
