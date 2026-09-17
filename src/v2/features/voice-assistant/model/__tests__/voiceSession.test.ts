import { createVoiceSessionController, VOICE_LEDGER_LIMIT, type VoiceDeliveryContext, type VoiceSessionController } from '../voiceSession';
import { createVoiceSessionApi, decodeVoiceFinal, utf8Length } from '../../api/voiceSessionApi';
import { ApiError, createApiClient, configureApiAccessTokenProvider, type ApiClient, type ApiTransport } from '../../../../shared/api';
import { voiceSessionError } from '../voiceSessionError';
import type { ProviderEnvelope } from '../voiceAssistantCommand.types';

const envelope = (id = 'one'): ProviderEnvelope => ({ schemaVersion: 1, id, kind: 'assistant_message', text: '안내' });
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; };
const controllers: VoiceSessionController[] = [];
function tracked(controller: VoiceSessionController) { controllers.push(controller); return controller; }
function setup(consumer = jest.fn()) {
  const api = {
    create: jest.fn().mockImplementation(async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300_000).toISOString() })),
    refresh: jest.fn().mockImplementation(async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 600_000).toISOString() })),
    close: jest.fn().mockResolvedValue(undefined), send: jest.fn().mockResolvedValue(envelope()),
  };
  return { api, consumer, controller: tracked(createVoiceSessionController(consumer, api)) };
}
afterEach(() => { controllers.splice(0).forEach(c => c.dispose()); jest.useRealTimers(); });

test('create, explicit refresh and close use offset-aware expiry', async () => {
  const { controller, api } = setup();
  await controller.start(); expect(controller.getSnapshot().phase).toBe('ready');
  await controller.refresh(); expect(Date.parse(controller.getSession()!.expiresAt)).toBeGreaterThan(Date.now() + 590_000);
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
  const post = jest.fn().mockResolvedValue({ data: JSON.stringify(envelope('i')) });
  const remove = jest.fn().mockResolvedValue({ data: undefined });
  const restore = configureApiAccessTokenProvider(() => 'test-jwt');
  const client = createApiClient({ post, delete: remove } as unknown as ApiTransport);
  const api = createVoiceSessionApi(client); const signal = new AbortController().signal;
  try {
    await api.send('s/id', { requestId: 'i', text: '질문' }, signal);
    expect(post).toHaveBeenCalledWith('/voice-ai/sessions/s%2Fid/messages', { requestId: 'i', text: '질문' }, expect.objectContaining({ responseType: 'text', headers: { Authorization: 'Bearer test-jwt' }, maxContentLength: 16384 }));
    const options = post.mock.calls[0][2]; expect(options.transformResponse[0]('{')).toBe('{');
    post.mockResolvedValue({ data: { sessionId: 's', expiresAt: '2030-09-17T12:00:00+09:00' } });
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
  const consumer = jest.fn(); const controller = tracked(createVoiceSessionController(consumer, api));
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

test('offset-aware expiry rejects ambiguous and impossible timestamps', async () => {
  const post = jest.fn(); const api = createVoiceSessionApi({ post } as unknown as ApiClient);
  for (const expiresAt of ['2030-09-17T12:00:00', '2030-02-30T12:00:00Z', 'garbage', '2030-09-17T12:00:00+25:00']) {
    post.mockResolvedValue({ sessionId: 's', expiresAt });
    await expect(api.create(new AbortController().signal)).rejects.toThrow('INVALID_RESPONSE');
  }
  post.mockResolvedValue({ sessionId: 's', expiresAt: '2030-09-17T12:00:00+09:00' });
  expect((await api.create(new AbortController().signal)).expiresAt).toBe('2030-09-17T12:00:00+09:00');
});
test('expiry boundary aborts pending input and discards its late final response', async () => {
  jest.useFakeTimers(); const { controller, api, consumer } = setup();
  api.create.mockResolvedValue({ sessionId: 's', expiresAt: new Date(Date.now() + 5_000).toISOString() });
  await controller.start(); const late = deferred<ProviderEnvelope>(); api.send.mockReturnValue(late.promise);
  const pending = controller.send('input');
  await jest.advanceTimersByTimeAsync(5_000); await pending;
  expect(controller.getSnapshot()).toMatchObject({ phase: 'closed', error: 'SESSION_EXPIRED', retryAvailable: false });
  late.resolve(envelope()); await Promise.resolve(); expect(consumer).not.toHaveBeenCalled();
  expect(controller.getSession()).toBeUndefined();
});
test('refresh replaces the expiry timer without resetting the replay ledger', async () => {
  jest.useFakeTimers(); const { controller, consumer } = setup(); await controller.start(); await controller.send('first');
  await jest.advanceTimersByTimeAsync(299_000); await controller.refresh();
  await jest.advanceTimersByTimeAsync(2_000); expect(controller.getSnapshot().phase).toBe('ready');
  await controller.send('duplicate'); expect(consumer).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(598_000); expect(controller.getSnapshot().error).toBe('SESSION_EXPIRED');
});
test('backward wall-clock change does not extend monotonic session lifetime', async () => {
  jest.useFakeTimers(); const { controller } = setup(); await controller.start();
  jest.setSystemTime(Date.now() - 3600_000);
  await jest.advanceTimersByTimeAsync(300_000);
  expect(controller.getSnapshot().error).toBe('SESSION_EXPIRED');
});
test.each([401, 403, 404, 410])('HTTP %s invalidates the epoch and existing consumer context', async status => {
  const { controller, api, consumer } = setup(); await controller.start(); await controller.send('first');
  const context = consumer.mock.calls[0][1];
  api.send.mockRejectedValueOnce(new ApiError('private', { status })); await controller.send('second');
  expect(controller.getSnapshot().phase).toBe('closed'); expect(controller.getSession()).toBeUndefined();
  expect(context.isCurrent()).toBe(false); expect(controller.getSnapshot().retryAvailable).toBe(false);
});
test('retry uses the same ID/text with no new generation and no automatic network call', async () => {
  jest.useFakeTimers(); const { controller, api, consumer } = setup(); await controller.start();
  api.send.mockRejectedValueOnce(new ApiError('private', { isNetworkError: true }));
  await controller.send('same text'); const generation = controller.getSnapshot().generation;
  expect(controller.getSnapshot().retryAvailable).toBe(true);
  await expect(controller.retry()).rejects.toThrow('RETRY_BACKOFF');
  await jest.advanceTimersByTimeAsync(1000); expect(api.send).toHaveBeenCalledTimes(1);
  await controller.retry(); expect(api.send).toHaveBeenCalledTimes(2);
  expect(api.send.mock.calls[1][1]).toEqual(api.send.mock.calls[0][1]);
  expect(controller.getSnapshot()).toMatchObject({ generation, retryAvailable: false, error: null });
  expect(consumer).toHaveBeenCalledTimes(1);
  await expect(controller.retry()).rejects.toThrow('RETRY_UNAVAILABLE');
});
test('429 uses app backoff of at least 60s; no Retry-After is invented', async () => {
  jest.useFakeTimers(); const { controller, api } = setup(); await controller.start();
  api.send.mockRejectedValueOnce(new ApiError('private', { status: 429, code: 'RATE_LIMIT_EXCEEDED' }));
  await controller.send('same text');
  await jest.advanceTimersByTimeAsync(59_999); await expect(controller.retry()).rejects.toThrow('RETRY_BACKOFF');
  await jest.advanceTimersByTimeAsync(1); await controller.retry();
  expect(api.send.mock.calls[1][1]).toEqual(api.send.mock.calls[0][1]);
});
test.each(['cancel', 'close', 'dispose', 'background', 'logout', 'input'] as const)('%s removes pending retry data', async action => {
  jest.useFakeTimers(); const { controller, api } = setup(); await controller.start();
  api.send.mockRejectedValueOnce(new ApiError('private', { isNetworkError: true })); await controller.send('private text');
  if (action === 'background') controller.setForeground(false);
  else if (action === 'logout') controller.setAuthenticated(false);
  else if (action === 'input') await controller.send('new text');
  else await controller[action]();
  expect(controller.getSnapshot().retryAvailable).toBe(false);
  expect(JSON.stringify(controller.getSnapshot())).not.toContain('private text');
});
test('new input after failed request gets a different ID; retry never resurrects old input', async () => {
  const { controller, api } = setup(); await controller.start();
  api.send.mockRejectedValueOnce(new ApiError('private', { status: 503, code: 'RATE_LIMIT_UNAVAILABLE' }));
  await controller.send('old'); await controller.send('new');
  expect(api.send.mock.calls[0][1].requestId).not.toBe(api.send.mock.calls[1][1].requestId);
  await expect(controller.retry()).rejects.toThrow('RETRY_UNAVAILABLE');
});
test.each([
  [409, 'REPLAY_CONFLICT', 'REPLAY_CONFLICT'], [502, 'PROVIDER_UNAVAILABLE', 'PROVIDER_UNAVAILABLE'],
  [502, 'PROVIDER_RESPONSE_INVALID', 'PROVIDER_RESPONSE_INVALID'], [503, 'RATE_LIMIT_UNAVAILABLE', 'RATE_LIMIT_UNAVAILABLE'],
] as const)('documented %s/%s maps to %s', (status, code, expected) => {
  expect(voiceSessionError(new ApiError('private', { status, code })).code).toBe(expected);
});
test('text-mode error response still flows through shared ApiError conversion', async () => {
  const post = jest.fn().mockImplementation(async (_p, _b, options) => {
    const data = options.transformResponse[0]('{"code":"REPLAY_CONFLICT","message":"private"}', {}, 409);
    throw { isAxiosError: true, response: { status: 409, data }, message: 'private' };
  });
  const api = createVoiceSessionApi(createApiClient({ post } as unknown as ApiTransport));
  await expect(api.send('s', { requestId: 'i', text: 'input' }, new AbortController().signal)).rejects.toThrow('REPLAY_CONFLICT');
});
test('final ID mismatch is rejected even when its envelope is parser-valid', async () => {
  const client = { post: jest.fn().mockResolvedValue(JSON.stringify(envelope('wrong'))) } as unknown as ApiClient;
  await expect(createVoiceSessionApi(client).send('s', { requestId: 'expected', text: 'input' }, new AbortController().signal)).rejects.toThrow('INVALID_RESPONSE');
});

test('retry after timeout cannot deliver the original late response twice', async () => {
  jest.useFakeTimers(); const { controller, api, consumer } = setup(); await controller.start();
  const late = deferred<ProviderEnvelope>(); api.send.mockReturnValueOnce(late.promise);
  const first = controller.send('question'); await jest.advanceTimersByTimeAsync(30_000); await first;
  await jest.advanceTimersByTimeAsync(1000); await controller.retry();
  expect(api.send.mock.calls[0][1]).toEqual(api.send.mock.calls[1][1]);
  late.resolve(envelope()); await Promise.resolve(); expect(consumer).toHaveBeenCalledTimes(1);
});
test('expiry clears backoff data and retry cannot create a new session implicitly', async () => {
  jest.useFakeTimers(); const { controller, api } = setup();
  api.create.mockResolvedValue({ sessionId: 's', expiresAt: new Date(Date.now() + 5000).toISOString() });
  await controller.start(); api.send.mockRejectedValueOnce(new ApiError('private', { status: 429 }));
  await controller.send('input'); await jest.advanceTimersByTimeAsync(5000);
  expect(controller.getSnapshot()).toMatchObject({ error: 'SESSION_EXPIRED', retryAvailable: false });
  await expect(controller.retry()).rejects.toThrow('SESSION_REQUIRED'); expect(api.create).toHaveBeenCalledTimes(1);
});
test('provider schema violation has no retry affordance', async () => {
  const { controller, api } = setup(); await controller.start();
  api.send.mockRejectedValueOnce(new ApiError('private', { status: 502, code: 'PROVIDER_RESPONSE_INVALID' }));
  await controller.send('input'); expect(controller.getSnapshot()).toMatchObject({ error: 'PROVIDER_RESPONSE_INVALID', retryAvailable: false });
});
