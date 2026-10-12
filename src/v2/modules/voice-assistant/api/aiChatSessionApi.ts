import { apiClient, type ApiClient } from '../../../shared/api';
import type { components } from '../../../shared/api/generated/aiChat';
import { AI_CHAT_TOOLS } from '../model/aiChatTools';
import { parseVoiceAssistantEnvelope } from '../model/voiceAssistantCommandParser';
import type { AppCommandResult, ProviderEnvelope } from '../model/voiceAssistantCommand.types';
import { VoiceSessionError, voiceSessionError } from '../model/voiceSessionError';
import { utf8Length, VOICE_RESPONSE_LIMIT, type VoiceSessionApi } from './voiceSessionApi';

// Upstream Message.content references object-only JsonNode, but its published examples use text/null.
// Keep that compatibility correction local to this transport boundary; generated types stay untouched.
type Message = Omit<components['schemas']['Message'], 'content'> & { content?: string | null | Record<string, unknown> };
type ToolCall = components['schemas']['ToolCall'];
type Request = Omit<components['schemas']['AiChatRequest'], 'messages'> & { messages: Message[] };
type Delivery = { envelope: ProviderEnvelope; callId?: string };
const invalid = (): never => { throw new VoiceSessionError('INVALID_RESPONSE'); };
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
};
const exact = (value: Record<string, unknown>, fields: readonly string[]) => {
  if (Object.keys(value).some(key => !fields.includes(key))) invalid();
};
let sessionSequence = 0;

/** Stateless server chat; this adapter owns only bounded, account-scoped in-memory history. */
export function createAiChatSessionApi(client: ApiClient = apiClient): VoiceSessionApi & {
  recordResult: (result: AppCommandResult) => void;
} {
  let history: Message[] = [];
  let queue: Delivery[] = [];
  let waiting: Delivery | undefined;
  let completed: AppCommandResult | undefined;
  let sessionId = '';
  let revision = 0;
  let sequence = 0;
  let rounds = 0;
  let needsFollowUp = false;
  const reset = () => { revision++; history = []; queue = []; waiting = undefined; completed = undefined; needsFollowUp = false; };
  const requireCurrent = (id: string, signal: AbortSignal, captured: number) => {
    if (signal.aborted || id !== sessionId || captured !== revision) throw new VoiceSessionError('CANCELED');
  };
  const localSession = () => ({ sessionId, expiresAt: new Date(Date.now() + 300_000).toISOString() });
  const dequeue = () => { waiting = queue.shift(); completed = undefined; return waiting?.envelope; };

  async function exchange(messages: Message[], id: string, signal: AbortSignal): Promise<ProviderEnvelope> {
    const captured = revision;
    requireCurrent(id, signal, captured);
    if (messages.length > 40) throw new VoiceSessionError('LEDGER_FULL'); // Reserve space for a complete tool batch (server max 50).
    if (++rounds > 4) throw new VoiceSessionError('LEDGER_FULL');
    const aborter = new AbortController(); let oversized = false;
    const abort = () => aborter.abort(); signal.addEventListener('abort', abort, { once: true });
    try {
      const raw = await client.post<unknown, Request>('/ai/chat', { messages, tools: AI_CHAT_TOOLS }, {
        signal: aborter.signal, responseType: 'text', maxContentLength: VOICE_RESPONSE_LIMIT,
        onDownloadProgress: event => { if (event.loaded > VOICE_RESPONSE_LIMIT) { oversized = true; aborter.abort(); } },
      });
      requireCurrent(id, signal, captured);
      if (oversized || (typeof raw === 'string' && utf8Length(raw) > VOICE_RESPONSE_LIMIT)) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
      if (typeof raw !== 'string') return invalid();
      let decoded: unknown;
      try { decoded = JSON.parse(raw); } catch { return invalid(); }
      const response = object(decoded);
      exact(response, ['content', 'tool_calls']);
      const content = response.content;
      if (content !== undefined && content !== null && (typeof content !== 'string' || content.length > 2000)) return invalid();
      const calls = response.tool_calls ?? [];
      if (!Array.isArray(calls) || calls.length > 8) return invalid();
      const used = new Set(history.flatMap(message => message.tool_calls?.map(call => call.id) ?? []));
      const deliveries: Delivery[] = [];
      const wireCalls: ToolCall[] = [];
      if (typeof content === 'string' && content.trim()) deliveries.push({ envelope: {
        schemaVersion: 1, id: `chat-${++sequence}`, kind: 'assistant_message', text: content,
      } });
      // Validate the entire batch before exposing any executable command.
      for (const rawCall of calls) {
        const call = object(rawCall); exact(call, ['id', 'type', 'function']);
        if (typeof call.id !== 'string' || !call.id.trim() || call.id.length > 128 || used.has(call.id) || call.type !== 'function') return invalid();
        used.add(call.id);
        const fn = object(call.function); exact(fn, ['name', 'arguments']);
        const tool = AI_CHAT_TOOLS.find(item => item.function.name === fn.name);
        if (!tool) return invalid();
        const args = object(fn.arguments);
        if (Object.keys(args).some(key => !Object.hasOwn(tool.function.parameters.properties, key))) return invalid();
        const parsed = parseVoiceAssistantEnvelope({ schemaVersion: 1, id: `chat-${++sequence}`, kind: 'command_request', command: fn.name,
          args: fn.name === 'searchNearbyPlaces' ? { ...args, useCurrentLocation: true } : args });
        if (!parsed.ok || parsed.value.kind !== 'command_request') return invalid();
        deliveries.push({ envelope: parsed.value, callId: call.id });
        wireCalls.push({ id: call.id, type: 'function', function: { name: tool.function.name, arguments: args } });
      }
      if (!deliveries.length) return invalid();
      history = [...messages, { role: 'assistant', content: content ?? null, tool_calls: wireCalls }];
      queue = deliveries; needsFollowUp = wireCalls.length > 0;
      return dequeue()!;
    } catch (error) {
      if (oversized) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
      if (signal.aborted || captured !== revision) throw new VoiceSessionError('CANCELED');
      throw voiceSessionError(error);
    } finally { signal.removeEventListener('abort', abort); }
  }
  return {
    reset,
    async create(signal) { if (signal.aborted) throw new VoiceSessionError('CANCELED'); reset(); sessionId = `local-chat-${++sessionSequence}`; return localSession(); },
    async refresh(id, signal) { requireCurrent(id, signal, revision); return localSession(); },
    async close() { reset(); sessionId = ''; },
    async send(id, input, signal) {
      // An interrupted incomplete tool batch is never sent as a malformed conversation.
      if (queue.length || waiting?.callId) reset();
      revision++; queue = []; waiting = undefined; completed = undefined; needsFollowUp = false; rounds = 0;
      return exchange([...history, { role: 'user', content: input.text }], id, signal);
    },
    recordResult(result) {
      if (!waiting?.callId || result.commandId !== waiting.envelope.id || result.command !== (waiting.envelope.kind === 'command_request' ? waiting.envelope.command : null)) return invalid();
      completed = result;
    },
    async next(id, signal) {
      requireCurrent(id, signal, revision);
      if (waiting?.callId) {
        if (!completed) throw new VoiceSessionError('DELIVERY_FAILED');
        // Only executor-projected public facts go to the model; no bearer, quote token, or reservation body.
        history = [...history, { role: 'tool', tool_call_id: waiting.callId, content: completed.outcome }];
      }
      waiting = undefined; completed = undefined;
      if (queue.length) return dequeue();
      if (!needsFollowUp) return undefined;
      needsFollowUp = false;
      return exchange(history, id, signal);
    },
  };
}
