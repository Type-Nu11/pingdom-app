import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const UPSTREAM_URL = 'http://54.116.166.107:8080/v3/api-docs/app';
const outputPath = new URL('../docs/api/offers-coupons.openapi.json', import.meta.url);

// The upstream document auto-generates opaque operationIds (`list_5`, `get_7`,
// `issue`). They are remapped to stable names here so the generated contract and
// `offerCouponApi` stay readable; the raw ids are still asserted so an upstream
// renumber fails loudly instead of silently pointing at the wrong operation.
const TARGET_OPERATIONS = new Map([
  ['/coupons', [['get', 'list_5', 'listMyCoupons']]],
  ['/coupons/{couponId}', [['get', 'get_7', 'getMyCoupon']]],
  ['/offers/{offerId}/coupons', [['post', 'issue', 'issueCoupon']]],
]);

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

const paths = Object.fromEntries(
  [...TARGET_OPERATIONS].map(([path, operations]) => {
    const pathItem = document.paths?.[path];
    if (!pathItem) throw new Error(`Latest OpenAPI is missing required path: ${path}`);

    const scopedItem = Object.fromEntries(
      operations.map(([method, upstreamOperationId, operationId]) => {
        const operation = pathItem[method];
        if (!operation) {
          throw new Error(`Latest OpenAPI is missing required operation: ${method} ${path}`);
        }
        if (operation.operationId !== upstreamOperationId) {
          throw new Error(
            `Latest OpenAPI operationId for ${method.toUpperCase()} ${path} changed ` +
              `from "${upstreamOperationId}" to "${operation.operationId}"`,
          );
        }
        return [method, { ...operation, operationId }];
      }),
    );

    return [path, scopedItem];
  }),
);

const schemaNames = new Set();
collectSchemaReferences(paths, schemaNames);
const securitySchemeNames = new Set();
collectSecuritySchemeNames(paths, securitySchemeNames);

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
    title: `${document.info?.title ?? 'PingDom OpenAPI'} - offers and coupons contract`,
  },
  'x-source': {
    location: sourceLocation,
    sha256: createHash('sha256').update(sourceText).digest('hex'),
  },
  paths,
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
  `Wrote ${TARGET_OPERATIONS.size} offers/coupons paths, ${schemaNames.size} referenced ` +
    `schemas, and ${securitySchemeNames.size} security schemes to ${outputPath.pathname}`,
);
