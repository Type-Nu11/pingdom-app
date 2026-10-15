import { createWakeWordController, type WakeWordAdapter, type WakeWordConditions } from '../wakeWord';

const active: WakeWordConditions = { foreground: true, focused: true, accountId: 'one', assistantBusy: false };
function setup() {
  const sessions: Array<{ detected: () => void; error: () => void; signal: AbortSignal; start: jest.Mock; stop: jest.Mock }> = [];
  const adapter: WakeWordAdapter = {
    available: true,
    requestPermission: async () => 'granted',
    createSession({ signal, onDetected, onError }) {
      const item = { detected: onDetected, error: () => onError('interrupted'), signal, start: jest.fn(async () => {}), stop: jest.fn(async () => {}) };
      sessions.push(item);
      return item;
    },
  };
  const open = jest.fn();
  const controller = createWakeWordController(adapter, open);
  controller.setConditions(active);
  return { controller, sessions, open, adapter };
}

test('capture requires explicit opt-in and a foreground focused authenticated map', async () => {
  const x = setup();
  expect(x.sessions).toHaveLength(0);
  x.controller.setConditions({ ...active, foreground: false });
  await x.controller.enable();
  expect(x.sessions).toHaveLength(0);
  x.controller.setConditions(active);
  await x.controller.settle();
  expect(x.controller.getSnapshot().phase).toBe('listening');
  await x.controller.dispose();
});

test('detection releases the microphone before opening once and ignores late callbacks', async () => {
  const x = setup();
  await x.controller.enable();
  let release!: () => void;
  x.sessions[0].stop.mockImplementation(() => new Promise<void>(resolve => { release = resolve; }));
  x.sessions[0].detected(); x.sessions[0].detected();
  await Promise.resolve();
  expect(x.open).not.toHaveBeenCalled();
  release();
  await x.controller.settle();
  expect(x.open).toHaveBeenCalledTimes(1);
  expect(x.sessions[0].signal.aborted).toBe(true);
  x.sessions[0].detected();
  expect(x.open).toHaveBeenCalledTimes(1);
  await x.controller.dispose();
});

test.each(['foreground', 'focused'] as const)('%s loss cancels recognition and rejects old detections', async field => {
  const x = setup();
  await x.controller.enable();
  x.controller.setConditions({ ...active, [field]: false });
  x.sessions[0].detected();
  await x.controller.settle();
  expect(x.sessions[0].stop).toHaveBeenCalledTimes(1);
  expect(x.open).not.toHaveBeenCalled();
  expect(x.controller.getSnapshot().phase).toBe('suspended');
  await x.controller.dispose();
});

test('stopping during permission request cannot start a late microphone session', async () => {
  const x = setup();
  let permission!: (value: 'granted') => void;
  x.adapter.requestPermission = () => new Promise(resolve => { permission = resolve; });
  const enabling = x.controller.enable();
  await Promise.resolve(); await Promise.resolve();
  await x.controller.disable();
  permission('granted'); await enabling;
  expect(x.sessions).toHaveLength(0);
  await x.controller.dispose();
});

test('manual entry waits for capture release and suppresses detection', async () => {
  const x = setup();
  await x.controller.enable();
  expect(await x.controller.prepareAssistant()).toBe(true);
  x.sessions[0].detected();
  expect(x.sessions[0].stop).toHaveBeenCalledTimes(1);
  expect(x.open).not.toHaveBeenCalled();
  await x.controller.dispose();
});

test('interruption requires explicit re-enable and does not restart on focus changes', async () => {
  const x = setup();
  await x.controller.enable(); x.sessions[0].error();
  x.controller.setConditions({ ...active, foreground: false });
  x.controller.setConditions(active);
  await x.controller.settle();
  expect(x.controller.getSnapshot().phase).toBe('error');
  expect(x.sessions).toHaveLength(1);
  await x.controller.dispose();
});

test('account replacement revokes opt-in and callbacks from the previous account', async () => {
  const x = setup();
  await x.controller.enable();
  x.controller.setConditions({ ...active, accountId: 'two' });
  x.sessions[0].detected(); await x.controller.settle();
  expect(x.controller.getSnapshot().enabled).toBe(false);
  expect(x.open).not.toHaveBeenCalled();
  await x.controller.dispose();
});

test('native stop failure fails closed for both manual handoff and detection', async () => {
  const x = setup();
  await x.controller.enable();
  x.sessions[0].stop.mockRejectedValue(new Error('busy'));
  expect(await x.controller.prepareAssistant()).toBe(false);
  expect(x.controller.getSnapshot().phase).toBe('error');
  expect(x.open).not.toHaveBeenCalled();
  await x.controller.dispose();
});

test('unavailable engine never requests microphone permission', async () => {
  const x = setup();
  Object.defineProperty(x.adapter, 'available', { value: false });
  const permission = jest.spyOn(x.adapter, 'requestPermission');
  await x.controller.enable();
  expect(x.controller.getSnapshot().phase).toBe('unavailable');
  expect(permission).not.toHaveBeenCalled();
  await x.controller.dispose();
});

test('repeated enable while permission is pending creates only one capture', async () => {
  const x = setup();
  await Promise.all([x.controller.enable(), x.controller.enable(), x.controller.enable()]);
  expect(x.sessions).toHaveLength(1);
  await x.controller.dispose();
});

test.each(['denied', 'blocked', 'restricted'] as const)('%s permission cannot open capture', async permission => {
  const x = setup(); x.adapter.requestPermission = async () => permission;
  await x.controller.enable();
  expect(x.sessions).toHaveLength(0);
  expect(x.controller.getSnapshot()).toMatchObject({ phase: 'error', enabled: false, error: 'permission' });
  await x.controller.dispose();
});

test('foreground loss during detection teardown suppresses opening and can resume later', async () => {
  const x = setup(); await x.controller.enable();
  let release!: () => void;
  x.sessions[0].stop.mockImplementation(() => new Promise<void>(resolve => { release = resolve; }));
  x.sessions[0].detected(); await Promise.resolve();
  x.controller.setConditions({ ...active, foreground: false });
  release(); await x.controller.settle();
  expect(x.open).not.toHaveBeenCalled();
  x.controller.setConditions(active); await x.controller.settle();
  expect(x.sessions).toHaveLength(2);
  await x.controller.dispose();
});
