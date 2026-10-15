import { createLocalWakeWordAdapter, type LocalKeywordDetector, type LocalWakeWordRuntime } from '../localWakeWordAdapter';

function setup() {
  const detector: LocalKeywordDetector = { start: jest.fn(async () => {}), stop: jest.fn(async () => {}), dispose: jest.fn(async () => {}) };
  const runtime: LocalWakeWordRuntime = { ready: true, requestPermission: async () => 'granted', isAudioAvailable: async () => true,
    createDetector: jest.fn(async () => detector) };
  const adapter = createLocalWakeWordAdapter(runtime);
  const abort = new AbortController();
  const detected = jest.fn(); const error = jest.fn();
  const session = adapter.createSession({ signal: abort.signal, onDetected: detected, onError: error });
  return { detector, runtime, adapter, abort, detected, error, session };
}

test('native model loaded after cancellation is disposed without starting capture', async () => {
  const x = setup();
  let loaded!: (detector: LocalKeywordDetector) => void;
  x.runtime.createDetector = () => new Promise(resolve => { loaded = resolve; });
  const start = x.session.start(); await Promise.resolve();
  x.abort.abort();
  loaded(x.detector); await start; await x.session.stop();
  expect(x.detector.start).not.toHaveBeenCalled();
  expect(x.detector.stop).toHaveBeenCalledTimes(1);
  expect(x.detector.dispose).toHaveBeenCalledTimes(1);
});

test('native initialization and stop are serialized and disposal is idempotent', async () => {
  const x = setup();
  let started!: () => void;
  x.detector.start = jest.fn(() => new Promise(resolve => { started = resolve; }));
  const start = x.session.start(); await Promise.resolve(); await Promise.resolve();
  const stop = x.session.stop();
  expect(x.detector.stop).not.toHaveBeenCalled();
  started(); await start; await stop; await x.session.stop();
  expect(x.detector.stop).toHaveBeenCalledTimes(1);
  expect(x.detector.dispose).toHaveBeenCalledTimes(1);
});

test('conflicting audio prevents initialization rather than stealing the microphone', async () => {
  const x = setup(); x.runtime.isAudioAvailable = async () => false;
  await expect(x.session.start()).rejects.toThrow('WAKE_WORD_UNAVAILABLE');
  expect(x.runtime.createDetector).not.toHaveBeenCalled();
  await x.session.stop();
});

test('startup errors still release native resources', async () => {
  const x = setup(); x.detector.start = jest.fn(async () => { throw new Error('capture'); });
  await expect(x.session.start()).rejects.toThrow('capture');
  await x.session.stop();
  expect(x.detector.dispose).toHaveBeenCalledTimes(1);
});

test('native detections/errors after stop cannot activate or interrupt another session', async () => {
  const x = setup();
  const create = jest.spyOn(x.runtime, 'createDetector');
  await x.session.start();
  const callbacks = create.mock.calls[0][0];
  callbacks.onDetected();
  expect(x.detected).toHaveBeenCalledTimes(1);
  await x.session.stop();
  callbacks.onDetected(); callbacks.onError('interrupted');
  expect(x.detected).toHaveBeenCalledTimes(1);
  expect(x.error).not.toHaveBeenCalled();
});
