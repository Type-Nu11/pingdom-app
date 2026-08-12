import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const contractPath = 'docs/api/server-notifications.openapi.json';
const generatedPath = 'src/v2/shared/api/generated/notifications.ts';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'pingdom-notifications-openapi-'));
const temporaryPath = join(temporaryDirectory, 'notifications.ts');

try {
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['--no-install', 'openapi-typescript', contractPath, '-o', temporaryPath],
    { stdio: 'inherit' },
  );

  const [committed, regenerated] = await Promise.all([
    readFile(generatedPath, 'utf8'),
    readFile(temporaryPath, 'utf8'),
  ]);

  if (committed !== regenerated) {
    console.error('Notification API types are stale. Run: npm run generate:notification-api');
    process.exitCode = 1;
  } else {
    console.log('Notification API types match the focused server OpenAPI snapshot.');
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
