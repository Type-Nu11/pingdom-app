import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const UPSTREAM_URL = 'http://34.64.51.29/v3/api-docs';
const TARGET_PATH = '/users/me/scout-profile';
const outputPath = new URL('../docs/api/scout-profile.openapi.json', import.meta.url);

const source = process.argv[2] ?? UPSTREAM_URL;
const sourceLocation = process.argv[3] ?? source;

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

function collectSecuritySchemeNames(value, names) {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value.security)) {
    for (const requirement of value.security) {
      if (!requirement || typeof requirement !== 'object' || Array.isArray(requirement)) continue;
      for (const name of Object.keys(requirement)) names.add(name);
    }
  }

  for (const child of Object.values(value)) {
    collectSecuritySchemeNames(child, names);
  }
}

const sourceText = await readSource(source);
const document = JSON.parse(sourceText);
const pathItem = document.paths?.[TARGET_PATH];

if (!pathItem) {
  throw new Error(`Latest OpenAPI is missing required path: ${TARGET_PATH}`);
}

const schemaNames = new Set();
collectSchemaReferences(pathItem, schemaNames);
const securitySchemeNames = new Set();
collectSecuritySchemeNames(pathItem, securitySchemeNames);

for (const schemaName of schemaNames) {
  const schema = document.components?.schemas?.[schemaName];
  if (!schema) throw new Error(`Latest OpenAPI has an unresolved schema: ${schemaName}`);
  collectSchemaReferences(schema, schemaNames);
}

for (const securitySchemeName of securitySchemeNames) {
  if (!document.components?.securitySchemes?.[securitySchemeName]) {
    throw new Error(
      `Latest OpenAPI has an unresolved security scheme: ${securitySchemeName}`,
    );
  }
}

const scopedDocument = {
  openapi: document.openapi,
  info: {
    ...document.info,
    title: `${document.info?.title ?? 'PingDom OpenAPI'} - Scout profile contract`,
  },
  'x-source': {
    location: sourceLocation,
    sha256: createHash('sha256').update(sourceText).digest('hex'),
  },
  paths: {
    [TARGET_PATH]: pathItem,
  },
  components: {
    schemas: Object.fromEntries(
      [...schemaNames].sort().map((name) => [name, document.components.schemas[name]]),
    ),
    securitySchemes: Object.fromEntries(
      [...securitySchemeNames]
        .sort()
        .map((name) => [name, document.components.securitySchemes[name]]),
    ),
  },
};

await writeFile(outputPath, `${JSON.stringify(scopedDocument, null, 2)}\n`, 'utf8');
console.log(
  `Wrote Scout profile path, ${schemaNames.size} referenced schemas, and ` +
    `${securitySchemeNames.size} security schemes to ${outputPath.pathname}`,
);
