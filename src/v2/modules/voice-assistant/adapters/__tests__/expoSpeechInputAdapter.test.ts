import { createVoiceInputController } from '../../model/voiceInput';
import { createExpoSpeechInputAdapter } from '../expoSpeechInputAdapter';
import { PermissionStatus } from 'expo-modules-core';

const permission = (status: 'granted' | 'denied' | 'undetermined', canAskAgain = status === 'undetermined', restricted = false) =>
  ({ status: status as PermissionStatus, granted: status === 'granted', canAskAgain, restricted, expires: 'never' as const });

function setup(platform: 'ios' | 'android' = 'ios', androidApiLevel = 33, pcmVadAvailable = false) {
  const listeners = new Map<string, Array<(value: never) => void>>();
  const removed: string[] = [];
  const module = {
    isPcmVadAvailable: jest.fn(() => pcmVadAvailable),
    isRecognitionAvailable: jest.fn(() => true),
    getSpeechRecognizerPermissionsAsync: jest.fn(async () => permission('granted')),
    requestSpeechRecognizerPermissionsAsync: jest.fn(async () => permission('granted')),
    addListener: jest.fn((name: string, listener: (value: never) => void) => {
      const entries = listeners.get(name) ?? [];
      entries.push(listener);
      listeners.set(name, entries);
      return { remove: () => { removed.push(name); listeners.set(name, (listeners.get(name) ?? []).filter(item => item !== listener)); } };
    }),
    start: jest.fn(), stop: jest.fn(), abort: jest.fn(),
  };
  const getMicrophone = jest.fn(async () => permission('granted'));
  const requestMicrophone = jest.fn(async () => permission('granted'));
  const adapter = createExpoSpeechInputAdapter({ platform, androidApiLevel, module: module as never, getMicrophone, requestMicrophone });
  const emit = (name: string, value?: object) => { for (const listener of [...(listeners.get(name) ?? [])]) listener(value as never); };
  return { adapter, module, getMicrophone, requestMicrophone, emit, listeners, removed };
}

test('iOS checks the existing startup microphone grant and requests only speech authorization', async () => {
  const x = setup();
  x.module.getSpeechRecognizerPermissionsAsync.mockResolvedValue(permission('undetermined'));
  expect(await x.adapter.getPermission()).toBe('undetermined');
  expect(await x.adapter.requestPermission()).toBe('granted');
  expect(x.requestMicrophone).not.toHaveBeenCalled();
  expect(x.module.requestSpeechRecognizerPermissionsAsync).toHaveBeenCalledTimes(1);
});

test('restricted and blocked iOS speech permission never re-prompt or start capture', async () => {
  for (const restricted of [true, false]) {
    const x = setup();
    x.module.getSpeechRecognizerPermissionsAsync.mockResolvedValue(permission('denied', false, restricted));
    const controller = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
    await controller.start('ko-KR');
    expect(controller.getSnapshot()).toMatchObject({ phase: 'permissionDenied', permission: restricted ? 'restricted' : 'blocked' });
    expect(x.module.requestSpeechRecognizerPermissionsAsync).not.toHaveBeenCalled();
    expect(x.module.start).not.toHaveBeenCalled();
    controller.edit('텍스트');
    expect(controller.getSnapshot().draft).toBe('텍스트');
    controller.dispose();
  }
});

test('Android uses startup microphone permission and no separate speech authorization', async () => {
  const x = setup('android');
  x.getMicrophone.mockResolvedValue(permission('undetermined'));
  expect(await x.adapter.getPermission()).toBe('undetermined');
  expect(await x.adapter.requestPermission()).toBe('granted');
  expect(x.requestMicrophone).toHaveBeenCalledTimes(1);
  expect(x.module.getSpeechRecognizerPermissionsAsync).not.toHaveBeenCalled();
});

test('continuous capture is enabled only where the native engine supports it', async () => {
  for (const [platform, apiLevel, expected] of [['ios', 0, true], ['android', 33, true], ['android', 32, false]] as const) {
    const x = setup(platform, apiLevel);
    const controller = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
    await controller.start('en-US');
    expect(x.module.start).toHaveBeenCalledWith(expect.objectContaining({ continuous: expected }));
    controller.dispose();
  }
});

test('explicit start uses selected locale, no file persistence, partial preview, and manual stop sends one final', async () => {
  const x = setup();
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  expect(x.module.start).not.toHaveBeenCalled();
  await controller.start('ko-KR');
  expect(x.module.start).toHaveBeenCalledWith(expect.objectContaining({ lang: 'ko-KR', interimResults: true,
    requiresOnDeviceRecognition: false, recordingOptions: { persist: false },
    volumeChangeEventOptions: { enabled: true, intervalMillis: 250 } }));
  x.emit('volumechange', { value: 3 });
  expect(controller.getSnapshot().speaking).toBe(true);
  x.emit('volumechange', { value: -1 });
  expect(controller.getSnapshot().speaking).toBe(false);
  x.emit('result', { isFinal: false, results: [{ transcript: '부분' }] });
  expect(controller.getSnapshot().partial).toBe('부분');
  expect(delivered).not.toHaveBeenCalled();
  await controller.stop();
  expect(x.module.stop).toHaveBeenCalledTimes(1);
  x.emit('result', { isFinal: true, results: [{ transcript: '최종' }] });
  x.emit('result', { isFinal: true, results: [{ transcript: '최종' }] });
  expect(controller.getSnapshot().draft).toBe('최종');
  expect(delivered).toHaveBeenCalledTimes(1);
  expect(x.removed).toEqual(expect.arrayContaining(['result', 'error', 'volumechange', 'end']));
  controller.dispose();
});

test.each([
  ['network', 'network'], ['interrupted', 'interrupted'], ['no-speech', 'noSpeech'],
  ['service-not-allowed', 'unavailable'], ['busy', 'failed'],
] as const)('%s error ends native session and retains text fallback', async (nativeError, reason) => {
  const x = setup();
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  await controller.start('en-US');
  x.emit('error', { error: nativeError, message: 'private native detail' });
  expect(controller.getSnapshot().error).toBe(reason);
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  expect(x.listeners.get('result')).toHaveLength(0);
  x.emit('result', { isFinal: true, results: [{ transcript: 'late' }] });
  controller.edit('fallback');
  await controller.submit();
  expect(delivered).toHaveBeenCalledWith(expect.objectContaining({ text: 'fallback', source: 'text' }));
  controller.dispose();
});

test('cancel and background detach listeners before abort; late events cannot publish', async () => {
  const x = setup();
  const controller = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
  await controller.start('en-US');
  const stale = x.listeners.get('result')?.[0];
  const staleVolume = x.listeners.get('volumechange')?.[0];
  controller.setForeground(false);
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  expect(x.listeners.get('result')).toHaveLength(0);
  stale?.({ isFinal: true, results: [{ transcript: 'late' }] } as never);
  staleVolume?.({ value: 5 } as never);
  expect(controller.getSnapshot()).toMatchObject({ phase: 'canceled', draft: '', speaking: false });
  controller.dispose();
});

test('native audio edges prevent endpointing during speech and reset the quiet clock', async () => {
  jest.useFakeTimers();
  const x = setup('android');
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  await controller.start('ko-KR');
  x.emit('speechstart');
  x.emit('result', { isFinal: false, results: [{ transcript: '문 열었나요' }] });
  await jest.advanceTimersByTimeAsync(4000);
  expect(x.module.stop).not.toHaveBeenCalled();
  x.emit('speechend');
  await jest.advanceTimersByTimeAsync(700);
  x.emit('speechstart');
  await jest.advanceTimersByTimeAsync(2000);
  expect(x.module.stop).not.toHaveBeenCalled();
  x.emit('volumechange', { value: 0.5 });
  await jest.advanceTimersByTimeAsync(999);
  expect(x.module.stop).not.toHaveBeenCalled();
  x.emit('volumechange', { value: 0.5 });
  await jest.advanceTimersByTimeAsync(1);
  expect(x.module.stop).toHaveBeenCalledTimes(1);
  expect(delivered).not.toHaveBeenCalled();
  x.emit('result', { isFinal: true, results: [{ transcript: '문 열었나요' }] });
  expect(delivered).toHaveBeenCalledTimes(1);
  controller.dispose();
  jest.useRealTimers();
});

test('end without final result fails once and unsupported recognizer preserves typing', async () => {
  const x = setup();
  const controller = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
  await controller.start('en-US');
  x.emit('end');
  expect(controller.getSnapshot().error).toBe('noSpeech');
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  controller.dispose();
  x.module.isRecognitionAvailable.mockReturnValue(false);
  const unsupported = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
  await unsupported.start('en-US');
  expect(unsupported.getSnapshot().phase).toBe('unavailable');
  unsupported.edit('text');
  expect(unsupported.getSnapshot().draft).toBe('text');
  unsupported.dispose();
});


test('a final greeting cannot start a quiet handoff without acoustic evidence', async () => {
  jest.useFakeTimers();
  const x = setup('android');
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  try {
    await controller.start('ko-KR');
    x.emit('speechstart');
    x.emit('volumechange', { value: 5 });
    x.emit('result', { isFinal: true, results: [{ transcript: '안녕' }] });
    await jest.advanceTimersByTimeAsync(5000);
    expect(controller.getSnapshot()).toMatchObject({ phase: 'listening', speaking: true });
    expect(delivered).not.toHaveBeenCalled();
    expect(x.module.stop).not.toHaveBeenCalled();
    expect(x.module.abort).not.toHaveBeenCalled();
    x.emit('speechend');
    await jest.advanceTimersByTimeAsync(999);
    expect(delivered).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(x.module.abort).toHaveBeenCalledTimes(1);
    expect(delivered).toHaveBeenCalledTimes(1);
    expect(delivered).toHaveBeenCalledWith(expect.objectContaining({ text: '안녕', source: 'voice' }));
    expect(controller.getSnapshot().phase).toBe('final');
  } finally { controller.dispose(); jest.useRealTimers(); }
});

test('speech resuming after a finalized greeting cancels its quiet handoff', async () => {
  jest.useFakeTimers();
  const x = setup('android');
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  try {
    await controller.start('ko-KR');
    x.emit('result', { isFinal: true, results: [{ transcript: '안녕' }] });
    x.emit('speechend');
    await jest.advanceTimersByTimeAsync(800);
    x.emit('speechstart');
    x.emit('result', { isFinal: false, results: [{ transcript: '근처' }] });
    await jest.advanceTimersByTimeAsync(3000);
    expect(x.module.stop).not.toHaveBeenCalled();
    expect(delivered).not.toHaveBeenCalled();
  } finally { controller.dispose(); jest.useRealTimers(); }
});

test.each([['android', 33, true], ['android', 32, false], ['ios', 0, false]] as const)(
  'PCM VAD capability is limited to Android 13+: %s API %s', async (platform, api, enabled) => {
    const x = setup(platform, api, true);
    const controller = createVoiceInputController(x.adapter, jest.fn(() => 'localOnly'));
    await controller.start('ko-KR');
    expect(x.module.start).toHaveBeenCalledWith(expect.objectContaining({ pingdyVadEnabled: enabled }));
    expect(x.listeners.has('vadactivity')).toBe(enabled);
    controller.dispose();
  });

test('PCM VAD owns acoustic edges; greeting ends at one second including native debounce', async () => {
  jest.useFakeTimers();
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  try {
    await controller.start('ko-KR');
    x.emit('vadactivity', { speaking: true, quietForMs: 0 });
    x.emit('result', { isFinal: true, results: [{ transcript: '안녕' }] });
    x.emit('speechend');
    x.emit('volumechange', { value: -1 });
    await jest.advanceTimersByTimeAsync(5000);
    expect(delivered).not.toHaveBeenCalled();
    x.emit('vadactivity', { speaking: false, quietForMs: 200 });
    await jest.advanceTimersByTimeAsync(799);
    expect(delivered).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(delivered).toHaveBeenCalledTimes(1);
    expect(x.module.abort).toHaveBeenCalledTimes(1);
  } finally { controller.dispose(); jest.useRealTimers(); }
});

test('uncertain utterance waits three seconds and VAD resumption resets the clock', async () => {
  jest.useFakeTimers();
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  try {
    await controller.start('ko-KR');
    x.emit('result', { isFinal: true, results: [{ transcript: '내일…' }] });
    x.emit('vadactivity', { speaking: false, quietForMs: 200 });
    await jest.advanceTimersByTimeAsync(2000);
    expect(delivered).not.toHaveBeenCalled();
    x.emit('vadactivity', { speaking: true, quietForMs: 0 });
    x.emit('result', { isFinal: false, results: [{ transcript: '오후 두 시에' }] });
    await jest.advanceTimersByTimeAsync(4000);
    expect(x.module.stop).not.toHaveBeenCalled();
    x.emit('vadactivity', { speaking: false, quietForMs: 200 });
    await jest.advanceTimersByTimeAsync(2799);
    expect(x.module.stop).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(x.module.stop).toHaveBeenCalledTimes(1);
    x.emit('result', { isFinal: true, results: [{ transcript: '오후 두 시에' }] });
    expect(delivered).toHaveBeenCalledWith(expect.objectContaining({ text: '내일… 오후 두 시에' }));
    expect(delivered).toHaveBeenCalledTimes(1);
  } finally { controller.dispose(); jest.useRealTimers(); }
});

test.each(['end', 'no-speech', 'speech-timeout'])('premature STT closure %s preserves stable text without auto submission', async name => {
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  await controller.start('ko-KR');
  x.emit('result', { isFinal: true, results: [{ transcript: '내일' }] });
  x.emit('result', { isFinal: false, results: [{ transcript: '오후' }] });
  const stale = x.listeners.get('vadactivity')?.[0];
  if (name === 'end') x.emit('end');
  else x.emit('error', { error: name });
  expect(controller.getSnapshot()).toMatchObject({ phase: 'error', error: 'interrupted', draft: '내일', partial: '', speaking: false });
  stale?.({ speaking: false, quietForMs: 200 } as never);
  expect(delivered).not.toHaveBeenCalled();
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  controller.edit('내일 오후 두 시');
  await controller.submit();
  expect(delivered).toHaveBeenCalledTimes(1);
  controller.dispose();
});

test('ongoing VAD activity cannot leave microphone open indefinitely', async () => {
  jest.useFakeTimers();
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  try {
    await controller.start('ko-KR');
    x.emit('vadactivity', { speaking: true, quietForMs: 0 });
    x.emit('result', { isFinal: false, results: [{ transcript: '소음' }] });
    await jest.advanceTimersByTimeAsync(60000);
    expect(x.module.abort).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot().phase).toBe('error');
    expect(delivered).not.toHaveBeenCalled();
  } finally { controller.dispose(); jest.useRealTimers(); }
});

test('VAD background teardown rejects late acoustic and transcript events', async () => {
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  await controller.start('ko-KR');
  const staleVad = x.listeners.get('vadactivity')?.[0];
  const staleResult = x.listeners.get('result')?.[0];
  controller.setForeground(false);
  staleVad?.({ speaking: false, quietForMs: 200 } as never);
  staleResult?.({ isFinal: true, results: [{ transcript: '안녕' }] } as never);
  expect(controller.getSnapshot()).toMatchObject({ phase: 'canceled', draft: '', speaking: false });
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  expect(x.listeners.get('vadactivity')).toHaveLength(0);
  expect(delivered).not.toHaveBeenCalled();
  controller.dispose();
});

test('native VAD failure releases microphone without sending an AI request', async () => {
  const x = setup('android', 33, true);
  const delivered = jest.fn(() => 'localOnly' as const);
  const controller = createVoiceInputController(x.adapter, delivered);
  await controller.start('ko-KR');
  x.emit('result', { isFinal: true, results: [{ transcript: '안녕' }] });
  x.emit('error', { error: 'audio-capture', message: 'PCM VAD failed' });
  expect(controller.getSnapshot()).toMatchObject({ phase: 'error', error: 'failed', speaking: false });
  expect(x.module.abort).toHaveBeenCalledTimes(1);
  expect(delivered).not.toHaveBeenCalled();
  controller.dispose();
});
