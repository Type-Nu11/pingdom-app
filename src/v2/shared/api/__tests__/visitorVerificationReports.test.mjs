import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { createVisitorVerificationReportApi } from '../../../features/visitor-verification-reports/api/visitorVerificationReportApi.ts';
import {
  createVisitorVerificationReportCorrectionMutationOptions,
  createVisitorVerificationReportCorrectionsQueryOptions,
  createVisitorVerificationReportDetailQueryOptions,
  createVisitorVerificationReportListQueryOptions,
  createVisitorVerificationReportMutationOptions,
  invalidateVisitorVerificationReportCaches,
} from '../../../features/visitor-verification-reports/hooks/useVisitorVerificationReports.ts';
import { visitorVerificationReportQueryKeys } from '../../../features/visitor-verification-reports/model/visitorVerificationReportQueryKeys.ts';
import { ApiError, createApiClient } from '../index.ts';
import { mockApiClient, setMockScenario } from '../mock/mockApiClient.ts';

test('visitor verification report API preserves all live OpenAPI paths, params, bodies, and signals', async () => {
  const calls = [];
  const response = { contract: 'response' };
  const client = {
    delete: async () => response,
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return response;
    },
    patch: async () => response,
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return response;
    },
    put: async () => response,
  };
  const api = createVisitorVerificationReportApi(client);
  const signal = new AbortController().signal;
  const createBody = {
    description: '현재 대기 시간은 30분입니다.',
    placeId: 17,
    reportType: 'WAIT_TIME',
    waitTimeMinutes: 30,
  };
  const correctionBody = {
    description: '평일 대기 시간은 15분입니다.',
    waitTimeMinutes: 15,
  };

  const results = await Promise.all([
    api.listReports({ limit: 20, page: 1 }, signal),
    api.createReport(createBody, signal),
    api.getReport(172, signal),
    api.listCorrections(172, { limit: 10, page: 2 }, signal),
    api.submitCorrection(172, correctionBody, signal),
  ]);

  assert.ok(results.every((result) => result === response));
  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'GET /visitor-verification-reports',
    'POST /visitor-verification-reports',
    'GET /visitor-verification-reports/172',
    'GET /visitor-verification-reports/172/corrections',
    'POST /visitor-verification-reports/172/corrections',
  ]);
  assert.deepEqual(calls[0].options.params, { limit: 20, page: 1 });
  assert.equal(calls[1].body, createBody);
  assert.deepEqual(calls[3].options.params, { limit: 10, page: 2 });
  assert.equal(calls[4].body, correctionBody);
  assert.ok(calls.every(({ options }) => options.signal === signal));
});

test('report query options forward AbortSignal and mutation options preserve server bodies', async () => {
  const calls = [];
  const response = { id: 172 };
  const signal = new AbortController().signal;
  const api = {
    createReport: async (body) => { calls.push(['create', body]); return response; },
    getReport: async (reportId, receivedSignal) => {
      calls.push(['detail', reportId, receivedSignal]); return response;
    },
    listCorrections: async (reportId, params, receivedSignal) => {
      calls.push(['corrections', reportId, params, receivedSignal]); return response;
    },
    listReports: async (params, receivedSignal) => {
      calls.push(['list', params, receivedSignal]); return response;
    },
    submitCorrection: async (reportId, body) => {
      calls.push(['submitCorrection', reportId, body]); return response;
    },
  };
  const createBody = { description: '제보', placeId: 17, reportType: 'OTHER' };
  const correctionBody = { description: '정정' };
  const list = createVisitorVerificationReportListQueryOptions({ page: 1 }, api);
  const detail = createVisitorVerificationReportDetailQueryOptions(172, api);
  const corrections = createVisitorVerificationReportCorrectionsQueryOptions(
    172,
    { limit: 20 },
    api,
  );
  const create = createVisitorVerificationReportMutationOptions(api);
  const submitCorrection = createVisitorVerificationReportCorrectionMutationOptions(api);

  await list.queryFn({ signal });
  await detail.queryFn({ signal });
  await corrections.queryFn({ signal });
  await create.mutationFn(createBody);
  await submitCorrection.mutationFn({ body: correctionBody, reportId: 172 });

  assert.deepEqual(list.queryKey, ['v2', 'visitor-verification-reports', 'list', { page: 1 }]);
  assert.deepEqual(detail.queryKey, ['v2', 'visitor-verification-reports', 'detail', 172]);
  assert.deepEqual(corrections.queryKey, [
    'v2', 'visitor-verification-reports', 'detail', 172, 'corrections', { limit: 20 },
  ]);
  assert.deepEqual(calls, [
    ['list', { page: 1 }, signal],
    ['detail', 172, signal],
    ['corrections', 172, { limit: 20 }, signal],
    ['create', createBody],
    ['submitCorrection', 172, correctionBody],
  ]);
  assert.equal(create.retry, false);
  assert.equal(submitCorrection.retry, false);
});

test('report mutations invalidate related lists, exact detail, and correction history only', async () => {
  const queryClient = new QueryClient();
  const list = visitorVerificationReportQueryKeys.list({ page: 1 });
  const detail = visitorVerificationReportQueryKeys.detail(172);
  const corrections = visitorVerificationReportQueryKeys.correctionList(172, { page: 1 });
  const otherDetail = visitorVerificationReportQueryKeys.detail(999);
  const unrelated = ['v2', 'places', 'detail', 17];

  for (const key of [list, detail, corrections, otherDetail, unrelated]) {
    queryClient.setQueryData(key, { cached: true });
  }

  await invalidateVisitorVerificationReportCaches(queryClient, 172);

  assert.equal(queryClient.getQueryState(list).isInvalidated, true);
  assert.equal(queryClient.getQueryState(detail).isInvalidated, true);
  assert.equal(queryClient.getQueryState(corrections).isInvalidated, true);
  assert.equal(queryClient.getQueryState(otherDetail).isInvalidated, false);
  assert.equal(queryClient.getQueryState(unrelated).isInvalidated, false);
});

test('visitor verification mock uses the live response shapes and server-owned statuses', async () => {
  setMockScenario('success');
  const list = await mockApiClient.get('/visitor-verification-reports');
  const detail = await mockApiClient.get('/visitor-verification-reports/172');
  const history = await mockApiClient.get('/visitor-verification-reports/172/corrections');
  const created = await mockApiClient.post('/visitor-verification-reports', {
    description: '언어 지원 제보',
    languageCode: 'ko-KR',
    placeId: 17,
    reportType: 'LANGUAGE_SUPPORT',
  });
  const correction = await mockApiClient.post(
    '/visitor-verification-reports/172/corrections',
    { description: '언어 지원 정정', languageCode: 'en-US' },
  );

  assert.deepEqual(Object.keys(list).sort(), [
    'hasNext', 'limit', 'page', 'reports', 'totalElements', 'totalPages',
  ]);
  assert.equal(detail.status, 'ACCEPTED');
  assert.equal(detail.evidenceUrl, 'https://example.com/evidence/wait-time.jpg');
  assert.equal(history.corrections[0].reportStatus, 'ACCEPTED');
  assert.equal(history.corrections[0].status, 'SUBMITTED');
  assert.equal(created.status, 'SUBMITTED');
  assert.equal(created.languageCode, 'ko-KR');
  assert.equal(created.reviewedAt, null);
  assert.equal(correction.reportId, 172);
  assert.equal(correction.status, 'SUBMITTED');

  setMockScenario('empty');
  assert.deepEqual((await mockApiClient.get('/visitor-verification-reports')).reports, []);
  assert.deepEqual(
    (await mockApiClient.get('/visitor-verification-reports/172/corrections')).corrections,
    [],
  );
  setMockScenario('success');
});

test('common API client distinguishes all documented report error statuses as ApiError', async () => {
  for (const status of [400, 401, 403, 404, 409]) {
    const transport = {
      delete: async () => ({}),
      get: async () => {
        throw {
          isAxiosError: true,
          message: `request failed: ${status}`,
          response: { data: { code: `ERROR_${status}`, message: `error ${status}` }, status },
        };
      },
      patch: async () => ({}),
      post: async () => ({}),
      put: async () => ({}),
    };
    const api = createVisitorVerificationReportApi(createApiClient(transport));

    await assert.rejects(
      api.getReport(172),
      (error) => error instanceof ApiError && error.status === status && error.code === `ERROR_${status}`,
    );
  }
});
