import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const UPSTREAM_URL = 'https://www.typenull.xyz/v3/api-docs';
const CONTRACT_PATH = 'docs/api/server-notifications.openapi.json';
const GENERATED_PATH = 'src/v2/shared/api/generated/notifications.ts';
const SELECTED_PATHS = [
  '/firebase/fcm-tokens',
  '/notifications/settings',
];

async function readSource(source) {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`OpenAPI download failed with status ${response.status}`);
    }

    return response.json();
  }

  return JSON.parse(await readFile(source, 'utf8'));
}

function collectSchemaNames(value, names = new Set()) {
  if (!value || typeof value !== 'object') return names;

  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (match) names.add(match[1]);
  }

  for (const child of Object.values(value)) collectSchemaNames(child, names);
  return names;
}

const checkOnly = process.argv.includes('--check');
const source = process.argv.slice(2).find((arg) => arg !== '--check') ?? UPSTREAM_URL;
const upstream = await readSource(source);
// Keep the compatibility endpoint only if still published. Do not manufacture
// an operation from an older snapshot or change its runtime callers here.
if (upstream.paths?.['/firebase/fcm-token']) SELECTED_PATHS.unshift('/firebase/fcm-token');
const paths = Object.fromEntries(
  SELECTED_PATHS.map((path) => {
    const pathItem = upstream.paths?.[path];
    if (!pathItem) throw new Error(`Upstream OpenAPI is missing ${path}`);
    return [path, pathItem];
  }),
);
const schemaNames = collectSchemaNames(paths);

for (const schemaName of schemaNames) {
  const schema = upstream.components?.schemas?.[schemaName];
  if (!schema) throw new Error(`Upstream OpenAPI is missing schema ${schemaName}`);
  collectSchemaNames(schema, schemaNames);
}

const tagNames = new Set(Object.values(paths).flatMap((item) =>
  Object.values(item).flatMap((operation) => operation?.tags ?? [])));

const contract = {
  openapi: upstream.openapi,
  info: {
    ...upstream.info,
    description: `Focused snapshot generated from ${UPSTREAM_URL}. Do not edit DTOs by hand.`,
    title: `${upstream.info?.title ?? 'PingDom server'} - notifications contract`,
  },
  servers: upstream.servers,
  security: upstream.security,
  tags: upstream.tags?.filter(({ name }) => tagNames.has(name)),
  paths,
  components: {
    securitySchemes: upstream.components?.securitySchemes,
    schemas: Object.fromEntries(
      [...schemaNames].sort().map((name) => [name, upstream.components.schemas[name]]),
    ),
  },
  'x-upstream-source': UPSTREAM_URL,
};

const serialized = `${JSON.stringify(contract, null, 2)}\n`;
if (checkOnly) {
  if (await readFile(CONTRACT_PATH, 'utf8') !== serialized) {
    throw new Error('Notification snapshot differs from upstream. Run npm run generate:notification-api.');
  }
  console.log('Notification snapshot matches upstream, including security and examples.');
} else {
  await writeFile(CONTRACT_PATH, serialized);
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['--no-install', 'openapi-typescript', CONTRACT_PATH, '-o', GENERATED_PATH],
    { stdio: 'inherit' },
  );
}
