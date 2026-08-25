import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { ApiError, toApiError } from '../index.ts';
import { createScoutProfileApi } from '../../../features/scout-profile/api/scoutProfileApi.ts';
import {
  cacheScoutProfile,
  createApplyScoutProfileMutationOptions,
  createScoutProfileQueryOptions,
  createUpdateScoutProfileMutationOptions,
} from '../../../features/scout-profile/hooks/useScoutProfile.ts';
import { scoutProfileQueryKeys } from '../../../features/scout-profile/model/scoutProfileQueryKeys.ts';
import {
  isScoutActivityEligible,
  isScoutProfileApiError,
  isScoutProfileNotFoundError,
} from '../../../features/scout-profile/model/scoutProfileSelectors.ts';
import {
  SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES,
  SCOUT_PROFILE_STATUS_VALUES,
} from '../../../features/scout-profile/model/scoutProfile.types.ts';
import { scoutProfileFixture } from '../mock/features/scout-profile/fixtures.ts';

test('live Scout contract snapshot preserves operations, constraints, and nullable response fields', async () => {
  const contract = JSON.parse(await readFile('docs/api/scout-profile.openapi.json', 'utf8'));
  const path = contract.paths['/users/me/scout-profile'];
  const request = contract.components.schemas.ScoutProfileRequest;
  const response = contract.components.schemas.ScoutProfileResponse;
  const securitySchemes = contract.components.securitySchemes;

  assert.deepEqual(Object.keys(path.get.responses).sort(), ['200', '404']);
  assert.deepEqual(Object.keys(path.post.responses).sort(), ['201', '403', '409']);
  assert.deepEqual(Object.keys(path.put.responses).sort(), ['200', '403', '404', '409']);
  for (const method of ['get', 'post', 'put']) {
    assert.deepEqual(path[method].security, [{ bearerAuth: [] }]);
    for (const requirement of path[method].security) {
      for (const schemeName of Object.keys(requirement)) {
        assert.equal(Object.hasOwn(securitySchemes, schemeName), true);
      }
    }
  }
  assert.deepEqual(securitySchemes.bearerAuth, {
    bearerFormat: 'JWT',
    scheme: 'bearer',
    type: 'http',
  });
  assert.equal(path.post.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/ScoutProfileRequest');
  assert.equal(path.put.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/ScoutProfileRequest');
  assert.deepEqual(request.required, ['displayName']);
  assert.equal(request.properties.displayName.maxLength, 100);
  assert.equal(request.properties.introduction.maxLength, 1000);

  const nullableFields = [
    'introduction',
    'profileReviewedByAdminUserId',
    'profileReviewedAt',
    'profileStatusReason',
    'eligibleFrom',
    'eligibleUntil',
    'eligibilityReviewedByAdminUserId',
    'eligibilityReviewedAt',
    'eligibilityStatusReason',
  ];
  for (const field of nullableFields) {
    assert.equal(response.required.includes(field), true);
    assert.equal(response.properties[field].nullable, true);
  }

  assert.deepEqual(response.properties.profileStatus.enum, SCOUT_PROFILE_STATUS_VALUES);
  assert.deepEqual(
    response.properties.activityEligibilityStatus.enum,
    SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES,
  );
});

test('Scout API keeps GET, POST, and PUT paths, bodies, response strings, and AbortSignal', async () => {
  const calls = [];
  const client = {
    delete: async () => undefined,
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return scoutProfileFixture;
    },
    patch: async () => undefined,
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return scoutProfileFixture;
    },
    put: async (path, body, options) => {
      calls.push({ body, method: 'PUT', options, path });
      return scoutProfileFixture;
    },
  };
  const api = createScoutProfileApi(client);
  const signal = new AbortController().signal;
  const applyBody = { displayName: 'Scout' };
  const updateBody = { displayName: 'Updated Scout', introduction: 'Updated profile' };

  assert.equal(await api.getScoutProfile(signal), scoutProfileFixture);
  assert.equal(await api.applyScoutProfile(applyBody, signal), scoutProfileFixture);
  assert.equal(await api.updateScoutProfile(updateBody, signal), scoutProfileFixture);
  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'GET /users/me/scout-profile',
    'POST /users/me/scout-profile',
    'PUT /users/me/scout-profile',
  ]);
  assert.equal(calls[0].options.signal, signal);
  assert.equal(calls[1].body, applyBody);
  assert.equal(calls[1].options.signal, signal);
  assert.equal(calls[2].body, updateBody);
  assert.equal(calls[2].options.signal, signal);
  assert.equal(typeof scoutProfileFixture.createdAt, 'string');
  assert.equal(scoutProfileFixture.eligibleUntil, null);
});

test('Scout Hook options forward AbortSignal and request bodies unchanged', async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const body = { displayName: 'Scout', introduction: 'Hello' };
  const api = {
    getScoutProfile: async (receivedSignal) => {
      calls.push(['get', receivedSignal]);
      return scoutProfileFixture;
    },
    applyScoutProfile: async (receivedBody) => {
      calls.push(['apply', receivedBody]);
      return scoutProfileFixture;
    },
    updateScoutProfile: async (receivedBody) => {
      calls.push(['update', receivedBody]);
      return scoutProfileFixture;
    },
  };
  const query = createScoutProfileQueryOptions(api);
  const apply = createApplyScoutProfileMutationOptions(api);
  const update = createUpdateScoutProfileMutationOptions(api);

  assert.equal(await query.queryFn({ signal }), scoutProfileFixture);
  assert.equal(await apply.mutationFn(body), scoutProfileFixture);
  assert.equal(await update.mutationFn(body), scoutProfileFixture);
  assert.deepEqual(query.queryKey, ['v2', 'users', 'me', 'scout-profile']);
  assert.deepEqual(calls, [
    ['get', signal],
    ['apply', body],
    ['update', body],
  ]);
});

test('Scout mutation success writes only the exact Scout profile cache', () => {
  const queryClient = new QueryClient();
  const unrelatedKey = ['v2', 'users', 'me', 'travel-purposes'];
  const unrelatedValue = { travelPurposes: ['FOOD'] };
  queryClient.setQueryData(unrelatedKey, unrelatedValue);

  cacheScoutProfile(queryClient, scoutProfileFixture);

  assert.equal(queryClient.getQueryData(scoutProfileQueryKeys.mine()), scoutProfileFixture);
  assert.equal(queryClient.getQueryData(unrelatedKey), unrelatedValue);
  assert.equal(queryClient.getQueryState(unrelatedKey).isInvalidated, false);
});

test('Scout domain errors remain ApiError codes and not-found differs from network failure', () => {
  const cases = [
    [404, 'SCOUT_PROFILE_NOT_FOUND'],
    [403, 'SCOUT_PROFILE_ACCOUNT_REQUIRED'],
    [409, 'SCOUT_PROFILE_ALREADY_EXISTS'],
    [409, 'INVALID_SCOUT_PROFILE_STATE'],
  ];

  for (const [status, code] of cases) {
    const error = toApiError({
      isAxiosError: true,
      message: 'Request failed',
      response: { data: { code, message: 'Scout profile error' }, status },
    });
    assert.equal(error instanceof ApiError, true);
    assert.equal(error.code, code);
    assert.equal(error.status, status);
    assert.equal(isScoutProfileApiError(error, code), true);
  }

  const notFound = new ApiError('Not applied', {
    code: 'SCOUT_PROFILE_NOT_FOUND',
    status: 404,
  });
  const network = new ApiError('Offline', { isNetworkError: true });
  assert.equal(isScoutProfileNotFoundError(notFound), true);
  assert.equal(isScoutProfileNotFoundError(network), false);
});

test('Scout activity entry selector derives only from the server eligibility enum', () => {
  for (const status of SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES) {
    assert.equal(isScoutActivityEligible(status), status === 'ELIGIBLE');
  }
});
