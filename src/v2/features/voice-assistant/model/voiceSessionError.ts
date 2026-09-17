import { toApiError } from '../../../shared/api';

export type VoiceSessionErrorCode = 'CANCELED' | 'TIMEOUT' | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'PROVIDER_ERROR' | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR' | 'CONNECTION_CLOSED' | 'INVALID_RESPONSE' | 'RESPONSE_TOO_LARGE'
  | 'SESSION_NOT_FOUND' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_RESPONSE_INVALID'
  | 'RATE_LIMIT_UNAVAILABLE' | 'RETRY_UNAVAILABLE' | 'RETRY_BACKOFF'
  | 'REPLAY_CONFLICT' | 'DELIVERY_FAILED' | 'SESSION_REQUIRED' | 'LEDGER_FULL' | 'INVALID_INPUT';

/** Safe public failure: never retain ApiError, body, prompt, or raw message. */
export class VoiceSessionError extends Error {
  constructor(readonly code: VoiceSessionErrorCode) { super(code); this.name = 'VoiceSessionError'; }
}
export function voiceSessionError(error: unknown): VoiceSessionError {
  if (error instanceof VoiceSessionError) return error;
  const api = toApiError(error);
  if (['ECONNRESET', 'ERR_STREAM_PREMATURE_CLOSE'].includes(api.code ?? '')) return new VoiceSessionError('CONNECTION_CLOSED');
  if (api.code === 'ERR_CANCELED') return new VoiceSessionError('CANCELED');
  if (['ECONNABORTED', 'ETIMEDOUT', 'REQUEST_TIMEOUT'].includes(api.code ?? '')) return new VoiceSessionError('TIMEOUT');
  if (api.status === 401) return new VoiceSessionError('AUTHENTICATION_REQUIRED');
  if (api.status === 403) return new VoiceSessionError('FORBIDDEN');
  if (api.status === 429) return new VoiceSessionError('RATE_LIMITED');
  if (api.status === 410) return new VoiceSessionError('SESSION_EXPIRED');
  if (api.status === 404) return new VoiceSessionError('SESSION_NOT_FOUND');
  if (api.status === 409 && api.code === 'REPLAY_CONFLICT') return new VoiceSessionError('REPLAY_CONFLICT');
  if (api.status === 502 && api.code === 'PROVIDER_UNAVAILABLE') return new VoiceSessionError('PROVIDER_UNAVAILABLE');
  if (api.status === 502 && api.code === 'PROVIDER_RESPONSE_INVALID') return new VoiceSessionError('PROVIDER_RESPONSE_INVALID');
  if (api.status === 503 && api.code === 'RATE_LIMIT_UNAVAILABLE') return new VoiceSessionError('RATE_LIMIT_UNAVAILABLE');
  // No server-specific timeout code exists; provider timeout stays PROVIDER_UNAVAILABLE.
  if (api.status === 502) return new VoiceSessionError('PROVIDER_ERROR');
  if (api.status && api.status >= 500) return new VoiceSessionError('SERVER_ERROR');
  if (api.isNetworkError) return new VoiceSessionError('NETWORK_ERROR');
  return new VoiceSessionError('INVALID_RESPONSE');
}
