import axios from 'axios';
import { env } from '../config';
import { toApiError } from './ApiError';

/** Development diagnostics deliberately exclude payloads, query values and credentials. */
export function logRequestFailure(
  method: string,
  path: string,
  startedAt: number,
  error: unknown,
  phase: 'request' | 'fetch-fallback' = 'request',
) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  const failure = toApiError(error);
  if (failure.code === 'ERR_CANCELED') return;
  const transport = axios.isAxiosError(error) ? error : undefined;
  // Server strings can contain credentials even when they look like identifiers.
  // Only known transport constants are useful here; trace/header values stay private.
  const transportCode = typeof transport?.code === 'string' && [
    'ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK', 'ERR_BAD_REQUEST', 'ERR_BAD_RESPONSE',
    'ERR_CANCELED', 'ERR_INVALID_URL', 'ERR_NOT_SUPPORT',
  ].includes(transport.code) ? transport.code : undefined;
  const code = transportCode;
  const timeout = ['ECONNABORTED', 'ETIMEDOUT', 'REQUEST_TIMEOUT'].includes(code ?? '');
  const baseUrl = transport?.config?.baseURL ?? env.apiBaseUrl;
  const origin = /^https?:\/\/([^/@?#]+)(?:[/?#]|$)/i.exec(baseUrl)?.[1];
  const segments = path.split(/[?#]/, 1)[0].split('/');
  const route = segments.map((segment, index) =>
    segments[index - 1] === 'sessions' ? ':id'
      : /^[a-z][a-z-]*$/.test(segment) || segment === '' ? segment : ':id',
  ).join('/');
  console.warn('[V2 API failure]', JSON.stringify({
    method, route, host: origin, phase,
    elapsedMs: Math.max(0, Date.now() - startedAt),
    status: failure.status ?? null,
    kind: timeout ? 'timeout' : failure.status ? 'http' : failure.isNetworkError ? 'network' : 'client',
    code,
    transportCode,
  }));
}
