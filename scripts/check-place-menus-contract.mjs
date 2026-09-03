import { readFile } from 'node:fs/promises';

const contractPath = new URL('../docs/api/place-menus.openapi.json', import.meta.url);
const document = JSON.parse(await readFile(contractPath, 'utf8'));
const targetPath = '/places/{placeId}/menus';
const operation = document.paths?.[targetPath]?.get;
const schema = document.components?.schemas?.PlaceMenuResponse;
const failures = [];

if (!/^https?:\/\//.test(document['x-source']?.location ?? '')) {
  failures.push('x-source.location must identify the current server OpenAPI URL');
}
if (!/^[a-f0-9]{64}$/.test(document['x-source']?.sha256 ?? '')) {
  failures.push('x-source.sha256 must identify the complete source document');
}
if (JSON.stringify(Object.keys(document.paths ?? {})) !== JSON.stringify([targetPath])) {
  failures.push('scoped contract must contain only the tourist place menus path');
}
if (operation?.operationId !== 'list_5') failures.push('GET menu operationId changed from list_5');
if (JSON.stringify(operation?.security) !== JSON.stringify([{ bearerAuth: [] }])) {
  failures.push('GET menu operation must require bearerAuth');
}
if (operation?.parameters?.[0]?.name !== 'placeId'
  || operation.parameters[0].required !== true
  || operation.parameters[0].schema?.format !== 'int64') {
  failures.push('GET menu placeId must be a required int64 path parameter');
}
for (const status of ['200', '401', '403', '404']) {
  if (!operation?.responses?.[status]) failures.push(`GET menu response ${status} is missing`);
}
if (operation?.responses?.['200']?.content?.['*/*']?.schema?.type !== 'array'
  || operation.responses['200'].content['*/*'].schema.items?.$ref
    !== '#/components/schemas/PlaceMenuResponse') {
  failures.push('GET menu 200 response must be PlaceMenuResponse[]');
}
if (!schema) failures.push('PlaceMenuResponse schema is missing');
if (schema?.required !== undefined) {
  failures.push('PlaceMenuResponse required contract changed; review optional-field presentation policy');
}
const currencies = schema?.properties?.currency?.enum;
if (JSON.stringify(currencies) !== JSON.stringify(['KRW', 'USD', 'JPY', 'CNY', 'EUR'])) {
  failures.push('PlaceMenuResponse currency enum changed');
}
const statuses = schema?.properties?.status?.enum;
if (JSON.stringify(statuses) !== JSON.stringify(['AVAILABLE', 'SOLD_OUT', 'HIDDEN', 'INACTIVE'])) {
  failures.push('PlaceMenuResponse status enum changed');
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match || !document.components?.schemas?.[match[1]]) {
      failures.push(`unresolved or external reference at ${location}: ${value.$ref}`);
    }
  }
  for (const [key, child] of Object.entries(value)) visit(child, `${location}/${key}`);
}
visit(document);

if (failures.length) {
  console.error(`Place menus contract validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Tourist place menus server snapshot is valid and all references resolve.');
}
