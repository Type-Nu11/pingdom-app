import { createAiChatSessionApi } from '../aiChatSessionApi';
import { createVoiceSessionController } from '../../model/voiceSession';
import { ApiError, createApiClient, type ApiTransport } from '../../../../shared/api';
import { AI_CHAT_SYSTEM_PROMPT, AI_CHAT_TOOLS } from '../../model/aiChatTools';
import { voiceSessionErrors } from '../../i18n/voiceSessionErrors';
import type { AppCommandResult } from '../../model/voiceAssistantCommand.types';

const call = (name = 'searchNearbyPlaces', args: unknown = { keyword: '갈비탕' }, id = 'call_1') => ({ id, type: 'function', function: { name, arguments: args } });
const completion = (message: unknown, finishReason = 'stop') => ({ id: 'completion-1', object: 'chat.completion', model: 'openai/gpt-oss-20b',
  usage: {}, usage_breakdown: null, system_fingerprint: 'provider-fingerprint', x_groq: {}, service_tier: 'on_demand',
  choices: [{ index: 0, message, finish_reason: finishReason }] });
const replies = (responses: unknown[]) => {
  const requests: { path: string; body: any }[] = [];
  const post = async (path: string, body: unknown) => { requests.push({ path, body }); return { data: JSON.stringify(responses.shift()) }; };
  return { requests, api: createAiChatSessionApi(createApiClient({ post } as unknown as ApiTransport)) };
};
const result = (commandId: string): AppCommandResult => ({ schemaVersion: 1, id: 'result-1', source: 'app', kind: 'command_result', commandId,
  command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places', places: [] } } });

test.each(['date', 'quantity'])('structured reservation question opens the %s picker and waits for the user', async field => {
  const x = replies([
    completion({ role: 'assistant', content: '날짜, 인원, 시작·종료 시간을 모두 알려주세요.', tool_calls: [call('requestReservationDetails', JSON.stringify({ field }))] }, 'tool_calls'),
    completion({ role: 'assistant', content: '선택을 받았습니다.' }),
  ]);
  const consume = jest.fn(); const c = createVoiceSessionController(consume, x.api);
  try {
    await c.start(); await c.send('용짬뽕 예약하려고 하는데');
    expect(c.getSnapshot().error).toBeNull();
    expect(consume).toHaveBeenCalledTimes(1);
    expect(consume.mock.calls[0][0]).toMatchObject({ kind: 'clarification_request', field });
    expect(x.requests).toHaveLength(1);
    await c.send('2026-10-15');
    const history = x.requests[1].body.messages;
    const tool = history.find((m: any) => m.role === 'tool');
    expect(tool.tool_call_id).toBe('call_1');
    expect(JSON.parse(tool.content)).toEqual({ status: 'awaiting_user', field });
    expect(c.getSnapshot().error).toBeNull();
  } finally { c.dispose(); }
});

test.each([{ field: 'timeRange' }, { field: 'payment' }, { field: 'date', placeId: 70095 }, {}])('invalid UI tool arguments cannot open a picker %#', async args => {
  const x = replies([completion({ role: 'assistant', content: null, tool_calls: [call('requestReservationDetails', JSON.stringify(args))] }, 'tool_calls')]);
  const consume = jest.fn(); const c = createVoiceSessionController(consume, x.api);
  try { await c.start(); await c.send('예약'); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); expect(consume).not.toHaveBeenCalled(); }
  finally { c.dispose(); }
});

test('live completion replies show only assistant content and serialize tool history for the provider', async () => {
  const x = replies([
    completion({ role: 'assistant', content: '안녕하세요.', reasoning: 'private reasoning' }),
    completion({ role: 'assistant', content: null, tool_calls: [call('searchNearbyPlaces', '{"keyword":"갈비탕"}')] }, 'tool_calls'),
    completion({ role: 'assistant', content: '검색 결과가 없습니다.' }),
  ]);
  const answers: string[] = []; const commands: string[] = [];
  const c = createVoiceSessionController(e => {
    if (e.kind === 'assistant_message') answers.push(e.text);
    if (e.kind === 'command_request') { commands.push(e.command); x.api.recordResult(result(e.id)); }
  }, x.api);
  try {
    await c.start(); await c.send('Hello'); await c.send('갈비탕집 있어?');
    expect(c.getSnapshot().error).toBeNull();
    expect(answers).toEqual(['안녕하세요.', '검색 결과가 없습니다.']);
    expect(commands).toEqual(['searchNearbyPlaces']);
    expect(x.requests).toHaveLength(3);
    const history = x.requests[2].body.messages;
    const assistant = history.find((m: any) => m.tool_calls?.length);
    expect(assistant.tool_calls[0].function.arguments).toBe('{"keyword":"갈비탕"}');
    const tool = history.find((m: any) => m.role === 'tool');
    expect(tool.tool_call_id).toBe('call_1');
    expect(JSON.parse(tool.content)).toEqual(result('unused').outcome);
    expect(JSON.stringify(history)).not.toContain('private reasoning');
    for (const request of x.requests) {
      expect(request.body.model).toBe('openai/gpt-oss-20b');
      expect(request.body.messages[0]).toEqual({ role: 'system', content: AI_CHAT_SYSTEM_PROMPT });
      expect(request.body.messages.filter((message: any) => message.role === 'system')).toHaveLength(1);
    }
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('Respond in Korean');
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('Do not generate Markdown tables or HTML tables');
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('1 to 3 short sentences');
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('Never mention internal tool names');
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('Do not repeat place information');
    expect(AI_CHAT_SYSTEM_PROMPT).toContain('Do not claim a search succeeded if the tool returned an error');
  } finally { c.dispose(); }
});

test.each([
  completion({ role: 'assistant', content: 'truncated' }, 'length'),
  completion({ role: 'user', content: 'wrong role' }),
  completion({ role: 'assistant', content: null, tool_calls: [call('searchNearbyPlaces', '{invalid JSON')] }, 'tool_calls'),
  completion({ role: 'assistant', content: null, tool_calls: [call('createReservation', '{}')] }, 'tool_calls'),
  { ...completion({ role: 'assistant', content: 'ambiguous' }), choices: [
    { index: 0, message: { role: 'assistant', content: 'first' }, finish_reason: 'stop' },
    { index: 1, message: { role: 'assistant', content: 'second' }, finish_reason: 'stop' },
  ] },
])('invalid provider completions never publish or execute %#', async response => {
  const x = replies([response]); const handle = jest.fn();
  const c = createVoiceSessionController(handle, x.api);
  try { await c.start(); await c.send('검색'); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); expect(handle).not.toHaveBeenCalled(); }
  finally { c.dispose(); }
});

test.each(['searchNearbyPlaces', 'searchNearbyReservablePlaces'])('%s category schema supports the server typed-value validator', name => {
  const tool = AI_CHAT_TOOLS.find(item => item.function.name === name)!;
  const category = (tool.function.parameters.properties as Record<string, { type?: string; enum?: string[] }>).touristCategory;
  // AiChatService.validValue rejects an enum-only schema because it branches on type.
  expect(category.type).toBe('string');
  expect(category.enum).toContain('FOOD');
});

test.each([400, 422])('HTTP %s rejection is distinct from malformed AI output and never leaks its body', async status => {
  const post = jest.fn(async () => { throw new ApiError('model : property model is missing', {
    status, responseBody: { error: { message: 'private-provider-body' } },
  }); });
  const api = createAiChatSessionApi(createApiClient({ post } as unknown as ApiTransport));
  const handle = jest.fn(); const c = createVoiceSessionController(handle, api);
  try {
    await c.start(); await c.send('Hello');
    expect(c.getSnapshot().error).toBe('REQUEST_REJECTED');
    expect(handle).not.toHaveBeenCalled();
    await expect(c.retry()).rejects.toThrow('RETRY_UNAVAILABLE');
    expect(post).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(c.getSnapshot())).not.toMatch(/model|private-provider-body/);
    for (const messages of Object.values(voiceSessionErrors)) {
      expect((messages as Record<string, string>).REQUEST_REJECTED).toEqual(expect.any(String));
      expect((messages as Record<string, string>).REQUEST_REJECTED).not.toBe(messages.INVALID_RESPONSE);
    }
  } finally { c.dispose(); }
});

test('keyword search and its app result return through /ai/chat with matching IDs and conversation history', async () => {
  const x = replies([{ content: null, tool_calls: [call()] }, { content: '검색 결과가 없습니다.', tool_calls: [] }, { content: '다른 음식을 찾아볼까요?', tool_calls: [] }]);
  const seen: string[] = [];
  const controller = createVoiceSessionController(async envelope => {
    seen.push(envelope.kind);
    if (envelope.kind === 'command_request') { expect(envelope.args).toEqual({ keyword: '갈비탕', limit: 3, useCurrentLocation: true }); x.api.recordResult(result(envelope.id)); }
  }, x.api);
  try {
    await controller.start(); await controller.send('갈비탕집 있어?');
    expect(controller.getSnapshot().error).toBeNull();
    expect(seen).toEqual(['command_request', 'assistant_message']);
    expect(x.requests.map(r => r.path)).toEqual(['/ai/chat', '/ai/chat']);
    expect(x.requests[0].body.messages.slice(1)).toEqual([{ role: 'user', content: '갈비탕집 있어?' }]);
    expect(x.requests[1].body.messages[2]).toMatchObject({ role: 'assistant', tool_calls: [{ id: 'call_1' }] });
    expect(x.requests[1].body.messages[3]).toEqual({ role: 'tool', tool_call_id: 'call_1', content: { status: 'succeeded', data: { coverage: 'nearest_places', places: [] } } });
    await controller.send('다른 음식은?');
    expect(x.requests[2].body.messages.slice(-2)).toEqual([{ role: 'assistant', content: '검색 결과가 없습니다.', tool_calls: [] }, { role: 'user', content: '다른 음식은?' }]);
    for (const request of x.requests) expect(request.body.model).toBe('openai/gpt-oss-20b');
  } finally { controller.dispose(); }
});

test.each([call('createReservation'), call('searchNearbyPlaces', { latitude: 37 }), call('searchNearbyPlaces', { limit: 4 }), call('getPlaceDetails', { placeId: -1 })])('invalid tool calls never reach execution %#', async invalid => {
  const x = replies([{ content: null, tool_calls: [invalid] }]); const seen: string[] = [];
  const c = createVoiceSessionController(e => { seen.push(e.kind); }, x.api);
  try { await c.start(); await c.send('검색'); expect(seen).toEqual([]); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); }
  finally { c.dispose(); }
});

test('validates every call before executing a mixed valid/invalid batch', async () => {
  const x = replies([{ content: null, tool_calls: [call(), call('pay', {}, 'call_2')] }]);
  const seen: string[] = []; const c = createVoiceSessionController(e => { seen.push(e.kind); }, x.api);
  try { await c.start(); await c.send('검색'); expect(seen).toEqual([]); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); }
  finally { c.dispose(); }
});

test('multiple calls send all app results before one follow-up model request', async () => {
  const x = replies([{ content: '찾아보겠습니다.', tool_calls: [call(), call('searchNearbyPlaces', {}, 'call_2')] }, { content: '완료', tool_calls: [] }]);
  const c = createVoiceSessionController(e => { if (e.kind === 'command_request') x.api.recordResult(result(e.id)); }, x.api);
  try {
    await c.start(); await c.send('주변 검색'); expect(c.getSnapshot().error).toBeNull();
    expect(x.requests).toHaveLength(2);
    expect(x.requests[1].body.messages.filter((m: any) => m.role === 'tool').map((m: any) => m.tool_call_id)).toEqual(['call_1', 'call_2']);
  } finally { c.dispose(); }
});

test('cancel clears conversation and suppresses a late chat response', async () => {
  let resolve!: (v: unknown) => void;
  let started!: () => void; const ready = new Promise<void>(yes => { started = yes; });
  const post = () => new Promise(resolvePromise => { resolve = v => resolvePromise({ data: JSON.stringify(v) }); started(); });
  const api = createAiChatSessionApi(createApiClient({ post } as unknown as ApiTransport));
  const seen: string[] = []; const c = createVoiceSessionController(e => { seen.push(e.kind); }, api);
  try { await c.start(); const pending = c.send('검색'); await ready; c.cancel(); resolve({ content: '늦은 응답', tool_calls: [] }); await pending; expect(seen).toEqual([]); }
  finally { c.dispose(); }
});

test.each([
  { content: null, tool_calls: [] },
  { content: '답변', route: '/pay' },
  { content: '가'.repeat(2001), tool_calls: [] },
  { content: null, tool_calls: [call(), call('searchNearbyPlaces', {}, 'call_1')] },
  { content: null, tool_calls: [call('searchNearbyPlaces', '{"keyword":"갈비탕"}')] },
])('malformed responses cannot publish a partial answer or execute tools %#', async response => {
  const x = replies([response]); const seen: string[] = [];
  const c = createVoiceSessionController(e => { seen.push(e.kind); }, x.api);
  try { await c.start(); await c.send('검색'); expect(seen).toEqual([]); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); }
  finally { c.dispose(); }
});

test('repeated provider call IDs never execute twice across follow-up responses', async () => {
  const x = replies([{ content: null, tool_calls: [call()] }, { content: null, tool_calls: [call()] }]);
  const seen: string[] = [];
  const c = createVoiceSessionController(e => { if (e.kind === 'command_request') { seen.push(e.id); x.api.recordResult(result(e.id)); } }, x.api);
  try { await c.start(); await c.send('검색'); expect(seen).toHaveLength(1); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); }
  finally { c.dispose(); }
});

test('a model that keeps requesting tools is stopped after four exchanges', async () => {
  const x = replies([1, 2, 3, 4, 5].map(i => ({ content: null, tool_calls: [call('searchNearbyPlaces', {}, `call_${i}`)] })));
  const seen: string[] = [];
  const c = createVoiceSessionController(e => { if (e.kind === 'command_request') { seen.push(e.id); x.api.recordResult(result(e.id)); } }, x.api);
  try { await c.start(); await c.send('검색'); expect(seen).toHaveLength(4); expect(x.requests).toHaveLength(4); expect(c.getSnapshot().error).toBe('LEDGER_FULL'); }
  finally { c.dispose(); }
});

test('closing chat drops old dialogue before the next session', async () => {
  const x = replies([{ content: '첫 답변', tool_calls: [] }, { content: '새 답변', tool_calls: [] }]);
  const c = createVoiceSessionController(() => {}, x.api);
  try {
    await c.start(); await c.send('첫 질문'); await c.close(); await c.start(); await c.send('새 질문');
    expect(x.requests[1].body.messages).toEqual([{ role: 'system', content: AI_CHAT_SYSTEM_PROMPT }, { role: 'user', content: '새 질문' }]);
  } finally { c.dispose(); }
});

test('chat diagnostics identify failed tool fields without leaking prompts, reasoning or argument values', async () => {
  const log = jest.spyOn(console, 'debug').mockImplementation(() => {});
  const api = createAiChatSessionApi(createApiClient({ post: async () => { throw new ApiError('PRIVATE_ERROR', {
    status: 400, traceId: 'qa-trace-1', responseData: { error: {
      code: 'tool_use_failed', type: 'invalid_request_error', message: 'PRIVATE_REASONING',
      failed_generation: JSON.stringify({ name: 'searchNearbyPlaces', arguments: {
        keyword: 'PRIVATE_KEYWORD', limit: 'PRIVATE_TOKEN', touristCategory: 'PRIVATE_CATEGORY',
        useCurrentLocation: true, PRIVATE_FIELD: 'PRIVATE_VALUE',
      } }),
    } },
  }); } } as unknown as ApiTransport));
  const signal = new AbortController().signal;
  try {
    const session = await api.create(signal);
    await expect(api.send(session.sessionId, { text: 'PRIVATE_PROMPT', requestId: 'qa-request-1' }, signal)).rejects.toMatchObject({ code: 'REQUEST_REJECTED' });
    const logs = log.mock.calls;
    const request = JSON.parse(String(logs.find(call => call[0] === '[AI chat request]')![1]));
    const failure = JSON.parse(String(logs.find(call => call[0] === '[AI chat failure]')![1]));
    expect(failure.requestId).toBe(request.requestId);
    expect(failure).toMatchObject({ status: 400, code: 'tool_use_failed', stage: 'transport', traceId: 'qa-trace-1', generationParsed: true });
    expect(failure.calls[0].issues).toEqual(expect.arrayContaining([
      'limit:additional_property', 'touristCategory:enum', 'useCurrentLocation:additional_property', '<unknown>:additional_property',
    ]));
    expect(JSON.stringify(logs)).not.toContain('PRIVATE_');
  } finally { log.mockRestore(); }
});

test('production chat never emits diagnostic logs', async () => {
  const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
  const previous = runtime.__DEV__;
  const log = jest.spyOn(console, 'debug').mockImplementation(() => {});
  runtime.__DEV__ = false;
  const x = replies([completion({ role: 'assistant', content: 'PRIVATE_ANSWER', reasoning: 'PRIVATE_REASONING' })]);
  const signal = new AbortController().signal;
  try {
    const session = await x.api.create(signal);
    await x.api.send(session.sessionId, { text: 'PRIVATE_PROMPT', requestId: 'qa-request-1' }, signal);
    expect(log).not.toHaveBeenCalled();
  } finally { runtime.__DEV__ = previous; log.mockRestore(); }
});
