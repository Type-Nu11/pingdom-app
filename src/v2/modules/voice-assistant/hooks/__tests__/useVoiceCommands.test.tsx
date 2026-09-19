import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';
import * as hooks from '../useVoiceCommands';
import { VoiceSessionError } from '../../model/voiceSessionError';
import { createVoiceSessionApi } from '../../api/voiceSessionApi';

jest.mock('../../api/voiceSessionApi', () => ({ createVoiceSessionApi: jest.fn() }));
const factory = jest.mocked(createVoiceSessionApi);
const original = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = original; });
test('composes input, transport and command consumer; clears state on context/account change and background', async () => {
  const send = jest.fn(async () => ({ schemaVersion: 1 as const, id: 'input-2', kind: 'command_request' as const,
    command: 'searchNearbyReservablePlaces' as const, args: { date: '2026-09-20', startTime: '14:00', endTime: '17:00', quantity: 2, useCurrentLocation: true } }));
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send });
  const queryClient = new QueryClient();
  const callbacks = new Map<string, (s: AppStateStatus) => void>();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => { callbacks.set(event, callback); return { remove() {} }; });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const initialProps = { accountRevision: 'user' as string | null, location: null, locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true };
  const view = await renderHook((props: hooks.VoiceCommandContext) => hooks.useVoiceCommands(props), { wrapper, initialProps });
  await act(async () => { await view.result.current.onFinalInput({ text: 'find cafe', source: 'text', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: { outcome: { code: 'LOCATION_REQUIRED' } } });
  expect(send.mock.calls).toHaveLength(1);
  await view.rerender({ ...initialProps, radiusKm: 10 });
  expect(view.result.current.commandState).toEqual({ phase: 'idle' });
  await view.rerender({ ...initialProps, accountRevision: null });
  await act(async () => { await view.result.current.onFinalInput({ text: 'private input', source: 'text', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toMatchObject({ phase: 'error', code: 'AUTHENTICATION_REQUIRED' });
  expect(send.mock.calls).toHaveLength(1);
  await act(() => callbacks.get('change')?.('background'));
  expect(view.result.current.commandState.phase).toBe('canceled');
  await view.unmount(); queryClient.clear();
});

test('explicit transport retry becomes enabled after backoff without another user edit', async () => {
  jest.useFakeTimers();
  const queryClient = new QueryClient();
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send: async () => { throw new VoiceSessionError('NETWORK_ERROR'); } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null, locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  await act(async () => { await view.result.current.onFinalInput({ text: 'cafe', source: 'text', signal: new AbortController().signal }); });
  expect(view.result.current.retryReady).toBe(false);
  await act(async () => { await jest.advanceTimersByTimeAsync(1000); });
  expect(view.result.current.retryReady).toBe(true);
  await view.unmount(); queryClient.clear(); jest.useRealTimers();
});

test('provider unavailable is a safe error rather than a successful command or generic response error', async () => {
  const queryClient = new QueryClient();
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send: async () => ({ schemaVersion: 1, id: 'input-2', kind: 'protocol_error', code: 'PROVIDER_UNAVAILABLE' }) });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null, locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  await act(async () => { await view.result.current.onFinalInput({ text: 'cafe', source: 'text', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toEqual({ phase: 'error', code: 'PROVIDER_UNAVAILABLE' });
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  await view.unmount(); queryClient.clear();
});
