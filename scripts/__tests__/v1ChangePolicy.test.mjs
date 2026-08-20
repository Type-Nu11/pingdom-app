import assert from 'node:assert/strict';
import test from 'node:test';
import { findLegacySourceChanges, parseNameStatus } from '../v1-change-policy.mjs';

test('parses ordinary and renamed git name-status entries', () => {
  const entries = parseNameStatus(
    'M\0src/features/place/screens/MapScreen.tsx\0R100\0src/features/old.ts\0src/v2/features/map/MapScreen.tsx\0',
  );

  assert.deepEqual(entries, [
    {
      status: 'M',
      oldPath: undefined,
      filePath: 'src/features/place/screens/MapScreen.tsx',
    },
    {
      status: 'R100',
      oldPath: 'src/features/old.ts',
      filePath: 'src/v2/features/map/MapScreen.tsx',
    },
  ]);
});

test('flags V1 source additions and modifications but ignores deletions and non-source files', () => {
  const changes = findLegacySourceChanges([
    { status: 'M', filePath: 'src/features/place/screens/MapScreen.tsx' },
    { status: 'A', filePath: 'src/features/place/styles/map.css' },
    { status: 'R100', oldPath: 'src/v2/features/map/MapScreen.tsx', filePath: 'src/features/place/MapScreen.tsx' },
    { status: 'A', filePath: 'src/v2/features/map/MapScreen.tsx' },
  ]);

  assert.deepEqual(changes, [
    { status: 'M', filePath: 'src/features/place/screens/MapScreen.tsx' },
    { status: 'R100', oldPath: 'src/v2/features/map/MapScreen.tsx', filePath: 'src/features/place/MapScreen.tsx' },
  ]);
});
