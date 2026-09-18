import { apiClient, type ApiClient } from '../../../shared/api';
import type { components } from '../../../shared/api/generated/voiceAi';
import { voiceSessionExpiresAt } from '../model/voiceSessionExpiry';
import { parseVoiceAssistantEnvelope } from '../model/voiceAssistantCommandParser';
import { VoiceSessionError, voiceSessionError } from '../model/voiceSessionError';

export type VoiceSessionDto = components['schemas']['VoiceAiSessionResponse'];
export type VoiceProviderEnvelopeDto = components['schemas']['ProviderEnvelopeV1'];
export type VoiceMessageRequest = components['schemas']['VoiceAiMessageRequest'];
export const VOICE_RESPONSE_LIMIT = 16 * 1024;

/** Counts UTF-8 bytes without allocating another response-sized buffer (also works in Hermes). */
export function utf8Length(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const point = char.codePointAt(0)!;
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes > VOICE_RESPONSE_LIMIT) break;
  }
  return bytes;
}
export function decodeVoiceFinal(raw: unknown) {
  if (typeof raw !== 'string') throw new VoiceSessionError('INVALID_RESPONSE');
  if (utf8Length(raw) > VOICE_RESPONSE_LIMIT) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
  if (!raw.length) throw new VoiceSessionError('INVALID_RESPONSE');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new VoiceSessionError('INVALID_RESPONSE'); }
  const parsed = parseVoiceAssistantEnvelope(value);
  if (!parsed.ok) throw new VoiceSessionError('INVALID_RESPONSE');
  return parsed.value;
}
function session(value: VoiceSessionDto): Required<VoiceSessionDto> {
  if (!value || typeof value.sessionId !== 'string' || !value.sessionId
    || value.sessionId.length > 1024 || typeof value.expiresAt !== 'string' || !value.expiresAt) {
    throw new VoiceSessionError('INVALID_RESPONSE');
  }
  voiceSessionExpiresAt(value.expiresAt);
  return Object.freeze({ sessionId: value.sessionId, expiresAt: value.expiresAt });
}
export function createVoiceSessionApi(client: ApiClient = apiClient) {
  const path = (id: string) => `/voice-ai/sessions/${encodeURIComponent(id)}`;
  return {
    async create(signal: AbortSignal) {
      try { return session(await client.post<VoiceSessionDto>('/voice-ai/sessions', undefined, { signal })); }
      catch (e) { throw voiceSessionError(e); }
    },
    async refresh(id: string, signal: AbortSignal) {
      try {
        const result = session(await client.post<VoiceSessionDto>(`${path(id)}/refresh`, undefined, { signal }));
        if (result.sessionId !== id) throw new VoiceSessionError('INVALID_RESPONSE');
        return result;
      } catch (e) { throw voiceSessionError(e); }
    },
    async close(id: string, signal: AbortSignal) {
      try { await client.delete<void>(path(id), undefined, { signal }); }
      catch (e) { throw voiceSessionError(e); }
    },
    async send(id: string, input: VoiceMessageRequest, signal: AbortSignal) {
      const controller = new AbortController();
      let oversized = false;
      const abort = () => controller.abort();
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
      try {
        const raw = await client.post<unknown, VoiceMessageRequest>(`${path(id)}/messages`, input, {
          signal: controller.signal, responseType: 'text', maxContentLength: VOICE_RESPONSE_LIMIT,
          onDownloadProgress: event => {
            if (event.loaded > VOICE_RESPONSE_LIMIT) { oversized = true; controller.abort(); }
          },
        });
        if (oversized) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
        if (signal.aborted) throw new VoiceSessionError('CANCELED');
        const envelope = decodeVoiceFinal(raw);
        if (envelope.id !== input.requestId) throw new VoiceSessionError('INVALID_RESPONSE');
        return envelope;
      } catch (e) {
        if (oversized) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
        if (signal.aborted) throw new VoiceSessionError('CANCELED');
        throw voiceSessionError(e);
      } finally { signal.removeEventListener('abort', abort); }
    },
  };
}
export type VoiceSessionApi = ReturnType<typeof createVoiceSessionApi>;
