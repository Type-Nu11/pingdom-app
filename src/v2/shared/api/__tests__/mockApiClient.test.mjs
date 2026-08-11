import assert from 'node:assert/strict';
import test from 'node:test';

import {
  apiClient,
  getMockScenario,
  merchantPerformanceFixture,
  mockApiClient,
  setMockScenario,
} from '../index.ts';

test('mock scenarios serve contract fixtures and reproduce empty and error states', async () => {
  setMockScenario('success');
  assert.equal(apiClient, mockApiClient);

  const [places, detail, checkIn, coupons, travelPurposes, travelSchedules] = await Promise.all([
    mockApiClient.get('/places'),
    mockApiClient.get('/places/17'),
    mockApiClient.post('/location-check-ins', {}),
    mockApiClient.get('/coupons'),
    mockApiClient.get('/users/me/travel-purposes'),
    mockApiClient.get('/users/me/travel-schedules'),
  ]);

  assert.equal(getMockScenario(), 'success');
  assert.equal(places.places[0].trustSummary.verificationStatus, 'VERIFIED');
  assert.equal(detail.id, 17);
  assert.equal(checkIn.status, 'PROXIMITY_MATCHED');
  assert.deepEqual(coupons.coupons.map(({ status }) => status), ['ISSUED', 'EXPIRED']);
  assert.equal(merchantPerformanceFixture.metrics.completedCheckIns, 31);
  assert.deepEqual(travelPurposes.travelPurposes, ['K_POP', 'CAFE']);
  assert.equal(travelSchedules.schedules[0].startDate, '2026-08-12');
  assert.deepEqual(
    await mockApiClient.put('/users/me/travel-purposes', { travelPurposes: ['FOOD'] }),
    travelPurposes,
  );
  assert.deepEqual(
    await mockApiClient.post('/users/me/travel-schedules', {
      startDate: '2026-08-31',
      endDate: '2026-09-02',
    }),
    {
      ...travelSchedules.schedules[0],
      startDate: '2026-08-31',
      endDate: '2026-09-02',
    },
  );
  assert.equal(
    (await mockApiClient.post('/users/me/travel-schedules/1/cancel')).status,
    'CANCELLED',
  );

  setMockScenario('empty');
  const emptyPlaces = await mockApiClient.get('/places');
  const emptyCoupons = await mockApiClient.get('/coupons');
  const emptyTravelSchedules = await mockApiClient.get('/users/me/travel-schedules');

  assert.deepEqual(emptyPlaces.places, []);
  assert.equal(emptyPlaces.totalPages, 0);
  assert.deepEqual(emptyCoupons.coupons, []);
  assert.equal(emptyCoupons.hasNext, false);
  assert.deepEqual(emptyTravelSchedules.schedules, []);

  const cases = [
    ['forbidden', 403, 'ROLE_REQUIRED'],
    ['expired', 410, 'RESOURCE_EXPIRED'],
    ['network-error', undefined, 'ERR_NETWORK'],
  ];

  for (const [scenario, status, code] of cases) {
    setMockScenario(scenario);
    await assert.rejects(
      mockApiClient.get('/places'),
      (error) =>
        error.status === status &&
        error.code === code &&
        (scenario !== 'network-error' || error.isNetworkError),
    );
  }

  setMockScenario('success');
  await assert.rejects(
    mockApiClient.get('/new-contract-route'),
    (error) => error.status === 404 && /No mock response registered/.test(error.message),
  );

  setMockScenario('success');
});
