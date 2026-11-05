import React, { type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { WakeWordProvider, useWakeWordSettings } from '../WakeWordProvider';
import { unavailableWakeWordAdapter, type WakeWordAdapter } from '../wakeWord';

function setup() {
  const adapter: WakeWordAdapter = {
    available: true,
    requestPermission: jest.fn(async () => 'granted'),
    createSession: jest.fn(() => ({ start: async () => {}, stop: async () => {} })),
  };
  let currentAdapter = adapter;
  const wrapper = ({ children }: PropsWithChildren) => <WakeWordProvider adapter={currentAdapter}>{children}</WakeWordProvider>;
  return { adapter, wrapper, setAdapter(next: WakeWordAdapter) { currentAdapter = next; } };
}

test('explicit opt-in survives a complete provider restart; explicit off also survives restart', async () => {
  const { adapter, wrapper } = setup();
  const first = await renderHook(useWakeWordSettings, { wrapper });
  await act(() => first.result.current.enable());
  await first.unmount();

  const second = await renderHook(useWakeWordSettings, { wrapper });
  await waitFor(() => expect(second.result.current.state.enabled).toBe(true));
  // Restoring a preference outside the map must not capture or request permission.
  expect(adapter.createSession).not.toHaveBeenCalled();
  expect(adapter.requestPermission).not.toHaveBeenCalled();
  await act(() => second.result.current.disable());
  await second.unmount();

  const third = await renderHook(useWakeWordSettings, { wrapper });
  await act(async () => {});
  expect(third.result.current.state.enabled).toBe(false);
});

test('native engine initialization does not erase the saved opt-in', async () => {
  const { adapter, wrapper, setAdapter } = setup();
  const first = await renderHook(useWakeWordSettings, { wrapper });
  await act(() => first.result.current.enable());
  await first.unmount();

  setAdapter(unavailableWakeWordAdapter);
  const restarted = await renderHook(useWakeWordSettings, { wrapper });
  await act(async () => {});
  expect(restarted.result.current.available).toBe(false);
  setAdapter(adapter);
  await restarted.rerender({});
  await waitFor(() => expect(restarted.result.current.state.enabled).toBe(true));
});

test('a delayed saved opt-in cannot overwrite the user switching off during startup', async () => {
  const { wrapper } = setup();
  let resolveRead!: (value: string | null) => void;
  jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(() => new Promise(resolve => { resolveRead = resolve; }));
  const app = await renderHook(useWakeWordSettings, { wrapper });
  await act(() => app.result.current.disable());
  await act(async () => { resolveRead('true'); });
  expect(app.result.current.state.enabled).toBe(false);
  await app.unmount();
  const restarted = await renderHook(useWakeWordSettings, { wrapper });
  await act(async () => {});
  expect(restarted.result.current.state.enabled).toBe(false);
});
