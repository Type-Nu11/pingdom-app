import { env, type MockScenario } from '../../config/env';
import { ApiError } from '../ApiError';
import type { ApiClient, GetRequestOptions, MutationRequestOptions } from '../apiClient';
import { featureMockHandlers } from './features';
import {
  availabilityFixture,
  checkInFixture,
  checkInPageFixture,
  conversionBatchResultFixture,
  couponFixture,
  couponPageFixture,
  emptyPageFixtures,
  offerFixture,
  offerPageFixture,
  placeClaimFixture,
  placeClaimPageFixture,
  placeDetailFixture,
  placePageFixture,
  reservationFixture,
  reservationPageFixture,
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
  if (path === '/offers') return offerPageFixture;
  if (/^\/offers\/\d+$/.test(path)) return offerFixture;
  if (path === '/coupons') return couponPageFixture;
  if (/^\/places\/\d+\/availabilities$/.test(path)) return [availabilityFixture];
  if (path === '/reservations' || path === '/merchant-owner/reservations') {
    return reservationPageFixture;
  }
  return notFound(path);
}

function getEmpty(path: string): unknown {
  if (path === '/places') return emptyPageFixtures.places;
  if (path === '/location-check-ins') return toLocationCheckInWirePage(emptyPageFixtures.checkIns);
  if (path === '/merchant-owner/place-claims') return emptyPageFixtures.claims;
  if (path === '/offers') return emptyPageFixtures.offers;
  if (path === '/coupons') return emptyPageFixtures.coupons;
  if (/^\/places\/\d+\/availabilities$/.test(path)) return [];
  if (path === '/reservations' || path === '/merchant-owner/reservations') {
    return emptyPageFixtures.reservations;
  }
  return notFound(path);
}

function postSuccess(path: string): unknown {
  if (path === '/location-check-ins') return checkInFixture;
  if (/^\/places\/\d+\/status-votes$/.test(path)) return statusVoteFixture;
  if (path === '/merchant-owner/place-claims') return placeClaimFixture;
  if (/^\/merchant-owner\/place-claims\/\d+\/cancel$/.test(path)) {
    return { ...placeClaimFixture, status: 'CANCELED' };
  }
  if (/^\/offers\/\d+\/coupons$/.test(path)) return couponFixture;
  if (path === '/merchant-owner/offers/coupons/redeem') {
    return { ...couponFixture, status: 'REDEEMED', redeemedAt: '2026-07-23T05:35:00Z' };
  }
  if (path === '/reservations') return reservationFixture;
  if (/\/reservations\/\d+\/confirm$/.test(path)) {
    return { ...reservationFixture, status: 'CONFIRMED', confirmedAt: '2026-07-23T05:35:00Z' };
  }
  if (/\/reservations\/\d+\/cancel$/.test(path)) {
    return { ...reservationFixture, status: 'CANCELED', canceledAt: '2026-07-23T05:35:00Z' };
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

  const featureResult = resolveMockHandler(featureMockHandlers, {
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
