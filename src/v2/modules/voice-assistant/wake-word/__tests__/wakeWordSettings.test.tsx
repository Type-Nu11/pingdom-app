import React from 'react';
import { AppState } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { WakeWordProvider } from '../WakeWordProvider';
import { WakeWordSettingsControl } from '../WakeWordControl';
import { useForegroundWakeWord } from '../useForegroundWakeWord';
import type { WakeWordAdapter } from '../wakeWord';

const originalState = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = originalState; });

test('settings opt-in survives map unmount, captures only on map, and settings off stops future capture', async () => {
  const stop = jest.fn(async () => {});
  const onDetected = jest.fn();
  const callbacks: Array<Parameters<WakeWordAdapter['createSession']>[0]> = [];
  const adapter: WakeWordAdapter = { available: true, requestPermission: jest.fn(async () => 'granted' as const),
    createSession(options) { callbacks.push(options); return { start: async () => {}, stop }; },
  };
  function Map() {
    useForegroundWakeWord({ enabled: true, focused: true, accountId: 'user', assistantBusy: false }, onDetected);
    return null;
  }
  function App({ map }: { map: boolean }) {
    return <WakeWordProvider adapter={adapter}><WakeWordSettingsControl />{map ? <Map /> : null}</WakeWordProvider>;
  }
  const view = await renderWithProviders(<App map={false} />, { language: 'ko' });
  await fireEvent(screen.getByRole('switch'), 'valueChange', true);
  expect(adapter.requestPermission).not.toHaveBeenCalled();
  const didDismiss = screen.getByTestId('app-dialog-host').props.onDismiss;
  await fireEvent.press(screen.getByTestId('app-dialog-action-1'));
  await act(didDismiss);
  expect(screen.getByRole('switch', { checked: true })).toBeOnTheScreen();
  expect(callbacks).toHaveLength(0);
  await view.rerender(<App map />);
  await waitFor(() => expect(callbacks).toHaveLength(1));
  await view.rerender(<App map={false} />);
  await waitFor(() => expect(stop).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('switch', { checked: true })).toBeOnTheScreen();
  await act(() => callbacks[0].onDetected());
  expect(onDetected).not.toHaveBeenCalled();
  await view.rerender(<App map />);
  await waitFor(() => expect(callbacks).toHaveLength(2));
  await act(() => callbacks[1].onDetected());
  await waitFor(() => expect(onDetected).toHaveBeenCalledTimes(1));
  await fireEvent(screen.getByRole('switch'), 'valueChange', false);
  expect(screen.getByRole('switch', { checked: false })).toBeOnTheScreen();
  await view.rerender(<App map={false} />);
  await view.rerender(<App map />);
  expect(callbacks).toHaveLength(2);
});

test('settings keeps an unavailable native engine disabled', async () => {
  await renderWithProviders(<WakeWordProvider><WakeWordSettingsControl /></WakeWordProvider>, { language: 'en' });
  expect(screen.getByRole('switch')).toBeDisabled();
});
