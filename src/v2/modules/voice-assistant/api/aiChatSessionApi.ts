import { apiClient, toApiError, type ApiClient } from '../../../shared/api';
import { isProviderCredentialFailure } from '../../../shared/api/providerAuthentication';
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
  nativeContent?: Record<string, unknown>[];
};
// The proxy now forwards Anthropic Messages. Keep provider wire types local;
// the published OpenAI-shaped snapshot still describes the previous contract.
const AI_CHAT_MODEL = 'claude-haiku-5-5' as const;
type NativeMessage = { role: 'user' | 'assistant'; content: string | Record<string, unknown>[] };
type Request = { model: typeof AI_CHAT_MODEL; max_tokens: number; system: string; messages: NativeMessage[];
  tools: { name: string; description: string; input_schema: Record<string, unknown> }[] };
type Delivery = { envelope: ProviderEnvelope; callId?: string };
const invalid = (): never => { throw new VoiceSessionError('INVALID_RESPONSE'); };
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
};
const exact = (value: Record<string, unknown>, fields: readonly string[]) => {
  if (Object.keys(value).some(key => !fields.includes(key))) invalid();
};
function nativeMessages(messages: Message[]): NativeMessage[] {
  const result: NativeMessage[] = [];
  const blocks = (content: NativeMessage['content']) => typeof content === 'string' ? [{ type: 'text', text: content }] : content;
  for (const message of messages) {
    let next: NativeMessage;
    if (message.role === 'tool') {
      next = { role: 'user', content: [{ type: 'tool_result', tool_use_id: message.tool_call_id,
        content: JSON.stringify(message.content), is_error: (message.content as { status?: string } | undefined)?.status === 'rejected' }] };
    } else if (message.role === 'assistant') {
      next = { role: 'assistant', content: message.nativeContent ?? [
        ...(typeof message.content === 'string' && message.content ? [{ type: 'text', text: message.content }] : []),
        ...(message.tool_calls ?? []).map(call => ({ type: 'tool_use', id: call.id, name: call.function.name, input: call.function.arguments })),
      ] };
    } else {
      if (message.role !== 'user' || typeof message.content !== 'string') return invalid();
      next = { role: 'user', content: message.content };
    }
    const previous = result.at(-1);
    // All results in a batch precede the next user text in one user message.
    if (previous?.role === next.role) previous.content = [...blocks(previous.content), ...blocks(next.content)];
    else result.push(next);
  }
  return result;
}
function chatResponse(decoded: unknown): { response: Record<string, unknown>; provider: boolean; nativeContent?: Record<string, unknown>[] } {
  const outer = object(decoded);
  if (outer.type === 'message') {
    if (outer.role !== 'assistant' || !Array.isArray(outer.content) || outer.content.length > 32
      || !['end_turn', 'tool_use'].includes(String(outer.stop_reason))) return invalid();
    const text: string[] = [], calls: Record<string, unknown>[] = [], nativeContent: Record<string, unknown>[] = [];
    for (const raw of outer.content) {
      const block = object(raw);
      if (block.type === 'text') {
        exact(block, ['type', 'text', 'citations']);
        if (typeof block.text !== 'string') return invalid();
        text.push(block.text);
      } else if (block.type === 'tool_use') {
        exact(block, ['type', 'id', 'name', 'input', 'caller']);
        if (block.caller !== undefined) {
          const caller = object(block.caller); exact(caller, ['type']);
          if (caller.type !== 'direct') return invalid();
        }
        const input = object(block.input);
        calls.push({ id: block.id, type: 'function', function: { name: block.name, arguments: JSON.stringify(input) } });
      } else if (block.type === 'thinking') {
        exact(block, ['type', 'thinking', 'signature']);
        if (typeof block.thinking !== 'string' || typeof block.signature !== 'string' || !block.signature) return invalid();
      } else if (block.type === 'redacted_thinking') {
        exact(block, ['type', 'data']);
        if (typeof block.data !== 'string') return invalid();
      } else return invalid();
      // Preserve signed blocks in memory for follow-ups, never in public deliveries or logs.
      nativeContent.push(block);
    }
    if ((outer.stop_reason === 'tool_use') !== (calls.length > 0)) return invalid();
    return { response: { content: text.join('\n') || null, tool_calls: calls }, provider: true, nativeContent };
  }
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
  const safe = (value: unknown, allowed: readonly string[]) => typeof value === 'string' && allowed.includes(value) ? value : undefined;
  const generation = detail?.failed_generation;
  let decoded = diagnosticJson(generation);
  if (typeof generation === 'string' && !decoded && generation.length <= VOICE_RESPONSE_LIMIT) {
    const tagged = /^\s*<function=([a-zA-Z0-9_]+)(?:>|\s+)\s*([\s\S]*?)\s*<\/function>\s*$/.exec(generation);
    if (tagged) decoded = { name: tagged[1], arguments: diagnosticJson(tagged[2]) };
  }
  const generated = diagnosticObject(decoded);
  const calls = Array.isArray(decoded) ? decoded : Array.isArray(generated?.tool_calls) ? generated.tool_calls : generated ? [generated] : [];
  return { status: failure.status ?? null,
    code: safe(detail?.code ?? failure.code, ['tool_use_failed', 'rate_limit_exceeded', 'invalid_api_key']) ?? voiceSessionError(error).code,
    type: safe(detail?.type, ['invalid_request_error', 'authentication_error', 'permission_error', 'rate_limit_error', 'api_error', 'overloaded_error']),
    hasFailedGeneration: generation !== undefined,
    generationParsed: calls.length > 0, calls: calls.slice(0, 8).map(diagnosticCall) };
}

/** Stateless server chat; this adapter owns only bounded, account-scoped in-memory history. */
export function createAiChatSessionApi(client: ApiClient = apiClient, context?: () => { language: string; selectedPlaceId?: number; timezone?: string }): VoiceSessionApi & {
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
    const requestId = ++diagnosticSequence;
    const startedAt = Date.now();
    let stage = 'transport';
    const abort = () => aborter.abort(); signal.addEventListener('abort', abort, { once: true });
    try {
      const wireMessages = nativeMessages(messages);
      const appContext = context?.();
      const timezone = appContext?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date(Date.now());
      const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(now).map(part => [part.type, part.value]));
      const localDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
      const timeContext = `\nCurrent UTC instant: ${now.toISOString()}.\nApp timezone: ${timezone}.\nCurrent local date: ${localDate}.\nResolve today, tomorrow, and dates without a year from this app-provided clock. Never invent a year or silently use a past date.`;
      const system = AI_CHAT_SYSTEM_PROMPT + timeContext + (appContext ? `\nApp-selected language: ${appContext.language}. Respond in this language.\nVerified currently selected place ID: ${appContext.selectedPlaceId ?? 'none'}.` : '');
      const request: Request = { model: AI_CHAT_MODEL, max_tokens: 2048, system,
        messages: wireMessages, tools: AI_CHAT_TOOLS.map(({ function: f }) => ({
          name: f.name, description: f.description, input_schema: f.parameters,
        })) };
      chatLog('request', () => ({ requestId, route: '/ai/chat', model: AI_CHAT_MODEL, round: rounds,
        wireFormat: 'anthropic', maxTokens: request.max_tokens,
        messages: wireMessages.map(message => ({ role: message.role, contentType: diagnosticType(message.content),
          blockTypes: Array.isArray(message.content) ? message.content.map(block => block.type) : undefined })),
        tools: AI_CHAT_TOOLS.map(tool => ({ name: tool.function.name, required: tool.function.parameters.required })),
      }));
      const raw = await client.post<unknown, Request>('/ai/chat', request, {
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
      const { response, provider, nativeContent } = chatResponse(decoded);
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
      for (const [index, rawCall] of calls.entries()) {
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
        if (fn.name === 'navigateToPage') {
          // Navigation ends this presentation: only one final navigation per tool batch.
          if (index !== calls.length - 1) return invalid();
          for (let i = deliveries.length - 1; i >= 0; i--) if (deliveries[i].envelope.kind === 'assistant_message') deliveries.splice(i, 1);
        }
        if (fn.name === 'requestReservationDetails') {
          if (index !== calls.length - 1 || Object.keys(args).length !== 1 || !['date', 'quantity'].includes(String(args.field))) return invalid();
          const parsed = parseVoiceAssistantEnvelope({ schemaVersion: 1, id: `chat-${++sequence}`, kind: 'clarification_request',
            field: args.field, text: '예약 조건을 선택해 주세요.' });
          if (!parsed.ok || parsed.value.kind !== 'clarification_request') return invalid();
          // The app owns the question and picker. Provider prose must not duplicate that question.
          for (let i = deliveries.length - 1; i >= 0; i--) if (deliveries[i].envelope.kind === 'assistant_message') deliveries.splice(i, 1);
          deliveries.push({ envelope: parsed.value, callId: call.id });
          wireCalls.push({ id: call.id, type: 'function', function: { name: tool.function.name, arguments: args } });
          continue;
        }
        const parsed = parseVoiceAssistantEnvelope({ schemaVersion: 1, id: `chat-${++sequence}`, kind: 'command_request', command: fn.name,
          args: fn.name === 'searchNearbyPlaces' ? { ...args, limit: 3, useCurrentLocation: true } : args });
        if (!parsed.ok || parsed.value.kind !== 'command_request') return invalid();
        deliveries.push({ envelope: parsed.value, callId: call.id });
        wireCalls.push({ id: call.id, type: 'function', function: { name: tool.function.name, arguments: args } });
      }
      if (!deliveries.length) return invalid();
      history = [...messages, { role: 'assistant', content: content ?? null, tool_calls: wireCalls,
        ...(nativeContent ? { nativeContent } : {}) }];
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
      const failure = toApiError(error);
      const status = failure.status;
      if (status === 401 && isProviderCredentialFailure(failure.responseData)) {
        throw new VoiceSessionError('PROVIDER_UNAVAILABLE');
      }
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
        if (waiting.envelope.kind === 'clarification_request') {
          // Complete the wire pair without another model round: this tool waits for human input.
          history = [...history, { role: 'tool', tool_call_id: waiting.callId,
            content: { status: 'awaiting_user', field: waiting.envelope.field } }];
          waiting = undefined; needsFollowUp = false;
          return undefined;
        }
        if (!completed) throw new VoiceSessionError('DELIVERY_FAILED');
        // Only executor-projected public facts go to the model; no bearer, quote token, or reservation body.
        history = [...history, { role: 'tool', tool_call_id: waiting.callId, content: completed.outcome }];
        if (completed.command === 'navigateToPage' && completed.outcome.status === 'succeeded') needsFollowUp = false;
      }
      waiting = undefined; completed = undefined;
      if (queue.length) return dequeue();
      if (!needsFollowUp) return undefined;
      needsFollowUp = false;
      return exchange(history, id, signal);
    },
  };
}
