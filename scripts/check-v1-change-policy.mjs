import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { findLegacySourceChanges, parseNameStatus } from './v1-change-policy.mjs';

function readBaseRef(argv) {
  const baseArgument = argv.find((argument) => argument.startsWith('--base='));

  if (baseArgument) {
    return baseArgument.slice('--base='.length);
  }

  const baseIndex = argv.indexOf('--base');
  if (baseIndex !== -1) {
    return argv[baseIndex + 1];
  }

  return process.env.V1_CHANGE_BASE;
}

const baseRef = readBaseRef(process.argv.slice(2));

if (!baseRef) {
  console.error('V1 change policy requires --base <git-ref> or V1_CHANGE_BASE.');
  process.exit(1);
}

let output;

try {
  output = execFileSync(
    'git',
    ['diff', '--name-status', '-z', '--diff-filter=ACMR', `${baseRef}...HEAD`],
    { encoding: 'utf8' },
  );
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Unable to inspect changes against ${baseRef}: ${detail}`);
  process.exit(1);
}

const legacyChanges = findLegacySourceChanges(parseNameStatus(output));
const hasApprovedException = process.env.V1_EXCEPTION_APPROVED === 'true';

if (legacyChanges.length === 0) {
  console.log('V1 change policy passed: no V1 source additions or modifications.');
  process.exit(0);
}

const changedFiles = legacyChanges.map(({ filePath }) => `- ${filePath}`).join('\n');

if (hasApprovedException) {
  console.log([
    'V1 change policy passed with approved legacy exception:',
    changedFiles,
  ].join('\n'));
  process.exit(0);
}

console.error([
  'V1 change policy failed: this PR adds or modifies legacy source files.',
  changedFiles,
  'Move the implementation to src/v2/**, delete V1 code, or add the legacy-exception PR label with a removal plan.',
].join('\n'));
process.exit(1);
