import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createTravelScheduleApi } from '../../../features/travel-schedules/api/travelScheduleApi.ts';

test('travel schedule OpenAPI uses date-only strings without a timezone field', async () => {
  const contractUrl = new URL('../../../../../docs/api/mvp.openapi.json', import.meta.url);
  const contract = JSON.parse(await readFile(contractUrl, 'utf8'));
  const schemas = contract.components.schemas;

  for (const schemaName of ['TravelScheduleCreateRequest', 'TravelScheduleUpdateRequest']) {
    const schema = schemas[schemaName];

    assert.deepEqual(schema.required, ['startDate', 'endDate']);
    assert.equal(schema.properties.startDate.format, 'date');
    assert.equal(schema.properties.endDate.format, 'date');
    assert.equal('timeZone' in schema.properties, false);
    assert.equal('timezone' in schema.properties, false);
  }
});

test('date boundaries cross months and years without Date or UTC conversion', async () => {
  const calls = [];
  const client = {
    get: async () => ({ schedules: [] }),
    patch: async (path, body) => { calls.push({ body, path }); return body; },
    post: async (path, body) => { calls.push({ body, path }); return body; },
    put: async () => undefined,
  };
  const api = createTravelScheduleApi(client);
  const monthBoundary = { startDate: '2026-08-31', endDate: '2026-09-01' };
  const yearBoundary = { startDate: '2026-12-31', endDate: '2027-01-01' };

  await api.createTravelSchedule(monthBoundary);
  await api.updateTravelSchedule(9, yearBoundary);

  assert.equal(calls[0].body, monthBoundary);
  assert.equal(calls[1].body, yearBoundary);
  assert.deepEqual(calls.map(({ body }) => JSON.stringify(body)), [
    '{"startDate":"2026-08-31","endDate":"2026-09-01"}',
    '{"startDate":"2026-12-31","endDate":"2027-01-01"}',
  ]);
});
