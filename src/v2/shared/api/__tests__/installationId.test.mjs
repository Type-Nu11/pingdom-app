import assert from 'node:assert/strict';
import test from 'node:test';
import { createInstallationIdReader, INSTALLATION_ID_KEY } from '../installationId.ts';

const id = '6f1a0f58-34b3-4f7a-81e0-9959c76283cb';
test('concurrent requests share one persisted installation UUID and cold starts retain it', async () => {
  const data = new Map(); let creations = 0;
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => { data.set(key, value); } };
  const reader = createInstallationIdReader(storage, () => { creations++; return id; });
  assert.deepEqual(await Promise.all([reader(), reader(), reader()]), [id, id, id]);
  assert.equal(creations, 1);
  assert.equal(data.get(INSTALLATION_ID_KEY), id);
  assert.equal(await createInstallationIdReader(storage, () => { throw Error('must not regenerate'); })(), id);
});
test('storage failure remains retryable and corrupt saved identifiers are replaced', async () => {
  let fail = true; let stored = 'invalid';
  const storage = { getItem: async () => stored, setItem: async (_key, value) => {
    if (fail) { fail = false; throw Error('storage unavailable'); } stored = value;
  } };
  const reader = createInstallationIdReader(storage, () => id);
  await assert.rejects(reader(), /storage unavailable/);
  assert.equal(await reader(), id);
  assert.equal(stored, id);
});
