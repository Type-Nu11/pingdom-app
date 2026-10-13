import { apiClient, toApiError, type ApiClient } from '../../../shared/api';
import type { components } from '../../../shared/api/generated/aiChat';
import { AI_CHAT_SYSTEM_PROMPT, AI_CHAT_TOOLS } from '../model/aiChatTools';
import { parseVoiceAssistantEnvelope } from '../model/voiceAssistantCommandParser';
import type { AppCommandResult, ProviderEnvelope } from '../model/voiceAssistantCommand.types';
import { VoiceSessionError, voiceSessionError } from '../model/voiceSessionError';
import { utf8Length, VOICE_RESPONSE_LIMIT, type VoiceSessionApi } from './voiceSessionApi';

// Upstream Message.content references object-only JsonNode, but its published examples use text/null.
// Keep that compatibility correction local to this transport boundary; generated types stay untouched.
type ToolCall = Omit<components['schemas']['ToolCall'], 'function'> & {
  function: { name: string; arguments: Record<string, unknown> };
};
type Message = Omit<components['schemas']['Message'], 'content' | 'tool_calls'> & {
  content?: string | null | Record<string, unknown>; tool_calls?: ToolCall[];
};
// OpenAI-compatible wire messages also support app-owned system instructions;
// keep that role outside the provider/user conversation ledger.
type WireMessage = Omit<Message, 'tool_calls' | 'role'> & { role: Message['role'] | 'system'; tool_calls?: Array<Omit<ToolCall, 'function'> & {
  function: { name: string; arguments: Record<string, unknown> | string };
}> };
// The server team confirmed the production proxy requires an app-selected model;
// the published AiChatRequest snapshot does not describe this field yet.
const AI_CHAT_MODEL = 'openai/gpt-oss-20b' as const;
type Request = Omit<components['schemas']['AiChatRequest'], 'messages'> & { messages: WireMessage[]; model: typeof AI_CHAT_MODEL };
type Delivery = { envelope: ProviderEnvelope; callId?: string };
const invalid = (): never => { throw new VoiceSessionError('INVALID_RESPONSE'); };
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
};
const exact = (value: Record<string, unknown>, fields: readonly string[]) => {
  if (Object.keys(value).some(key => !fields.includes(key))) invalid();
};
function chatResponse(decoded: unknown): { response: Record<string, unknown>; provider: boolean } {
  const outer = object(decoded);
  if (!Object.hasOwn(outer, 'choices')) {
    exact(outer, ['content', 'tool_calls']);
    return { response: outer, provider: false };
  }
  exact(outer, ['id', 'object', 'created', 'model', 'choices', 'usage', 'usage_breakdown', 'system_fingerprint', 'service_tier', 'x_groq']);
  if (outer.object !== 'chat.completion' || !Array.isArray(outer.choices) || outer.choices.length !== 1) return invalid();
  const choice = object(outer.choices[0]); exact(choice, ['index', 'message', 'finish_reason', 'logprobs']);
  if (choice.index !== 0 || !['stop', 'tool_calls'].includes(String(choice.finish_reason))) return invalid();
  const message = object(choice.message); exact(message, ['role', 'content', 'tool_calls', 'reasoning', 'refusal', 'annotations']);
  if (message.role !== 'assistant' || (message.refusal !== undefined && message.refusal !== null)) return invalid();
  return { response: { content: message.content, tool_calls: message.tool_calls }, provider: true };
}
let sessionSequence = 0;
let diagnosticSequence = 0;

// Diagnostics contain contract metadata only, never prompts, reasoning, credentials or argument values.
function chatLog(event: string, details: () => Record<string, unknown>) {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  try { console.debug(`[AI chat ${event}]`, JSON.stringify(details())); } catch { /* Logging must not affect delivery. */ }
}
const diagnosticObject = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
const diagnosticType = (value: unknown) => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
const diagnosticJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  if (utf8Length(value) > VOICE_RESPONSE_LIMIT) return undefined;
  try { return JSON.parse(value); } catch { return undefined; }
};
function diagnosticCall(value: unknown) {
  const call = diagnosticObject(value);
  const fn = diagnosticObject(call?.function) ?? call;
  const tool = AI_CHAT_TOOLS.find(item => item.function.name === fn?.name);
  const args = diagnosticObject(diagnosticJson(fn?.arguments));
  const properties: Record<string, Record<string, unknown> | undefined> = tool?.function.parameters.properties ?? {};
  const knownFields = new Set(['limit', ...AI_CHAT_TOOLS.flatMap(item => Object.keys(item.function.parameters.properties))]);
  const issues: string[] = [];
  if (!tool) issues.push('unregistered_tool');
  if (!args) issues.push('arguments_not_object');
  if (tool && args) {
    for (const key of tool.function.parameters.required) if (!Object.hasOwn(args, key)) issues.push(`${key}:required`);
    for (const [key, value] of Object.entries(args).slice(0, 32)) {
      const label = knownFields.has(key) ? key : '<unknown>';
      const schema = properties[key];
      if (!schema) { issues.push(`${label}:additional_property`); continue; }
      if (schema.type === 'integer' ? !Number.isSafeInteger(value) : diagnosticType(value) !== schema.type) issues.push(`${label}:type`);
      if (Array.isArray(schema.enum) && !schema.enum.includes(value)) issues.push(`${label}:enum`);
      if (typeof value === 'number') {
        if (typeof schema.minimum === 'number' && value < schema.minimum) issues.push(`${label}:minimum`);
        if (typeof schema.maximum === 'number' && value > schema.maximum) issues.push(`${label}:maximum`);
      }
      if (typeof value === 'string') {
        if (typeof schema.minLength === 'number' && value.length < schema.minLength) issues.push(`${label}:minLength`);
        if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) issues.push(`${label}:maxLength`);
        if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern).test(value)) issues.push(`${label}:pattern`);
      }
    }
  }
  return { name: tool?.function.name ?? '<unregistered>', argumentType: diagnosticType(fn?.arguments),
    fields: args ? Object.entries(args).slice(0, 32).map(([key, value]) => ({
      name: knownFields.has(key) ? key : '<unknown>', type: diagnosticType(value),
    })) : [], issues };
}
function diagnosticFailure(error: unknown) {
  const failure = toApiError(error);
  const body = diagnosticObject(diagnosticJson(failure.responseData));
  const detail = diagnosticObject(body?.error) ?? body;
  const safe = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9_.:-]{1,100}$/.test(value) ? value : undefined;
  const generation = detail?.failed_generation;
  let decoded = diagnosticJson(generation);
  if (typeof generation === 'string' && !decoded && generation.length <= VOICE_RESPONSE_LIMIT) {
    const tagged = /^\s*<function=([a-zA-Z0-9_]+)(?:>|\s+)\s*([\s\S]*?)\s*<\/function>\s*$/.exec(generation);
    if (tagged) decoded = { name: tagged[1], arguments: diagnosticJson(tagged[2]) };
  }
  const generated = diagnosticObject(decoded);
  const calls = Array.isArray(decoded) ? decoded : Array.isArray(generated?.tool_calls) ? generated.tool_calls : generated ? [generated] : [];
  return { status: failure.status ?? null, code: safe(detail?.code ?? failure.code), type: safe(detail?.type),
    traceId: safe(failure.traceId), hasFailedGeneration: generation !== undefined,
    generationParsed: calls.length > 0, calls: calls.slice(0, 8).map(diagnosticCall) };
}

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
  let providerWire = false;
  const reset = () => { revision++; history = []; queue = []; waiting = undefined; completed = undefined; needsFollowUp = false; providerWire = false; };
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
    const requestId = ++diagnosticSequence;
    const startedAt = Date.now();
    let stage = 'transport';
    const abort = () => aborter.abort(); signal.addEventListener('abort', abort, { once: true });
    try {
      // Keep canonical history internally; the live OpenAI-compatible proxy needs JSON strings.
      const conversation: WireMessage[] = providerWire ? messages.map(message => ({ ...message,
        ...(message.role === 'tool' ? { content: JSON.stringify(message.content) } : {}),
        ...(message.tool_calls?.length ? { tool_calls: message.tool_calls.map(call => ({ ...call,
          function: { ...call.function, arguments: JSON.stringify(call.function.arguments) },
        })) } : {}),
      })) : messages;
      // Attach once per request, outside conversation history, including tool follow-ups.
      const wireMessages: WireMessage[] = [{ role: 'system', content: AI_CHAT_SYSTEM_PROMPT }, ...conversation];
      chatLog('request', () => ({ requestId, route: '/ai/chat', model: AI_CHAT_MODEL, round: rounds,
        wireFormat: providerWire ? 'provider' : 'canonical',
        messages: wireMessages.map(message => ({ role: message.role, contentType: diagnosticType(message.content),
          toolCalls: message.tool_calls?.map(diagnosticCall) })),
        tools: AI_CHAT_TOOLS.map(tool => ({ name: tool.function.name, required: tool.function.parameters.required })),
      }));
      const raw = await client.post<unknown, Request>('/ai/chat', { model: AI_CHAT_MODEL, messages: wireMessages, tools: AI_CHAT_TOOLS }, {
        signal: aborter.signal, responseType: 'text', maxContentLength: VOICE_RESPONSE_LIMIT,
        onDownloadProgress: event => { if (event.loaded > VOICE_RESPONSE_LIMIT) { oversized = true; aborter.abort(); } },
      });
      requireCurrent(id, signal, captured);
      stage = 'response_size';
      if (oversized || (typeof raw === 'string' && utf8Length(raw) > VOICE_RESPONSE_LIMIT)) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
      if (typeof raw !== 'string') return invalid();
      stage = 'response_json';
      let decoded: unknown;
      try { decoded = JSON.parse(raw); } catch { return invalid(); }
      stage = 'response_envelope';
      const { response, provider } = chatResponse(decoded);
      chatLog('response', () => ({ requestId, elapsedMs: Date.now() - startedAt, format: provider ? 'provider' : 'canonical',
        contentType: diagnosticType(response.content), toolCalls: Array.isArray(response.tool_calls) ? response.tool_calls.slice(0, 8).map(diagnosticCall) : [],
      }));
      stage = 'response_content';
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
      stage = 'tool_validation';
      for (const rawCall of calls) {
        const call = object(rawCall); exact(call, ['id', 'type', 'function']);
        if (typeof call.id !== 'string' || !call.id.trim() || call.id.length > 128 || used.has(call.id) || call.type !== 'function') return invalid();
        used.add(call.id);
        const fn = object(call.function); exact(fn, ['name', 'arguments']);
        const tool = AI_CHAT_TOOLS.find(item => item.function.name === fn.name);
        if (!tool) return invalid();
        let argumentsValue = fn.arguments;
        if (provider) {
          if (typeof argumentsValue !== 'string') return invalid();
          try { argumentsValue = JSON.parse(argumentsValue); } catch { return invalid(); }
        }
        const args = object(argumentsValue);
        if (Object.keys(args).some(key => !Object.hasOwn(tool.function.parameters.properties, key))) return invalid();
        const parsed = parseVoiceAssistantEnvelope({ schemaVersion: 1, id: `chat-${++sequence}`, kind: 'command_request', command: fn.name,
          args: fn.name === 'searchNearbyPlaces' ? { ...args, limit: 3, useCurrentLocation: true } : args });
        if (!parsed.ok || parsed.value.kind !== 'command_request') return invalid();
        deliveries.push({ envelope: parsed.value, callId: call.id });
        wireCalls.push({ id: call.id, type: 'function', function: { name: tool.function.name, arguments: args } });
      }
      if (!deliveries.length) return invalid();
      providerWire = provider;
      history = [...messages, { role: 'assistant', content: content ?? null, tool_calls: wireCalls }];
      queue = deliveries; needsFollowUp = wireCalls.length > 0;
      return dequeue()!;
    } catch (error) {
      chatLog('failure', () => ({ requestId, elapsedMs: Date.now() - startedAt, stage,
        canceled: signal.aborted || captured !== revision, oversized, ...diagnosticFailure(error),
      }));
      if (oversized) throw new VoiceSessionError('RESPONSE_TOO_LARGE');
      if (signal.aborted || captured !== revision) throw new VoiceSessionError('CANCELED');
      // A rejected HTTP request is distinct from a successful response failing our parser.
      // Keep the classification local to chat and discard provider bodies entirely.
      const status = toApiError(error).status;
      if (status === 400 || status === 422) throw new VoiceSessionError('REQUEST_REJECTED');
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
