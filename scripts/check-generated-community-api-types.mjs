import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'pingdom-community-openapi-'));
const temporaryPath = join(temporaryDirectory, 'community.ts');
try {
  execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
    '--no-install', 'openapi-typescript', 'docs/api/community.openapi.json', '-o', temporaryPath,
  ], { stdio: 'inherit' });
  const [committed, regenerated] = await Promise.all([
    readFile('src/v2/shared/api/generated/community.ts', 'utf8'),
    readFile(temporaryPath, 'utf8'),
  ]);
  if (committed !== regenerated) {
    console.error('Generated community API types are stale. Run: npm run generate:community-api-types');
    process.exitCode = 1;
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
