import { createVoiceSessionController, VOICE_LEDGER_LIMIT, type VoiceDeliveryContext } from '../voiceSession';
import { createVoiceSessionApi, decodeVoiceFinal, utf8Length } from '../../api/voiceSessionApi';
import { ApiError, createApiClient, configureApiAccessTokenProvider, type ApiClient, type ApiTransport } from '../../../../shared/api';
import { voiceSessionError } from '../voiceSessionError';
import type { ProviderEnvelope } from '../voiceAssistantCommand.types';

const envelope = (id = 'one'): ProviderEnvelope => ({ schemaVersion: 1, id, kind: 'assistant_message', text: '안내' });
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; };
function setup(consumer = jest.fn()) {
  const api = {
    create: jest.fn().mockResolvedValue({ sessionId: 's', expiresAt: '2026-09-17T12:00:00' }),
    refresh: jest.fn().mockResolvedValue({ sessionId: 's', expiresAt: '2026-09-17T12:05:00' }),
    close: jest.fn().mockResolvedValue(undefined), send: jest.fn().mockResolvedValue(envelope()),
  };
  return { api, consumer, controller: createVoiceSessionController(consumer, api) };
}
afterEach(() => jest.useRealTimers());

test('create, explicit refresh and close; expiresAt remains opaque', async () => {
  const { controller, api } = setup();
  await controller.start(); expect(controller.getSnapshot().phase).toBe('ready');
  await controller.refresh(); expect(controller.getSession()?.expiresAt).toBe('2026-09-17T12:05:00');
  await controller.close(); expect(api.close).toHaveBeenCalledWith('s', expect.any(AbortSignal));
  expect(controller.getSession()).toBeUndefined(); expect(controller.getSnapshot().phase).toBe('closed');
});
test.each(['create', 'refresh', 'send', 'close'] as const)('30s deadline bounds %s even if adapter ignores abort', async method => {
  jest.useFakeTimers(); const { controller, api } = setup();
  if (method !== 'create') await controller.start();
  api[method].mockImplementation(() => new Promise(() => {}));
  const pending = method === 'create' ? controller.start() : method === 'send' ? controller.send('질문') : controller[method]();
  await jest.advanceTimersByTimeAsync(30_000); await pending;
  expect(controller.getSnapshot().error).toBe('TIMEOUT');
});
test.each(['cancel', 'close', 'dispose', 'background', 'logout', 'input'] as const)('%s discards a late response', async action => {
  const { controller, api, consumer } = setup(); await controller.start();
  const late = deferred<ProviderEnvelope>(); api.send.mockReturnValueOnce(late.promise);
  const first = controller.send('first');
  if (action === 'background') controller.setForeground(false);
  else if (action === 'logout') controller.setAuthenticated(false);
  else if (action === 'input') await controller.send('second');
  else await controller[action]();
  late.resolve(envelope('old')); await first;
  expect(consumer.mock.calls.filter(call => call[0].id === 'old')).toHaveLength(0);
  expect(consumer).toHaveBeenCalledTimes(action === 'input' ? 1 : 0);
});
test('same id normalized payload reuses delivery across refresh; changed payload conflicts', async () => {
  const { controller, consumer, api } = setup(); await controller.start(); await controller.send('first');
  await controller.refresh();
  api.send.mockResolvedValueOnce({ text: '안내', kind: 'assistant_message', id: 'one', schemaVersion: 1 });
  await controller.send('again'); expect(consumer).toHaveBeenCalledTimes(1);
  api.send.mockResolvedValueOnce({ ...envelope(), text: 'changed' }); await controller.send('conflict');
  expect(controller.getSnapshot().error).toBe('REPLAY_CONFLICT'); expect(consumer).toHaveBeenCalledTimes(1);
});
test('atomic claim precedes reentrant consumer and duplicate shares in-flight result', async () => {
  const delivery = deferred<void>(); let nested: Promise<void> | undefined;
  const consumer = jest.fn(() => { nested = controller.send('reentrant'); return delivery.promise; });
  const { controller } = setup(consumer); await controller.start(); const first = controller.send('first');
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  delivery.resolve(); await first; await nested;
  expect(consumer).toHaveBeenCalledTimes(1);
});
test('ledger caps at 256 without eviction and a new epoch resets it', async () => {
  const { controller, api, consumer } = setup(); await controller.start();
  for (let i = 0; i < VOICE_LEDGER_LIMIT; i++) { api.send.mockResolvedValueOnce(envelope(`id-${i}`)); await controller.send('input'); }
  await controller.send('overflow'); expect(controller.getSnapshot().error).toBe('LEDGER_FULL');
  expect(api.send).toHaveBeenCalledTimes(256); expect(consumer).toHaveBeenCalledTimes(256);
  await controller.close(); await controller.start(); await controller.send('new'); expect(consumer).toHaveBeenCalledTimes(257);
});
test('network failure does not clear ledger; subsequent request can succeed', async () => {
  const { controller, api, consumer } = setup(); await controller.start(); await controller.send('first');
  api.send.mockRejectedValueOnce(new ApiError('private', { isNetworkError: true })); await controller.send('second');
  expect(controller.getSnapshot().error).toBe('NETWORK_ERROR');
  await controller.send('third'); expect(consumer).toHaveBeenCalledTimes(1); expect(controller.getSnapshot().error).toBeNull();
});
test('consumer context becomes stale immediately on cancellation', async () => {
  const { controller, consumer } = setup(); await controller.start(); await controller.send('first');
  const context = consumer.mock.calls[0][1]; expect(context.isCurrent()).toBe(true);
  controller.cancel(); expect(context.isCurrent()).toBe(false); expect(context.signal.aborted).toBe(true);
});
test.each([401, 403, 429, 500, 502, 410])('HTTP %s maps to a safe fixed code', status => {
  const codes: Record<number, string> = { 401: 'AUTHENTICATION_REQUIRED', 403: 'FORBIDDEN', 429: 'RATE_LIMITED', 500: 'SERVER_ERROR', 502: 'PROVIDER_ERROR', 410: 'SESSION_EXPIRED' };
  expect(voiceSessionError(new ApiError('JWT private', { status, responseBody: 'prompt' })).message).toBe(codes[status]);
});
test('timeout/cancel/network/explicit reset differ; empty response does not prove a reset', () => {
  expect(voiceSessionError(new ApiError('secret', { code: 'ERR_CANCELED' })).code).toBe('CANCELED');
  expect(voiceSessionError(new ApiError('secret', { code: 'ECONNABORTED' })).code).toBe('TIMEOUT');
  expect(voiceSessionError(new ApiError('secret', { isNetworkError: true })).code).toBe('NETWORK_ERROR');
  expect(voiceSessionError(new ApiError('secret', { code: 'ECONNRESET' })).code).toBe('CONNECTION_CLOSED');
  expect(() => decodeVoiceFinal('')).toThrow('INVALID_RESPONSE');
});
test('final JSON goes through parser; partial JSON and app-result forgery rejected', () => {
  expect(decodeVoiceFinal(JSON.stringify(envelope()))).toEqual(envelope());
  for (const raw of ['{"schemaVersion":1,', JSON.stringify({ ...envelope(), source: 'app' }), JSON.stringify({ ...envelope(), kind: 'command_result' }), JSON.stringify({ ...envelope(), unknown: true })]) {
    expect(() => decodeVoiceFinal(raw)).toThrow('INVALID_RESPONSE');
  }
});
test('16 KiB checks raw UTF-8 before JSON decoding, including whitespace', () => {
  const raw = JSON.stringify(envelope());
  const bytes = utf8Length(raw);
  expect(decodeVoiceFinal(raw + ' '.repeat(16384 - bytes))).toEqual(envelope());
  expect(() => decodeVoiceFinal(raw + ' '.repeat(16385 - bytes))).toThrow('RESPONSE_TOO_LARGE');
  expect(() => decodeVoiceFinal('한'.repeat(5500))).toThrow('RESPONSE_TOO_LARGE');
  expect(utf8Length('한😀')).toBe(7);
});
test('API exact methods, paths, JWT, signal and raw response options', async () => {
  const post = jest.fn().mockResolvedValue({ data: JSON.stringify(envelope()) });
  const remove = jest.fn().mockResolvedValue({ data: undefined });
  const restore = configureApiAccessTokenProvider(() => 'test-jwt');
  const client = createApiClient({ post, delete: remove } as unknown as ApiTransport);
  const api = createVoiceSessionApi(client); const signal = new AbortController().signal;
  try {
    await api.send('s/id', { requestId: 'i', text: '질문' }, signal);
    expect(post).toHaveBeenCalledWith('/voice-ai/sessions/s%2Fid/messages', { requestId: 'i', text: '질문' }, expect.objectContaining({ responseType: 'text', headers: { Authorization: 'Bearer test-jwt' }, maxContentLength: 16384 }));
    const options = post.mock.calls[0][2]; expect(options.transformResponse[0]('{')).toBe('{');
    post.mockResolvedValue({ data: { sessionId: 's', expiresAt: 'opaque' } });
    await api.create(signal); await api.refresh('s', signal); await api.close('s', signal);
    expect(post.mock.calls.slice(1).map(call => call[0])).toEqual(['/voice-ai/sessions', '/voice-ai/sessions/s/refresh']);
    expect(remove).toHaveBeenCalledWith('/voice-ai/sessions/s', expect.objectContaining({ signal }));
  } finally { restore(); }
});
test('download overflow aborts before final parser delivery', async () => {
  const post = jest.fn().mockImplementation(async (_p, _b, options) => {
    options.onDownloadProgress({ loaded: 16385 }); expect(options.signal.aborted).toBe(true);
    return JSON.stringify(envelope());
  });
  const api = createVoiceSessionApi({ post } as unknown as ApiClient);
  await expect(api.send('s', { requestId: 'i', text: 'hi' }, new AbortController().signal)).rejects.toThrow('RESPONSE_TOO_LARGE');
});
test('sensitive failures are not logged or exposed in session state', async () => {
  const spies = ['log', 'warn', 'error', 'info', 'debug'].map(key => jest.spyOn(console, key as 'log').mockImplementation(() => {}));
  const { controller, api } = setup(); await controller.start();
  api.send.mockRejectedValue(new ApiError('secret-jwt prompt exact-location', { status: 500, responseBody: 'secret' }));
  await controller.send('sensitive transcript');
  expect(JSON.stringify(controller.getSnapshot())).not.toMatch(/secret|transcript|prompt/);
  spies.forEach(spy => { expect(spy).not.toHaveBeenCalled(); spy.mockRestore(); });
});

test('download progress does not extend deadline and canceled final result is never delivered', async () => {
  jest.useFakeTimers();
  const post = jest.fn().mockImplementation((_path, _body, options) => new Promise(resolve => {
    setTimeout(() => options.onDownloadProgress({ loaded: 100 }), 29_000);
    setTimeout(() => resolve(JSON.stringify(envelope())), 31_000);
  }));
  const base = setup();
  const api = { ...base.api, send: createVoiceSessionApi({ post } as unknown as ApiClient).send };
  const consumer = jest.fn(); const controller = createVoiceSessionController(consumer, api);
  await controller.start(); const pending = controller.send('hello');
  await jest.advanceTimersByTimeAsync(30_000); await pending;
  expect(controller.getSnapshot().error).toBe('TIMEOUT');
  await jest.advanceTimersByTimeAsync(1_000); expect(consumer).not.toHaveBeenCalled();
});
test('consumer shares the original deadline and timeout invalidates its context', async () => {
  jest.useFakeTimers(); const delivery = deferred<void>();
  const consumer = jest.fn((_envelope: ProviderEnvelope, _context: VoiceDeliveryContext) => delivery.promise); const { controller, api } = setup(consumer);
  api.send.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(envelope()), 29_000)));
  await controller.start(); const pending = controller.send('hi');
  await jest.advanceTimersByTimeAsync(30_000); await pending;
  expect(controller.getSnapshot().error).toBe('TIMEOUT');
  expect(consumer.mock.calls[0][1].isCurrent()).toBe(false); delivery.resolve();
});
test('external cancellation is supported and blocks final delivery', async () => {
  const { controller, api, consumer } = setup(); await controller.start();
  const late = deferred<ProviderEnvelope>(); api.send.mockReturnValue(late.promise);
  const abort = new AbortController(); const pending = controller.send('hi', abort.signal); abort.abort();
  late.resolve(envelope()); await pending; expect(consumer).not.toHaveBeenCalled();
});
test('refresh cannot revive a closed epoch', async () => {
  const { controller, api } = setup(); await controller.start();
  const late = deferred<{ sessionId: string; expiresAt: string }>(); api.refresh.mockReturnValue(late.promise);
  const pending = controller.refresh(); await controller.close();
  late.resolve({ sessionId: 's', expiresAt: 'later' }); await pending;
  expect(controller.getSession()).toBeUndefined(); expect(controller.getSnapshot().phase).toBe('closed');
});

test('consumer failure is sanitized, not confused with provider syntax, and not redelivered', async () => {
  const consumer = jest.fn(() => { throw new Error('sensitive command result'); });
  const { controller } = setup(consumer); await controller.start();
  await controller.send('first'); expect(controller.getSnapshot().error).toBe('DELIVERY_FAILED');
  await controller.send('repeat'); expect(consumer).toHaveBeenCalledTimes(1);
  expect(controller.getSnapshot().error).toBe('DELIVERY_FAILED');
});
test('pre-aborted request never reaches API and a disposed controller cannot restart', async () => {
  const { controller, api } = setup(); const abort = new AbortController(); abort.abort();
  await controller.start(abort.signal); expect(api.create).not.toHaveBeenCalled();
  expect(controller.getSnapshot().error).toBe('CANCELED');
  controller.dispose(); await expect(controller.start()).rejects.toThrow('AUTHENTICATION_REQUIRED');
});
