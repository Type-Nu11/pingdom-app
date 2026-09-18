import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api/ApiError.ts';
import { createReplaceTravelPurposesMutationOptions, createTravelPurposeQueryOptions, recommendationQueryKeys, refreshPersonalizationCaches, travelPurposeQueryKeys, userQueryKeys } from '../purposes/__tests__/index.ts';
import { validateReplaceTravelPurposesBody } from '../purposes/__tests__/index.ts';
import { createCancelTravelScheduleMutationOptions, createTravelScheduleMutationOptions, createTravelSchedulesQueryOptions, createUpdateTravelScheduleMutationOptions, invalidateTravelScheduleDependencies } from '../schedules/__tests__/index.ts';
import { travelScheduleQueryKeys } from '../schedules/__tests__/index.ts';

test('travel purpose Hook options forward AbortSignal and replace body unchanged', async () => {
  const response = { travelPurposes: ['K_POP', 'FOOD'] };
  const body = { travelPurposes: ['K_POP', 'FOOD'] };
  const signal = new AbortController().signal;
  let receivedSignal;
  let receivedBody;

  const queryOptions = createTravelPurposeQueryOptions({
    getTravelPurposes: async (value) => {
      receivedSignal = value;
      return response;
    },
  });
  const mutationOptions = createReplaceTravelPurposesMutationOptions({
    replaceTravelPurposes: async (value) => {
      receivedBody = value;
      return response;
    },
  });

  assert.equal(await queryOptions.queryFn({ signal }), response);
  assert.equal(await mutationOptions.mutationFn(body), response);
  assert.equal(receivedSignal, signal);
  assert.equal(receivedBody, body);
  assert.deepEqual(queryOptions.queryKey, ['v2', 'users', 'me', 'travel-purposes']);
});

test('travel purpose validation follows OpenAPI empty, maximum, enum, and uniqueness rules', () => {
  const emptyBody = { travelPurposes: [] };

  assert.equal(validateReplaceTravelPurposesBody(emptyBody), emptyBody);
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: Array(10).fill('K_POP') }),
    { name: 'RangeError' },
  );
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: ['FOOD', 'FOOD'] }),
    /must not contain duplicates/,
  );
  assert.throws(
    () => validateReplaceTravelPurposesBody({ travelPurposes: ['UNKNOWN'] }),
    /unsupported value/,
  );
});

test('travel purpose replacement restores its cache and invalidates user and recommendations', async () => {
  const queryClient = new QueryClient();
  const preference = { travelPurposes: ['BEAUTY', 'CAFE'] };

  queryClient.setQueryData(userQueryKeys.me(), { id: 1 });
  queryClient.setQueryData(recommendationQueryKeys.all, { places: [] });

  await refreshPersonalizationCaches(queryClient, preference);

  assert.equal(queryClient.getQueryData(travelPurposeQueryKeys.mine()), preference);
  assert.equal(queryClient.getQueryState(travelPurposeQueryKeys.mine()).isInvalidated, false);
  assert.equal(queryClient.getQueryState(userQueryKeys.me()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(recommendationQueryKeys.all).isInvalidated, true);
});

test('travel schedule Hook options preserve date-only bodies, identifiers, and AbortSignal', async () => {
  const calls = [];
  const response = { schedules: [] };
  const body = { startDate: '2026-08-31', endDate: '2026-09-02' };
  const signal = new AbortController().signal;
  const api = {
    getTravelSchedules: async (receivedSignal) => {
      calls.push(['list', receivedSignal]); return response;
    },
    createTravelSchedule: async (value) => {
      calls.push(['create', value]); return response;
    },
    updateTravelSchedule: async (scheduleId, value) => {
      calls.push(['update', scheduleId, value]); return response;
    },
    cancelTravelSchedule: async (scheduleId) => {
      calls.push(['cancel', scheduleId]); return response;
    },
  };

  const queryOptions = createTravelSchedulesQueryOptions(api);
  const createOptions = createTravelScheduleMutationOptions(api);
  const updateOptions = createUpdateTravelScheduleMutationOptions(api);
  const cancelOptions = createCancelTravelScheduleMutationOptions(api);

  assert.equal(await queryOptions.queryFn({ signal }), response);
  assert.equal(await createOptions.mutationFn(body), response);
  assert.equal(await updateOptions.mutationFn({ body, scheduleId: 7 }), response);
  assert.equal(updateOptions.retry(0, new ApiError('offline', { isNetworkError: true })), true);
  assert.equal(updateOptions.retry(1, new ApiError('offline', { isNetworkError: true })), false);
  assert.equal(updateOptions.retry(0, new ApiError('validation', { status: 400 })), false);
  assert.equal(await cancelOptions.mutationFn(7), response);
  assert.deepEqual(queryOptions.queryKey, [
    'v2', 'users', 'me', 'travel-schedules', 'list',
  ]);
  assert.deepEqual(calls, [
    ['list', signal],
    ['create', body],
    ['update', 7, body],
    ['cancel', 7],
  ]);
});

test('travel schedule mutations invalidate only schedule-dependent caches', async () => {
  const queryClient = new QueryClient();
  const unrelatedKey = ['v2', 'places', 'detail', 17];

  queryClient.setQueryData(travelScheduleQueryKeys.list(), { schedules: [] });
  queryClient.setQueryData(userQueryKeys.me(), { id: 1 });
  queryClient.setQueryData(recommendationQueryKeys.list({ page: 1 }), { places: [] });
  queryClient.setQueryData(unrelatedKey, { id: 17 });

  await invalidateTravelScheduleDependencies(queryClient);

  assert.equal(queryClient.getQueryState(travelScheduleQueryKeys.list()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(userQueryKeys.me()).isInvalidated, true);
  assert.equal(
    queryClient.getQueryState(recommendationQueryKeys.list({ page: 1 })).isInvalidated,
    true,
  );
  assert.equal(queryClient.getQueryState(unrelatedKey).isInvalidated, false);
});
