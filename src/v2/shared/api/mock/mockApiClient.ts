import { env, type MockScenario } from '../../config/env';
import { ApiError } from '../ApiError';
import type { ApiClient, GetRequestOptions, MutationRequestOptions } from '../apiClient';
import { featureMockHandlers } from './features';
import { getDomainMockHandlers } from './registry';
import {
  checkInFixture,
  checkInPageFixture,
  conversionBatchResultFixture,
  emptyPageFixtures,
  placeClaimFixture,
  placeClaimPageFixture,
  placeDetailFixture,
  placePageFixture,
  statusVoteFixture,
} from './fixtures';
import { resolveMockHandler, type MockMethod } from './handlers';

let activeScenario: MockScenario = env.mock.scenario;

export function setMockScenario(scenario: MockScenario): void {
  if (!env.isDevelopment) {
    throw new Error('Mock scenarios can only be changed in development.');
  }
  activeScenario = scenario;
}

export function getMockScenario(): MockScenario {
  return activeScenario;
}

function wait(signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(new ApiError('Mock request aborted', { code: 'ERR_CANCELED' }));
  }

  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      clearTimeout(timeout);
      reject(new ApiError('Mock request aborted', { code: 'ERR_CANCELED' }));
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, env.mock.latencyMs);
    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

function scenarioError(path: string): ApiError | undefined {
  const visitVerificationPath = path.startsWith('/visit-verification-sessions');
  switch (activeScenario) {
    case 'forbidden':
      if (visitVerificationPath) return undefined;
      return new ApiError('Mock permission denied', { code: 'ROLE_REQUIRED', status: 403 });
    case 'expired':
      if (visitVerificationPath) return undefined;
      return new ApiError('Mock resource expired', { code: 'RESOURCE_EXPIRED', status: 410 });
    case 'network-error':
      return new ApiError('Mock network unavailable', {
        code: 'ERR_NETWORK',
        isNetworkError: true,
      });
    default:
      return undefined;
  }
}

function notFound(path: string): never {
  throw new ApiError(`No mock response registered for ${path}`, {
    code: 'PLACE_NOT_FOUND',
    status: 404,
  });
}

function toLocationCheckInWirePage(page: typeof checkInPageFixture) {
  return {
    hasNext: page.hasNext,
    items: page.checkIns,
    limit: page.limit,
    page: page.page,
    totalElements: page.totalCount,
    totalPages: page.totalPages,
  };
}

function getSuccess(path: string): unknown {
  if (path === '/places') return placePageFixture;
  if (/^\/places\/\d+$/.test(path)) return placeDetailFixture;
  if (path === '/location-check-ins') return toLocationCheckInWirePage(checkInPageFixture);
  if (path === '/merchant-owner/place-claims') return placeClaimPageFixture;
  if (/^\/merchant-owner\/place-claims\/\d+$/.test(path)) return placeClaimFixture;
  return notFound(path);
}

function getEmpty(path: string): unknown {
  if (path === '/places') return emptyPageFixtures.places;
  if (path === '/location-check-ins') return toLocationCheckInWirePage(emptyPageFixtures.checkIns);
  if (path === '/merchant-owner/place-claims') return emptyPageFixtures.claims;
  return notFound(path);
}

function postSuccess(path: string): unknown {
  if (path === '/location-check-ins') return checkInFixture;
  if (/^\/places\/\d+\/status-votes$/.test(path)) return statusVoteFixture;
  if (path === '/merchant-owner/place-claims') return placeClaimFixture;
  if (/^\/merchant-owner\/place-claims\/\d+\/cancel$/.test(path)) {
    return { ...placeClaimFixture, status: 'CANCELED' };
  }
  if (path === '/conversion-events/batch') return conversionBatchResultFixture;
  return notFound(path);
}

async function resolve<T>(
  method: MockMethod,
  path: string,
  signal?: AbortSignal,
  body?: unknown,
): Promise<T> {
  await wait(signal);
  const error = scenarioError(path);
  if (error) throw error;

  const featureResult = resolveMockHandler([...getDomainMockHandlers(), ...featureMockHandlers], {
    body,
    method,
    path,
    scenario: activeScenario,
  });
  if (featureResult.found) return featureResult.response as T;

  if (method === 'PATCH' && path === '/firebase/fcm-token') return undefined as T;
  if (method === 'POST') return postSuccess(path) as T;
  if (method === 'PUT') return notFound(path);
  if (activeScenario === 'empty') return getEmpty(path) as T;
  return getSuccess(path) as T;
}

export const mockApiClient: ApiClient = {
  delete: <TResponse>(
    path: string,
    body?: unknown,
    options: MutationRequestOptions = {},
  ) => resolve<TResponse>('DELETE', path, options.signal, body),
  get: <TResponse>(path: string, options: GetRequestOptions = {}) =>
    resolve<TResponse>('GET', path, options.signal),
  patch: <TResponse>(
    path: string,
    body: unknown,
    options: MutationRequestOptions = {},
  ) => resolve<TResponse>('PATCH', path, options.signal, body),
  post: <TResponse>(
    path: string,
    body?: unknown,
    options: MutationRequestOptions = {},
  ) => resolve<TResponse>('POST', path, options.signal, body),
  put: <TResponse>(
    path: string,
    body: unknown,
    options: MutationRequestOptions = {},
  ) => resolve<TResponse>('PUT', path, options.signal, body),
};
