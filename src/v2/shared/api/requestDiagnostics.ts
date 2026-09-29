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
  const safeIdentifier = (value: unknown) => typeof value === 'string'
    && /^[a-zA-Z0-9_.:-]{1,100}$/.test(value) ? value : undefined;
  const transport = axios.isAxiosError(error) ? error : undefined;
  const code = safeIdentifier(failure.code);
  const timeout = ['ECONNABORTED', 'ETIMEDOUT', 'REQUEST_TIMEOUT'].includes(code ?? '');
  const baseUrl = transport?.config?.baseURL ?? env.apiBaseUrl;
  const origin = /^https?:\/\/([^/@?#]+)(?:[/?#]|$)/i.exec(baseUrl)?.[1];
  const route = path.split(/[?#]/, 1)[0].split('/').map(segment =>
    /^[a-z][a-z-]*$/.test(segment) || segment === '' ? segment : ':id',
  ).join('/');
  const headers = transport?.response?.headers;
  console.warn('[V2 API failure]', JSON.stringify({
    method, route, host: origin, phase,
    elapsedMs: Math.max(0, Date.now() - startedAt),
    status: failure.status ?? null,
    kind: timeout ? 'timeout' : failure.status ? 'http' : failure.isNetworkError ? 'network' : 'client',
    code,
    traceId: safeIdentifier(failure.traceId ?? headers?.['x-request-id'] ?? headers?.['x-trace-id']),
    transportCode: safeIdentifier(transport?.code),
  }));
}
