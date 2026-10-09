import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const contractPath = 'docs/api/routes.openapi.json';
const generatedPath = 'src/v2/shared/api/generated/routes.ts';
const directory = await mkdtemp(join(tmpdir(), 'pingdom-routes-openapi-'));
const temporaryPath = join(directory, 'routes.ts');

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
    console.error('Generated routes API types are stale. Run: npm run generate:routes-api-types');
    process.exitCode = 1;
  } else {
    console.log('Generated routes API types match the live-server snapshot.');
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
