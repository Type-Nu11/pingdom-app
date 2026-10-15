import React from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { WakeWordProvider, type WakeWordAdapter } from '../../../../../voice-assistant';
import { MAP_ASSISTANT_INTRO_SEEN_KEY, useMapAssistantEntry } from '../useMapAssistantEntry';

const originalState = AppState.currentState;
beforeEach(async () => {
  (AppState as { currentState: string }).currentState = 'active';
  await AsyncStorage.setItem(MAP_ASSISTANT_INTRO_SEEN_KEY, '1');
});
afterEach(() => { (AppState as { currentState: string }).currentState = originalState; });

async function setup() {
  const callbacks: Array<Parameters<WakeWordAdapter['createSession']>[0]> = [];
  const stopped: jest.Mock[] = [];
  const adapter: WakeWordAdapter = { available: true, requestPermission: async () => 'granted',
    createSession(options) {
      callbacks.push(options);
      const stop = jest.fn(async () => {}); stopped.push(stop);
      return { start: async () => {}, stop };
    },
  };
  const wrapper = ({ children }: React.PropsWithChildren) => <WakeWordProvider adapter={adapter}>{children}</WakeWordProvider>;
  const rendered = await renderHook(({ focused, accountId }: { focused: boolean; accountId: string }) => useMapAssistantEntry(true, focused, accountId),
    { wrapper, initialProps: { focused: true, accountId: 'user' } });
  await act(() => rendered.result.current.wakeWord.enable());
  return { ...rendered, callbacks, stopped };
}

test('native wake event opens the existing assistant once after releasing capture', async () => {
  const x = await setup();
  expect(x.callbacks).toHaveLength(1);
  await act(() => { x.callbacks[0].onDetected(); x.callbacks[0].onDetected(); });
  await waitFor(() => expect(x.result.current.isOpen).toBe(true));
  expect(x.stopped[0]).toHaveBeenCalledTimes(1);
  expect(x.callbacks).toHaveLength(1);
  await x.unmount();
});

test('manual microphone entry preserves capture teardown before opening the assistant', async () => {
  const x = await setup();
  let release!: () => void;
  x.stopped[0].mockImplementation(() => new Promise<void>(resolve => { release = resolve; }));
  await act(() => x.result.current.open());
  expect(x.result.current.isOpen).toBe(false);
  await act(() => release());
  await waitFor(() => expect(x.result.current.isOpen).toBe(true));
  await x.unmount();
});

test('returning from an assistant uses cooldown before another keyword capture', async () => {
  jest.useFakeTimers();
  try {
    const x = await setup();
    await act(() => x.callbacks[0].onDetected());
    await act(() => x.result.current.close());
    expect(x.result.current.wakeWord.state.phase).toBe('cooldown');
    await act(() => jest.advanceTimersByTimeAsync(1999));
    expect(x.callbacks).toHaveLength(1);
    await act(() => jest.advanceTimersByTimeAsync(1));
    expect(x.callbacks).toHaveLength(2);
    await x.unmount();
  } finally { jest.useRealTimers(); }
});

test('Android blur releases capture and ignores late native detection', async () => {
  const events = new Map<string, (value: string) => void>();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
    events.set(event, listener as (value: string) => void);
    return { remove() { events.delete(event); } };
  });
  const x = await setup();
  await act(() => events.get('blur')?.(''));
  await act(() => x.callbacks[0].onDetected());
  expect(x.result.current.isOpen).toBe(false);
  expect(x.stopped[0]).toHaveBeenCalledTimes(1);
  expect(x.result.current.wakeWord.state.phase).toBe('suspended');
  await x.unmount();
});

test('account change closes pending input and requires new explicit wake opt-in', async () => {
  const x = await setup();
  await act(() => x.result.current.open());
  await x.rerender({ focused: true, accountId: 'other' });
  await act(() => x.callbacks[0].onDetected());
  expect(x.result.current.isOpen).toBe(false);
  expect(x.result.current.wakeWord.state.enabled).toBe(false);
  await x.unmount();
});
