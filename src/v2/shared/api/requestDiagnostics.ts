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
  // Identifier syntax does not prove privacy: server codes/trace IDs can echo credentials.
  const transportCodes = new Set(['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK', 'ERR_BAD_REQUEST',
    'ERR_BAD_RESPONSE', 'ECONNRESET', 'ERR_STREAM_PREMATURE_CLOSE']);
  const transport = axios.isAxiosError(error) ? error : undefined;
  const timeout = ['ECONNABORTED', 'ETIMEDOUT', 'REQUEST_TIMEOUT'].includes(failure.code ?? '');
  const baseUrl = transport?.config?.baseURL ?? env.apiBaseUrl;
  const origin = /^https?:\/\/([^/@?#]+)(?:[/?#]|$)/i.exec(baseUrl)?.[1];
  const sanitizedPath = path.split(/[?#]/, 1)[0]
    .replace(/^(\/voice-ai\/sessions)\/[^/]+/, '$1/:id');
  const route = sanitizedPath.split('/').map(segment =>
    /^[a-z][a-z-]*$/.test(segment) || segment === '' ? segment : ':id',
  ).join('/');
  console.warn('[V2 API failure]', JSON.stringify({
    method, route, host: origin, phase,
    elapsedMs: Math.max(0, Date.now() - startedAt),
    status: failure.status ?? null,
    kind: timeout ? 'timeout' : failure.status ? 'http' : failure.isNetworkError ? 'network' : 'client',
    transportCode: transport?.code && transportCodes.has(transport.code) ? transport.code : undefined,
  }));
}
