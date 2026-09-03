import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const TARGET_PATH = '/places/{placeId}/menus';
const source = process.argv[2];
const sourceLocation = process.argv[3] ?? source;
const outputPath = new URL('../docs/api/place-menus.openapi.json', import.meta.url);

if (!source) {
  throw new Error('Usage: node scripts/sync-place-menus-openapi.mjs <OpenAPI URL or JSON file> [source metadata URL]');
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
  for (const child of Object.values(value)) collectSchemaReferences(child, names);
}

const sourceText = await readSource(source);
const document = JSON.parse(sourceText);
const operation = document.paths?.[TARGET_PATH]?.get;
if (!operation) throw new Error(`Latest OpenAPI is missing required operation: GET ${TARGET_PATH}`);

const paths = { [TARGET_PATH]: { get: operation } };
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
const scopedDocument = {
  openapi: document.openapi,
  info: {
    ...document.info,
    title: `${document.info?.title ?? 'PingDom OpenAPI'} - tourist place menus contract`,
  },
  'x-source': {
    location: sourceLocation,
    sha256: createHash('sha256').update(sourceText).digest('hex'),
  },
  paths,
  components: { schemas },
};

await writeFile(outputPath, `${JSON.stringify(scopedDocument, null, 2)}\n`, 'utf8');
console.log(`Wrote GET ${TARGET_PATH} and ${schemaNames.size} referenced schemas to ${outputPath.pathname}`);
