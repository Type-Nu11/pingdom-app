import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const TARGET_PATHS = [
  '/places/map',
  '/places/{placeId}/card',
  '/places/{placeId}/visit-decision',
  '/places/{placeId}/operating-notices',
  '/places/{id}/media/verification',
  '/places/recommendations/{requestId}/explanation',
  '/places/{placeId}/map-link-conversions',
];

const source = process.argv[2];
const sourceLocation = process.argv[3] ?? source;
const outputPath = new URL('../docs/api/place-exploration.openapi.json', import.meta.url);

if (!source) {
  throw new Error(
    'Usage: node scripts/sync-place-exploration-openapi.mjs <OpenAPI URL or JSON file>',
  );
}

async function readSource(value) {
  if (/^https?:\/\//i.test(value)) {
    const response = await fetch(value);
    if (!response.ok) {
      throw new Error(`OpenAPI download failed with HTTP ${response.status}`);
    }
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

  for (const child of Object.values(value)) {
    collectSchemaReferences(child, names);
  }
}

const sourceText = await readSource(source);
const document = JSON.parse(sourceText);
const paths = Object.fromEntries(
  TARGET_PATHS.map((path) => {
    const pathItem = document.paths?.[path];
    if (!pathItem) throw new Error(`Latest OpenAPI is missing required path: ${path}`);
    return [path, pathItem];
  }),
);

const schemaNames = new Set();
collectSchemaReferences(paths, schemaNames);

for (const schemaName of schemaNames) {
  const schema = document.components?.schemas?.[schemaName];
  if (!schema) throw new Error(`Latest OpenAPI has an unresolved schema: ${schemaName}`);
  collectSchemaReferences(schema, schemaNames);
}

const schemas = Object.fromEntries(
  [...schemaNames].sort().map((name) => [name, document.components.schemas[name]]),
);
const sourceHash = createHash('sha256').update(sourceText).digest('hex');
const scopedDocument = {
  openapi: document.openapi,
  info: {
    ...document.info,
    title: `${document.info?.title ?? 'PingDom OpenAPI'} - place exploration contract`,
  },
  'x-source': {
    location: sourceLocation,
    sha256: sourceHash,
  },
  paths,
  components: {
    schemas,
  },
};

await writeFile(outputPath, `${JSON.stringify(scopedDocument, null, 2)}\n`, 'utf8');
console.log(
  `Wrote ${TARGET_PATHS.length} paths and ${schemaNames.size} referenced schemas to ${outputPath.pathname}`,
);
