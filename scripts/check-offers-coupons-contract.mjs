import { readFile } from 'node:fs/promises';

const contractPath = new URL('../docs/api/offers-coupons.openapi.json', import.meta.url);
const document = JSON.parse(await readFile(contractPath, 'utf8'));

const expectedOperations = new Map([
  ['/coupons', [['get', 'listMyCoupons']]],
  ['/coupons/{couponId}', [['get', 'getMyCoupon']]],
  ['/offers/{offerId}/coupons', [['post', 'issueCoupon']]],
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
  failures.push('scoped contract paths do not match the offers/coupons endpoints');
}

for (const [path, operations] of expectedOperations) {
  for (const [method, operationId] of operations) {
    const operation = document.paths?.[path]?.[method];
    if (!operation) {
      failures.push(`${method.toUpperCase()} ${path} is missing`);
      continue;
    }
    if (operation.operationId !== operationId) {
      failures.push(
        `${method.toUpperCase()} ${path} operationId is "${operation.operationId}", expected "${operationId}"`,
      );
    }
  }
}

if (!document.components?.securitySchemes?.bearerAuth) {
  failures.push('bearerAuth security scheme must be present');
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
  console.error(`Offers/coupons contract validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Offers/coupons server snapshot is valid: ${expectedOperations.size} operations, all references resolved.`,
  );
}
