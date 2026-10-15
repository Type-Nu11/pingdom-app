import { createSherpaWakeWordRuntime, isSherpaWakeWordReady, SHERPA_WAKE_WORD, type SherpaWakeWordNative } from '../sherpaWakeWordRuntime';

function setup() {
  let event: (value: unknown) => void = () => {};
  const removed = jest.fn();
  const events = { addListener: jest.fn((_name, callback) => { event = callback; return { remove: removed }; }) };
  const native: SherpaWakeWordNative = {
    getStatus: jest.fn(async () => ({ ready: true, ...SHERPA_WAKE_WORD })),
    isAudioAvailable: jest.fn(async () => true), initialize: jest.fn(async () => {}),
    start: jest.fn(async () => {}), stop: jest.fn(async () => {}), dispose: jest.fn(async () => {}),
  };
  const runtime = createSherpaWakeWordRuntime(native, events, async () => 'granted', true);
  const abort = new AbortController(); const detected = jest.fn(); const error = jest.fn();
  const options = { phrase: 'Hey Pingdy' as const, signal: abort.signal, onDetected: detected, onError: error };
  return { native, runtime, abort, detected, error, removed, options, emit: (value: unknown) => event(value) };
}

test('readiness requires the exact compiled engine, model and complete phrase', () => {
  expect(isSherpaWakeWordReady({ ready: true, ...SHERPA_WAKE_WORD })).toBe(true);
  expect(isSherpaWakeWordReady({ ready: false, ...SHERPA_WAKE_WORD })).toBe(false);
  for (const mismatch of [{ phrase: 'Pingdy' }, { modelId: 'gigaspeech' }, { engineVersion: 'other' }]) {
    expect(isSherpaWakeWordReady({ ready: true, ...SHERPA_WAKE_WORD, ...mismatch })).toBe(false);
  }
});

test('only the full matching keyword from the current native session can activate STT', async () => {
  const x = setup(); const detector = await x.runtime.createDetector(x.options);
  const id = (x.native.initialize as jest.Mock).mock.calls[0][0];
  expect(x.native.initialize).toHaveBeenCalledWith(id, 'Hey Pingdy');
  x.emit({ sessionId: id, type: 'detected', keyword: 'Pingdy' });
  x.emit({ sessionId: 'old-session', type: 'detected', keyword: 'Hey_Pingdy' });
  expect(x.detected).not.toHaveBeenCalled();
  await detector.start();
  x.emit({ sessionId: id, type: 'detected', keyword: 'Hey_Pingdy' });
  expect(x.detected).toHaveBeenCalledTimes(1);
  await detector.stop(); await detector.dispose();
  x.emit({ sessionId: id, type: 'detected', keyword: 'Hey_Pingdy' });
  expect(x.detected).toHaveBeenCalledTimes(1);
  expect(x.removed).toHaveBeenCalledTimes(1);
});

test('aborting while native model loads disposes it without opening the microphone', async () => {
  const x = setup(); let loaded!: () => void;
  x.native.initialize = jest.fn(() => new Promise(resolve => { loaded = resolve; }));
  const creating = x.runtime.createDetector(x.options);
  x.abort.abort(); loaded();
  await expect(creating).rejects.toThrow('WAKE_WORD_CANCELED');
  expect(x.native.start).not.toHaveBeenCalled();
  expect(x.native.stop).toHaveBeenCalledTimes(1);
  expect(x.native.dispose).toHaveBeenCalledTimes(1);
  expect(x.removed).toHaveBeenCalledTimes(1);
});

test('initialization errors release the native session and detach its listener', async () => {
  const x = setup(); x.native.initialize = jest.fn(async () => { throw new Error('bad model'); });
  await expect(x.runtime.createDetector(x.options)).rejects.toThrow('bad model');
  expect(x.native.dispose).toHaveBeenCalledTimes(1);
  expect(x.removed).toHaveBeenCalledTimes(1);
});

test('native audio interruption is forwarded without replaying a detection', async () => {
  const x = setup(); const detector = await x.runtime.createDetector(x.options);
  const id = (x.native.initialize as jest.Mock).mock.calls[0][0];
  x.emit({ sessionId: id, type: 'error', reason: 'interrupted' });
  expect(x.error).toHaveBeenCalledWith('interrupted');
  expect(x.detected).not.toHaveBeenCalled();
  await detector.dispose(); await detector.dispose();
  expect(x.native.dispose).toHaveBeenCalledTimes(1);
});
