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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
  return { promise, resolve };
}
async function renderCommands() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null,
    locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  return { view, queryClient };
}

test('editing feedback during a transport retry cancels the turn and discards its late response', async () => {
  jest.useFakeTimers();
  const late = deferred<{ schemaVersion: 1; id: string; kind: 'clarification_request'; field: 'date'; text: string }>();
  const send = jest.fn().mockRejectedValueOnce(new VoiceSessionError('NETWORK_ERROR')).mockReturnValueOnce(late.promise);
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send });
  const { view, queryClient } = await renderCommands();
  await act(async () => { await view.result.current.onFinalInput({ text: 'cafe', source: 'text', signal: new AbortController().signal }); });
  await act(async () => { await jest.advanceTimersByTimeAsync(1000); });
  let retry!: Promise<void>;
  await act(async () => { retry = view.result.current.retry(); });
  const signal = send.mock.calls[1][2] as AbortSignal;
  await act(() => view.result.current.dismissFeedback());
  expect(signal.aborted).toBe(true);
  await act(async () => {
    late.resolve({ schemaVersion: 1, id: 'input-2', kind: 'clarification_request', field: 'date', text: 'date?' });
    await retry;
  });
  expect(view.result.current.commandState).toEqual({ phase: 'idle' });
  expect(view.result.current.retryAvailable).toBe(false);
  expect(queryClient.getMutationCache().getAll()).toEqual([]);
  await view.unmount(); queryClient.clear(); jest.useRealTimers();
});

test('superseded session creation cannot replace the latest processing state with an error', async () => {
  const first = deferred<{ sessionId: string; expiresAt: string }>();
  const second = deferred<{ sessionId: string; expiresAt: string }>();
  const create = jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  factory.mockReturnValue({ create, refresh: jest.fn(), close: jest.fn(), send: async (_id, body) =>
    ({ schemaVersion: 1, id: body.requestId, kind: 'assistant_message', text: 'advisory' }) });
  const { view, queryClient } = await renderCommands();
  let old!: Promise<'accepted' | 'localOnly'>; let latest!: Promise<'accepted' | 'localOnly'>;
  await act(async () => {
    old = Promise.resolve(view.result.current.onFinalInput({ text: 'old', source: 'text', signal: new AbortController().signal }));
    latest = Promise.resolve(view.result.current.onFinalInput({ text: 'latest', source: 'text', signal: new AbortController().signal }));
    await old;
  });
  expect(view.result.current.commandState).toEqual({ phase: 'processing' });
  await act(async () => {
    second.resolve({ sessionId: 'latest', expiresAt: new Date(Date.now() + 300000).toISOString() });
    await latest;
    first.resolve({ sessionId: 'old', expiresAt: new Date(Date.now() + 300000).toISOString() });
  });
  expect(view.result.current.commandState).toEqual({ phase: 'advisory' });
  await view.unmount(); queryClient.clear();
});

test('background during session creation remains canceled after startup settles', async () => {
  const creation = deferred<{ sessionId: string; expiresAt: string }>();
  const callbacks = new Map<string, (s: AppStateStatus) => void>();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => { callbacks.set(event, callback); return { remove() {} }; });
  const send = jest.fn();
  factory.mockReturnValue({ create: () => creation.promise, refresh: jest.fn(), close: jest.fn(), send });
  const { view, queryClient } = await renderCommands();
  let pending!: Promise<'accepted' | 'localOnly'>;
  await act(async () => {
    pending = Promise.resolve(view.result.current.onFinalInput({ text: 'cafe', source: 'text', signal: new AbortController().signal }));
  });
  expect(view.result.current.commandState.phase).toBe('processing');
  await act(async () => { callbacks.get('change')?.('background'); await pending; });
  expect(view.result.current.commandState).toEqual({ phase: 'canceled' });
  await act(async () => { creation.resolve({ sessionId: 'late', expiresAt: new Date(Date.now() + 300000).toISOString() }); });
  expect(send).not.toHaveBeenCalled();
  await view.unmount(); queryClient.clear();
});
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

test('unsupported request shows recoverable feedback without retrying the submitted turn', async () => {
  const queryClient = new QueryClient();
  const send = jest.fn(async () => ({ schemaVersion: 1 as const, id: 'input-2', kind: 'protocol_error' as const, code: 'UNSUPPORTED_REQUEST' as const }));
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null,
    locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  await act(async () => { await view.result.current.onFinalInput({ text: 'unexpected phrase', source: 'voice', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toEqual({ phase: 'unrecognized' });
  expect(send).toHaveBeenCalledTimes(1);
  await act(() => view.result.current.dismissFeedback());
  expect(view.result.current.commandState).toEqual({ phase: 'idle' });
  expect(send).toHaveBeenCalledTimes(1);
  await view.unmount(); queryClient.clear();
});
