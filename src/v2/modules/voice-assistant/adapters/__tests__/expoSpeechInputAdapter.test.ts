import { createVoiceInputController } from '../../model/voiceInput';
import { createExpoSpeechInputAdapter } from '../expoSpeechInputAdapter';
import { PermissionStatus } from 'expo-modules-core';

const permission = (status: 'granted' | 'denied' | 'undetermined', canAskAgain = status === 'undetermined', restricted = false) =>
  ({ status: status as PermissionStatus, granted: status === 'granted', canAskAgain, restricted, expires: 'never' as const });

function setup(platform: 'ios' | 'android' = 'ios', androidApiLevel = 33) {
  const listeners = new Map<string, Array<(value: never) => void>>();
  const removed: string[] = [];
  const module = {
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
