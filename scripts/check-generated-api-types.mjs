import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'pingdom-openapi-'));
const generatedContracts = [
  {
    contractPath: 'docs/api/mvp.openapi.json',
    generatedPath: 'src/v2/shared/api/generated/mvp.ts',
  },
  {
    contractPath: 'docs/api/account.openapi.json',
    generatedPath: 'src/v2/shared/api/generated/account.ts',
  },
  {
    contractPath: 'docs/api/current-activity-intent.openapi.json',
    generatedPath: 'src/v2/shared/api/generated/currentActivityIntent.ts',
  },
  {
    contractPath: 'docs/api/scout-profile.openapi.json',
    generatedPath: 'src/v2/shared/api/generated/scoutProfile.ts',
  },
];

try {
  for (const [index, { contractPath, generatedPath }] of generatedContracts.entries()) {
    const temporaryPath = join(temporaryDirectory, `${index}.ts`);
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
      console.error(`Generated API types are stale for ${contractPath}. Run: npm run generate:api-types`);
      process.exitCode = 1;
    } else {
      console.log(`Generated API types match ${contractPath}.`);
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
