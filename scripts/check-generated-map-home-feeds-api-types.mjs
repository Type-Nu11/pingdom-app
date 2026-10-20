import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const contractPath = 'docs/api/map-home-feeds.openapi.json';
const generatedPath = 'src/v2/shared/api/generated/mapHomeFeeds.ts';
const directory = await mkdtemp(join(tmpdir(), 'pingdom-map-home-feeds-openapi-'));
const temporaryPath = join(directory, 'mapHomeFeeds.ts');

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
    console.error('Generated map home feeds API types are stale. Run: npm run generate:map-home-feeds-api-types');
    process.exitCode = 1;
  } else {
    console.log('Generated map home feeds API types match the live-server snapshot.');
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
