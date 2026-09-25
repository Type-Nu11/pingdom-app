import { createVoiceInputController, unavailableSpeechAdapter, validateVoiceInput, VOICE_SILENCE_MS, type MicrophonePermission, type SpeechEvent, type SpeechInputAdapter, type OnFinalInput } from '../voiceInput';

function setup(permission: MicrophonePermission = 'granted', callback: OnFinalInput = jest.fn(() => 'localOnly')) {
  let emit!: (event: SpeechEvent) => void;
  let signal!: AbortSignal;
  const session = { start: jest.fn(), stop: jest.fn(), cancel: jest.fn() };
  const adapter: SpeechInputAdapter = {
    available: true,
    getPermission: jest.fn(async () => permission),
    requestPermission: jest.fn(async () => permission),
    createSession: jest.fn(options => { emit = options.onEvent; signal = options.signal; return session; }),
  };
  const controller = createVoiceInputController(adapter, callback);
  return { controller, adapter, session, callback, emit: (event: SpeechEvent) => emit(event), signal: () => signal };
}
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; };
afterEach(() => jest.useRealTimers());

test('final speech is submitted once after five seconds of silence without a keyboard action', async () => {
  jest.useFakeTimers();
  const x = setup();
  const phases: string[] = [x.controller.getSnapshot().phase];
  x.controller.subscribe(() => phases.push(x.controller.getSnapshot().phase));
  const start = x.controller.start('ko-KR');
  expect(x.controller.getSnapshot().phase).toBe('permissionRequesting');
  await start;
  x.emit({ type: 'activity', speaking: true });
  expect(x.controller.getSnapshot().speaking).toBe(true);
  x.emit({ type: 'partial', text: 'partial private text' });
  await x.controller.submit();
  expect(x.callback).not.toHaveBeenCalled();
  expect(x.controller.getSnapshot().partial).toBe('partial private text');
  x.emit({ type: 'final', text: '  카페 검색  ' });
  x.emit({ type: 'final', text: '  카페 검색  ' });
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'listening', draft: '카페 검색', partial: '' });
  expect(x.callback).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(VOICE_SILENCE_MS - 1);
  expect(x.callback).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1);
  expect(x.callback).toHaveBeenCalledTimes(1);
  expect(x.callback).toHaveBeenCalledWith(expect.objectContaining({ text: '카페 검색', source: 'voice' }));
  expect(x.session.cancel).toHaveBeenCalledTimes(1);
  expect(x.signal().aborted).toBe(true);
  expect(phases).toEqual(expect.arrayContaining(['idle', 'permissionRequesting', 'listening', 'final']));
  x.controller.dispose();
});

test('new speech within five seconds restarts the clock and appends a new final segment', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('ko-KR');
  x.emit({ type: 'final', text: '근처 카페' });
  await jest.advanceTimersByTimeAsync(4000);
  x.emit({ type: 'partial', text: '조용한 곳' });
  x.emit({ type: 'activity', speaking: true });
  await jest.advanceTimersByTimeAsync(4000);
  expect(x.callback).not.toHaveBeenCalled();
  x.emit({ type: 'final', text: '조용한 곳' });
  await jest.advanceTimersByTimeAsync(999);
  expect(x.callback).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1);
  expect(x.callback).toHaveBeenCalledTimes(1);
  expect(x.callback).toHaveBeenCalledWith(expect.objectContaining({ text: '근처 카페 조용한 곳', source: 'voice' }));
  x.controller.dispose();
});

test('silence with only a partial stops capture and waits for a final result', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('en-US');
  x.emit({ type: 'partial', text: 'find a cafe' });
  await jest.advanceTimersByTimeAsync(VOICE_SILENCE_MS);
  expect(x.session.stop).toHaveBeenCalledTimes(1);
  expect(x.callback).not.toHaveBeenCalled();
  x.emit({ type: 'final', text: 'find a cafe' });
  await Promise.resolve();
  expect(x.callback).toHaveBeenCalledTimes(1);
  x.controller.dispose();
});

test('partial speech is never sent if native recognition ends without a final result', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('ko-KR');
  x.emit({ type: 'partial', text: '카페' });
  await jest.advanceTimersByTimeAsync(VOICE_SILENCE_MS);
  x.emit({ type: 'ended' });
  expect(x.controller.getSnapshot().error).toBe('noSpeech');
  expect(x.callback).not.toHaveBeenCalled();
  x.controller.dispose();
});

test('native no-speech after a finalized phrase keeps the pending silence handoff', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('en-US');
  x.emit({ type: 'final', text: 'coffee' });
  x.emit({ type: 'error', reason: 'noSpeech' });
  await jest.advanceTimersByTimeAsync(VOICE_SILENCE_MS);
  expect(x.callback).toHaveBeenCalledTimes(1);
  expect(x.callback).toHaveBeenCalledWith(expect.objectContaining({ text: 'coffee' }));
  x.controller.dispose();
});

test('native end preserves a final result until silence expires; closing cancels the timer', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('en-US');
  x.emit({ type: 'final', text: 'coffee' });
  x.emit({ type: 'ended' });
  await jest.advanceTimersByTimeAsync(VOICE_SILENCE_MS - 1);
  expect(x.callback).not.toHaveBeenCalled();
  x.controller.cancel();
  await jest.advanceTimersByTimeAsync(1);
  expect(x.callback).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
  x.controller.dispose();
});

test.each(['denied', 'blocked'] as const)('%s permission prevents capture but allows text', async permission => {
  const x = setup(permission);
  await x.controller.start('en-US');
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'permissionDenied', permission });
  expect(x.adapter.createSession).not.toHaveBeenCalled();
  expect(x.adapter.requestPermission).toHaveBeenCalledTimes(permission === 'blocked' ? 0 : 1);
  x.controller.edit('text fallback');
  await x.controller.submit();
  expect(x.callback).toHaveBeenCalledTimes(1);
  x.controller.dispose();
});

test('undetermined permission is requested only by explicit start and grant starts capture', async () => {
  const x = setup('undetermined');
  jest.mocked(x.adapter.requestPermission).mockResolvedValue('granted');
  expect(x.adapter.getPermission).not.toHaveBeenCalled();
  await x.controller.start('ko-KR');
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'listening', permission: 'granted' });
  x.controller.dispose();
});

test.each(['', '  \n\t ', 'x'.repeat(2001)])('same validation rejects invalid voice and text input (case %#)', async text => {
  const x = setup();
  x.controller.edit(text);
  await x.controller.submit();
  expect(x.callback).not.toHaveBeenCalled();
  await x.controller.start('en-US');
  x.emit({ type: 'final', text });
  await x.controller.submit();
  expect(x.callback).not.toHaveBeenCalled();
  x.controller.dispose();
});

test('validation trims and accepts exactly 2000 characters', () => {
  expect(validateVoiceInput('  hello\n')).toEqual({ text: 'hello', error: null });
  expect(validateVoiceInput('x'.repeat(2000)).error).toBeNull();
});

test.each(['cancel', 'background', 'unmount'] as const)('%s stops capture, erases draft and rejects late callbacks', async reason => {
  const x = setup();
  await x.controller.start('ko-KR');
  x.emit({ type: 'activity', speaking: true });
  x.emit({ type: 'partial', text: 'private' });
  if (reason === 'cancel') x.controller.cancel();
  else if (reason === 'background') x.controller.setForeground(false);
  else x.controller.dispose();
  expect(x.session.cancel).toHaveBeenCalledTimes(1);
  expect(x.signal().aborted).toBe(true);
  x.emit({ type: 'final', text: 'late private final' });
  x.emit({ type: 'activity', speaking: true });
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'canceled', draft: '', partial: '', speaking: false });
  await x.controller.submit();
  expect(x.callback).not.toHaveBeenCalled();
});

test('late permission grant after cancellation never starts capture, nor overwrites a newer session', async () => {
  const x = setup();
  const permission = deferred<MicrophonePermission>();
  jest.mocked(x.adapter.getPermission).mockReturnValueOnce(permission.promise);
  const oldStart = x.controller.start('en-US');
  x.controller.cancel();
  await x.controller.start('ko-KR');
  permission.resolve('granted');
  await oldStart;
  expect(x.adapter.createSession).toHaveBeenCalledTimes(1);
  expect(x.controller.getSnapshot().phase).toBe('listening');
  x.controller.dispose();
});

test('rapid starts/stops and old session callbacks cannot affect a new session', async () => {
  const x = setup();
  await Promise.all([x.controller.start('en-US'), x.controller.start('en-US')]);
  expect(x.session.start).toHaveBeenCalledTimes(1);
  const old = jest.mocked(x.adapter.createSession).mock.calls[0][0].onEvent;
  await Promise.all([x.controller.stop(), x.controller.stop()]);
  expect(x.session.stop).toHaveBeenCalledTimes(1);
  x.controller.cancel();
  await x.controller.start('en-US');
  old({ type: 'final', text: 'stale' });
  expect(x.controller.getSnapshot().draft).toBe('');
  x.controller.dispose();
});

test.each(['interrupted', 'noSpeech', 'unavailable', 'failed'] as const)('%s remains local and text still submits', async reason => {
  const x = setup();
  await x.controller.start('en-US');
  x.emit({ type: 'error', reason });
  expect(x.session.cancel).toHaveBeenCalled();
  expect(x.controller.getSnapshot().error).toBe(reason);
  x.controller.edit('fallback');
  await x.controller.submit();
  expect(x.callback).toHaveBeenCalledTimes(1);
  x.controller.dispose();
});

test('start/stop native rejection is contained', async () => {
  for (const method of ['start', 'stop'] as const) {
    const x = setup();
    x.session[method].mockRejectedValue(new Error('raw native private error') as never);
    await x.controller.start('en-US');
    if (method === 'stop') await x.controller.stop();
    expect(x.controller.getSnapshot().error).toBe('failed');
    x.controller.dispose();
  }
});

test('recognition has a bounded deadline, including silence after stop', async () => {
  jest.useFakeTimers();
  const x = setup();
  await x.controller.start('en-US');
  jest.advanceTimersByTime(60000);
  expect(x.controller.getSnapshot().error).toBe('noSpeech');
  await x.controller.start('en-US');
  await x.controller.stop();
  jest.advanceTimersByTime(10000);
  expect(x.controller.getSnapshot().error).toBe('noSpeech');
  expect(jest.getTimerCount()).toBe(0);
  x.controller.dispose();
});

test('editing during recording cancels it; same normalized text cannot be handed off twice', async () => {
  const x = setup();
  await x.controller.start('en-US');
  x.controller.edit('same');
  expect(x.session.cancel).toHaveBeenCalledTimes(1);
  await x.controller.submit();
  x.controller.edit(' same ');
  await x.controller.submit();
  expect(x.callback).toHaveBeenCalledTimes(1);
  x.controller.cancel(); // explicit new request can intentionally repeat
  x.controller.edit('same');
  await x.controller.submit();
  expect(x.callback).toHaveBeenCalledTimes(2);
  x.controller.dispose();
});

test('submission failure never logs or automatically resubmits text, late success is discarded', async () => {
  const callback = jest.fn<ReturnType<OnFinalInput>, Parameters<OnFinalInput>>().mockRejectedValueOnce(new Error('private error'));
  const x = setup('granted', callback);
  x.controller.edit('private text');
  await x.controller.submit();
  await x.controller.submit();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(x.controller.getSnapshot().error).toBe('submitFailed');
  const pending = deferred<'accepted'>();
  callback.mockReturnValueOnce(pending.promise);
  x.controller.edit('new request');
  const submit = x.controller.submit();
  const signal = callback.mock.calls[1][0].signal;
  x.controller.setForeground(false);
  expect(signal.aborted).toBe(true);
  pending.resolve('accepted');
  await submit;
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'canceled', draft: '', delivery: 'none' });
  x.controller.dispose();
});

test('typing during a pending voice handoff cancels it and allows a fresh text request', async () => {
  const pending = deferred<'accepted'>();
  const callback = jest.fn<ReturnType<OnFinalInput>, Parameters<OnFinalInput>>()
    .mockReturnValueOnce(pending.promise).mockReturnValueOnce('accepted');
  const x = setup('granted', callback);
  await x.controller.start('ko-KR');
  x.emit({ type: 'final', text: 'old request' });
  const first = x.controller.stop();
  await first;
  x.emit({ type: 'ended' });
  const oldSignal = callback.mock.calls[0][0].signal;
  expect(x.controller.getSnapshot().delivery).toBe('pending');
  x.controller.edit('new text request');
  expect(oldSignal.aborted).toBe(true);
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'idle', source: 'text', draft: 'new text request', delivery: 'none' });
  await x.controller.submit();
  expect(callback).toHaveBeenCalledTimes(2);
  pending.resolve('accepted');
  await Promise.resolve();
  expect(x.controller.getSnapshot()).toMatchObject({ draft: 'new text request', delivery: 'accepted' });
  x.controller.dispose();
});

test('production unavailable adapter never requests microphone or retains audio', async () => {
  const callback = jest.fn(() => 'localOnly' as const);
  const c = createVoiceInputController(unavailableSpeechAdapter, callback);
  await c.start('ko-KR');
  expect(c.getSnapshot().phase).toBe('unavailable');
  c.edit('text');
  await c.submit();
  expect(callback).toHaveBeenCalledTimes(1);
  c.dispose();
});

test('native startup in flight is aborted and its late rejection cannot erase a newer text input', async () => {
  const x = setup();
  let reject!: (error: Error) => void;
  x.session.start.mockImplementation(() => new Promise<void>((_resolve, rejectPromise) => { reject = rejectPromise; }));
  const start = x.controller.start('ko-KR');
  await Promise.resolve();
  x.controller.edit('new text');
  expect(x.signal().aborted).toBe(true);
  reject(new Error('private native failure'));
  await start;
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'idle', draft: 'new text', error: null });
  await x.controller.submit();
  expect(x.callback).toHaveBeenCalledTimes(1);
  x.controller.dispose();
});

test('private native/callback errors are contained without logging', async () => {
  const log = jest.spyOn(console, 'log');
  const warn = jest.spyOn(console, 'warn');
  const error = jest.spyOn(console, 'error');
  const x = setup('granted', async () => { throw new Error('JWT transcript credential system instruction'); });
  jest.mocked(x.adapter.getPermission).mockRejectedValueOnce(new Error('raw private error'));
  await x.controller.start('en-US');
  x.controller.edit('private transcript');
  await x.controller.submit();
  expect(log).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  x.controller.dispose();
});
