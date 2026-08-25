import assert from 'node:assert/strict';
import test from 'node:test';

import { mockApiClient, setMockScenario } from '../index.ts';

test('Scout mock handlers use contract-shaped fixtures and support apply/update/not-applied states', async () => {
  setMockScenario('success');
  const profile = await mockApiClient.get('/users/me/scout-profile');
  assert.equal(profile.profileStatus, 'ACTIVE');
  assert.equal(profile.activityEligibilityStatus, 'ELIGIBLE');
  assert.equal(profile.eligibleUntil, null);

  const applied = await mockApiClient.post('/users/me/scout-profile', {
    displayName: 'New Scout',
  });
  assert.equal(applied.displayName, 'New Scout');
  assert.equal(applied.introduction, null);
  assert.equal(applied.profileStatus, 'PENDING');

  const updated = await mockApiClient.put('/users/me/scout-profile', {
    displayName: 'Updated Scout',
    introduction: 'Updated profile',
  });
  assert.equal(updated.displayName, 'Updated Scout');
  assert.equal(updated.introduction, 'Updated profile');

  setMockScenario('empty');
  await assert.rejects(
    mockApiClient.get('/users/me/scout-profile'),
    (error) => error.status === 404 && error.code === 'SCOUT_PROFILE_NOT_FOUND',
  );
  await assert.rejects(
    mockApiClient.put('/users/me/scout-profile', { displayName: 'Missing' }),
    (error) => error.status === 404 && error.code === 'SCOUT_PROFILE_NOT_FOUND',
  );

  setMockScenario('success');
});
