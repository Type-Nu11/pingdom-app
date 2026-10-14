import { createAiChatSessionApi } from '../aiChatSessionApi';
import { createVoiceSessionController } from '../../model/voiceSession';
import { createApiClient, type ApiTransport } from '../../../../shared/api';
import { AI_CHAT_SYSTEM_PROMPT, AI_CHAT_TOOLS } from '../../model/aiChatTools';
import type { AppCommandResult } from '../../model/voiceAssistantCommand.types';

const message = (content: unknown[], stop_reason = 'end_turn') => ({ type: 'message', id: 'msg_test', role: 'assistant',
  model: 'claude-haiku-5-5', content, stop_reason, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } });
const tool = (id: string, input: unknown = { keyword: '용짬뽕' }) => ({ type: 'tool_use', id, name: 'searchNearbyPlaces', input, caller: { type: 'direct' } });
function setup(responses: unknown[]) {
  const requests: any[] = [];
  const api = createAiChatSessionApi(createApiClient({ post: async (_path: string, body: unknown) => {
    requests.push(body); return { data: JSON.stringify(responses.shift()) };
  } } as unknown as ApiTransport));
  return { api, requests };
}
const outcome = (id: string, failed = false): AppCommandResult => ({ schemaVersion: 1, id: 'public-result', source: 'app',
  kind: 'command_result', commandId: id, command: 'searchNearbyPlaces', outcome: failed ? { status: 'rejected', code: 'NETWORK_ERROR' }
    : { status: 'succeeded', data: { coverage: 'nearest_places', places: [] } } });

test('native Claude request uses top-level system, output cap and input_schema without OpenAI fields', async () => {
  const x = setup([message([{ type: 'text', text: '안녕하세요.' }])]);
  const consume = jest.fn(), c = createVoiceSessionController(consume, x.api);
  try {
    await c.start(); await c.send('Hello');
    expect(c.getSnapshot().error).toBeNull();
    expect(consume.mock.calls[0][0]).toMatchObject({ kind: 'assistant_message', text: '안녕하세요.' });
    expect(x.requests[0]).toMatchObject({ model: 'claude-haiku-5-5', system: AI_CHAT_SYSTEM_PROMPT, max_tokens: expect.any(Number),
      messages: [{ role: 'user', content: 'Hello' }], tools: AI_CHAT_TOOLS.map(({ function: f }) => ({ name: f.name, description: f.description, input_schema: f.parameters })) });
    expect(x.requests[0].tools.every((t: any) => !('function' in t) && !('type' in t))).toBe(true);
  } finally { c.dispose(); }
});

test('native multi-tool batch preserves signed thinking and sends grouped public results with error flags', async () => {
  const log = jest.spyOn(console, 'debug').mockImplementation(() => {});
  const blocks = [{ type: 'thinking', thinking: 'PRIVATE_REASONING', signature: 'PRIVATE_SIGNATURE' },
    { type: 'redacted_thinking', data: 'PRIVATE_REDACTED' }, tool('toolu_1'), tool('toolu_2', { category: 'RESTAURANT' })];
  const x = setup([message(blocks, 'tool_use'), message([{ type: 'text', text: '조회 결과를 확인해 주세요.' }])]);
  const consume = jest.fn(e => { if (e.kind === 'command_request') x.api.recordResult(outcome(e.id, consume.mock.calls.length === 2)); });
  const c = createVoiceSessionController(consume, x.api);
  try {
    await c.start(); await c.send('검색');
    expect(c.getSnapshot().error).toBeNull();
    expect(x.requests).toHaveLength(2);
    expect(x.requests[1].messages[1]).toEqual({ role: 'assistant', content: blocks });
    expect(x.requests[1].messages[2]).toMatchObject({ role: 'user', content: [
      { type: 'tool_result', tool_use_id: 'toolu_1', is_error: false }, { type: 'tool_result', tool_use_id: 'toolu_2', is_error: true },
    ] });
    expect(JSON.parse(x.requests[1].messages[2].content[1].content)).toEqual({ status: 'rejected', code: 'NETWORK_ERROR' });
    expect(consume.mock.calls.map(([e]) => e.kind)).toEqual(['command_request', 'command_request', 'assistant_message']);
    expect(JSON.stringify(consume.mock.calls)).not.toContain('PRIVATE_');
    expect(JSON.stringify(log.mock.calls)).not.toContain('PRIVATE_');
  } finally { c.dispose(); log.mockRestore(); }
});

test('UI question tool waits for human selection and places its result before the next user text', async () => {
  const x = setup([message([{ type: 'tool_use', id: 'question', name: 'requestReservationDetails', input: { field: 'date' } }], 'tool_use'),
    message([{ type: 'text', text: '날짜를 선택하셨습니다.' }])]);
  const c = createVoiceSessionController(() => {}, x.api);
  try {
    await c.start(); await c.send('예약'); expect(x.requests).toHaveLength(1);
    await c.send('2026-10-24');
    expect(c.getSnapshot().error).toBeNull();
    expect(x.requests[1].messages[2]).toEqual({ role: 'user', content: [
      { type: 'tool_result', tool_use_id: 'question', content: JSON.stringify({ status: 'awaiting_user', field: 'date' }), is_error: false },
      { type: 'text', text: '2026-10-24' },
    ] });
  } finally { c.dispose(); }
});

test.each([
  message([tool('duplicate'), tool('duplicate')], 'tool_use'),
  message([tool('valid'), { type: 'tool_use', id: 'unsafe', name: 'createReservation', input: {} }], 'tool_use'),
  message([tool('invalid', '{"keyword":"string instead of object"}')], 'tool_use'),
  message([tool('truncated')], 'max_tokens'),
  message([tool('wrong-stop')], 'end_turn'),
  message([{ ...tool('indirect'), caller: { type: 'code_execution_20250825', tool_id: 'unregistered' } }], 'tool_use'),
  message([{ type: 'text', text: 'partial' }, { type: 'unknown_block' }]),
])('invalid native batches never publish partial answers or execute tools %#', async response => {
  const x = setup([response]), consume = jest.fn(), c = createVoiceSessionController(consume, x.api);
  try { await c.start(); await c.send('검색'); expect(c.getSnapshot().error).toBe('INVALID_RESPONSE'); expect(consume).not.toHaveBeenCalled(); }
  finally { c.dispose(); }
});
