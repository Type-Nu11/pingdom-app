import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';
import * as hooks from '../useVoiceCommands';
import { VoiceSessionError } from '../../model/voiceSessionError';
import { createVoiceSessionApi } from '../../api/voiceSessionApi';
import * as commands from '../../model/voiceCommands';
import { prepareVoiceReservationDraft } from '../../model/reservationDraft';
import { draftQuote } from '../../model/__tests__/reservationDraft.fixture';
import type { AppCommandResult, VoiceAvailabilityFacts } from '../../model/voiceAssistantCommand.types';

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

test.each(['expiry', 'background', 'context', 'cancel'] as const)('a displayed draft is invalidated by %s without any mutation', async reason => {
  jest.useFakeTimers(); jest.setSystemTime(new Date('2026-09-20T00:00:00Z'));
  const quote = draftQuote({ expiresAt: '2026-09-20T00:00:03Z' });
  const c = quote.confirmation!;
  const draft = prepareVoiceReservationDraft(quote, {
    place: { id: 1, name: 'Cafe', address: 'Seoul', touristCategories: ['CAFE'], operatingStatus: 'OPERATING' },
    availability: { id: c.availabilityId, placeId: c.placeId, productId: null, productName: null, productType: 'GENERAL',
      startsAt: c.startsAt, endsAt: c.endsAt, remainingCapacity: 3, status: 'ACTIVE' } as VoiceAvailabilityFacts,
    date: '2026-09-20', timezone: 'Asia/Seoul', quantity: 2, availabilityDataUpdatedAt: Date.now(),
  }, Date.now());
  const prepared: AppCommandResult = { schemaVersion: 1, source: 'app', kind: 'command_result', id: 'app-result-test',
    commandId: 'input-2', command: 'prepareReservation', outcome: { status: 'succeeded', data: { draft } } };
  const realDispatcher = commands.createVoiceCommandDispatcher;
  // The model integration tests validate the real dispatcher. Here only its publication is controlled to exercise UI lifecycle.
  jest.spyOn(commands, 'createVoiceCommandDispatcher').mockImplementation(options => ({
    ...realDispatcher(options), consume: async () => options.publish(prepared),
  }));
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: '2026-09-20T00:05:00Z' }),
    refresh: jest.fn(), close: jest.fn(), send: async () => ({ schemaVersion: 1, id: 'input-2', kind: 'command_request',
      command: 'prepareReservation', args: { placeId: 1, availabilityId: 10, quantity: 2 } }) });
  const callbacks = new Map<string, (s: AppStateStatus) => void>();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => { callbacks.set(event, callback); return { remove() {} }; });
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const initialProps = { accountRevision: 'user', location: null, locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true };
  const view = await renderHook((props: hooks.VoiceCommandContext) => hooks.useVoiceCommands(props), { wrapper, initialProps });
  await act(async () => { await view.result.current.onFinalInput({ text: 'prepare', source: 'text', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: { outcome: { status: 'succeeded' } } });
  if (reason === 'expiry') {
    await act(async () => { await jest.advanceTimersByTimeAsync(2999); });
    expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: { outcome: { status: 'succeeded' } } });
    jest.setSystemTime(new Date('2026-09-19T00:00:00Z')); // Moving the wall clock back cannot prolong a quote.
    await act(async () => { await jest.advanceTimersByTimeAsync(1); });
    expect(view.result.current.commandState).toMatchObject({ phase: 'result', result: { outcome: { status: 'rejected', code: 'STALE_CONTEXT' } } });
  } else if (reason === 'background') {
    await act(() => callbacks.get('change')?.('background'));
    expect(view.result.current.commandState.phase).toBe('canceled');
  } else if (reason === 'context') {
    await view.rerender({ ...initialProps, radiusKm: 10 });
    expect(view.result.current.commandState.phase).toBe('idle');
  } else {
    await act(() => view.result.current.cancel());
    expect(view.result.current.commandState.phase).toBe('canceled');
  }
  expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  await view.unmount(); queryClient.clear(); jest.useRealTimers();
});


test('an assistant reply retains actual provider text without running a command or reservation mutation', async () => {
  const queryClient = new QueryClient();
  factory.mockReturnValue({ create: async () => ({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }),
    refresh: jest.fn(), close: jest.fn(), send: async () => ({ schemaVersion: 1, id: 'input-2', kind: 'assistant_message', text: '안녕하세요! 반가워요.' }) });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null,
    locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  await act(async () => { await view.result.current.onFinalInput({ text: '안녕', source: 'voice', signal: new AbortController().signal }); });
  expect(view.result.current.commandState).toEqual({ phase: 'assistant', text: '안녕하세요! 반가워요.' });
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  await view.unmount(); queryClient.clear();
});

test('session creation and AI response waiting stay processing until clarification arrives', async () => {
  const queryClient = new QueryClient();
  let resolveCreate!: (value: { sessionId: string; expiresAt: string }) => void;
  let resolveSend!: (value: { schemaVersion: 1; id: string; kind: 'clarification_request'; field: 'date'; text: string }) => void;
  const create = new Promise<{ sessionId: string; expiresAt: string }>(resolve => { resolveCreate = resolve; });
  const response = new Promise<{ schemaVersion: 1; id: string; kind: 'clarification_request'; field: 'date'; text: string }>(resolve => { resolveSend = resolve; });
  factory.mockReturnValue({ create: () => create, refresh: jest.fn(), close: jest.fn(), send: () => response });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const view = await renderHook(() => hooks.useVoiceCommands({ accountRevision: 'user', location: null,
    locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true }), { wrapper });
  let pending!: ReturnType<typeof view.result.current.onFinalInput>;
  await act(async () => {
    pending = view.result.current.onFinalInput({ text: '근처 카페 찾아줘', source: 'voice', signal: new AbortController().signal });
  });
  expect(view.result.current.commandState).toEqual({ phase: 'processing' });
  await act(async () => { resolveCreate({ sessionId: 's', expiresAt: new Date(Date.now() + 300000).toISOString() }); });
  expect(view.result.current.commandState).toEqual({ phase: 'processing' });
  await act(async () => {
    resolveSend({ schemaVersion: 1, id: 'input-2', kind: 'clarification_request', field: 'date', text: '며칠에 방문하시나요?' });
    await pending;
  });
  expect(view.result.current.commandState).toEqual({ phase: 'clarification', field: 'date' });
  await act(() => view.result.current.cancel());
  expect(view.result.current.commandState).toEqual({ phase: 'canceled' });
  await view.unmount(); queryClient.clear();
});
