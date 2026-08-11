import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const contractPath = 'docs/api/place-exploration.openapi.json';
const generatedPath = 'src/v2/shared/api/generated/placeExploration.ts';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'pingdom-place-openapi-'));
const temporaryPath = join(temporaryDirectory, 'placeExploration.ts');

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
    console.error(
      'Generated place exploration API types are stale. Run: npm run generate:place-exploration-api-types',
    );
    process.exitCode = 1;
  } else {
    console.log('Generated place exploration API types match the current server snapshot.');
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
