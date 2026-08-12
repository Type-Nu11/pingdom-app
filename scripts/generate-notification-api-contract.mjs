import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const UPSTREAM_URL = 'http://54.116.166.107:8080/v3/api-docs';
const CONTRACT_PATH = 'docs/api/server-notifications.openapi.json';
const GENERATED_PATH = 'src/v2/shared/api/generated/notifications.ts';
const SELECTED_PATHS = [
  '/firebase/fcm-token',
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

const source = process.argv[2] ?? UPSTREAM_URL;
const upstream = await readSource(source);
const paths = Object.fromEntries(
  SELECTED_PATHS.map((path) => {
    const pathItem = upstream.paths?.[path];
    if (!pathItem) throw new Error(`Upstream OpenAPI is missing ${path}`);
    return [path, pathItem];
  }),
);
const schemaNames = collectSchemaNames(paths);

for (const schemaName of [...schemaNames]) {
  const schema = upstream.components?.schemas?.[schemaName];
  if (!schema) throw new Error(`Upstream OpenAPI is missing schema ${schemaName}`);
  collectSchemaNames(schema, schemaNames);
}

const contract = {
  openapi: upstream.openapi,
  info: {
    ...upstream.info,
    description: `Focused snapshot generated from ${UPSTREAM_URL}. Do not edit DTOs by hand.`,
    title: `${upstream.info?.title ?? 'PingDom server'} - notifications contract`,
  },
  servers: upstream.servers,
  tags: upstream.tags?.filter(({ name }) => name === 'FCM/Notification'),
  paths,
  components: {
    schemas: Object.fromEntries(
      [...schemaNames].sort().map((name) => [name, upstream.components.schemas[name]]),
    ),
  },
  'x-upstream-source': UPSTREAM_URL,
};

await writeFile(CONTRACT_PATH, `${JSON.stringify(contract, null, 2)}\n`);
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['--no-install', 'openapi-typescript', CONTRACT_PATH, '-o', GENERATED_PATH],
  { stdio: 'inherit' },
);

