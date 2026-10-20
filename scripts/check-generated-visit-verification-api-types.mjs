import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'pingdom-visit-verification-openapi-'));
const temporaryPath = join(temporaryDirectory, 'visitVerification.ts');
try {
  execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
    '--no-install', 'openapi-typescript', 'docs/api/visit-verification.openapi.json', '-o', temporaryPath,
  ], { stdio: 'inherit' });
  const [committed, regenerated] = await Promise.all([
    readFile('src/v2/shared/api/generated/visitVerification.ts', 'utf8'),
    readFile(temporaryPath, 'utf8'),
  ]);
  if (committed !== regenerated) {
    console.error('Generated visit verification API types are stale. Run: npm run generate:visit-verification-api-types');
    process.exitCode = 1;
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
