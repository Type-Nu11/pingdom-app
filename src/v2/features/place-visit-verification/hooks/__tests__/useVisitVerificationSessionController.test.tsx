import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useVisitVerificationSessionController } from '../useVisitVerificationSessionController';
import {
  clearActiveForegroundVisitVerificationSession,
  rememberActiveForegroundVisitVerificationSession,
} from '../../model/visitVerificationSession';

const mockStartMutateAsync = jest.fn();
const mockForegroundStartMutateAsync = jest.fn();
const mockRecoverMutateAsync = jest.fn();
const mockObservationMutateAsync = jest.fn();
const originalAppState = AppState.currentState;

jest.mock('../useVisitVerificationSessionMutations', () => ({
  useStartVisitVerificationSession: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockStartMutateAsync,
  }),
  useStartForegroundVisitVerificationSession: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockForegroundStartMutateAsync,
  }),
  useRecoverVisitVerificationSession: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockRecoverMutateAsync,
  }),
  useSubmitVisitVerificationObservation: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockObservationMutateAsync,
  }),
}));

const coordinate = {
  accuracyMeters: 4.2,
  latitude: 35.1,
  longitude: 128.1,
  observedAt: '2026-09-02T01:00:00Z',
};
const inProgress = {
  id: 9201,
  placeId: 17,
  status: 'IN_PROGRESS' as const,
  requiredRadiusMeters: 24,
  requiredDwellSeconds: 75,
  remainingSeconds: 45,
  nextObservationRecommendedAt: '2026-09-02T01:00:15Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  clearActiveForegroundVisitVerificationSession();
  (AppState as unknown as { currentState: AppStateStatus }).currentState = 'active';
  mockStartMutateAsync.mockResolvedValue(inProgress);
  mockForegroundStartMutateAsync.mockResolvedValue(inProgress);
  mockRecoverMutateAsync.mockResolvedValue(inProgress);
  mockObservationMutateAsync.mockResolvedValue({
    ...inProgress,
    status: 'COMPLETED',
    remainingSeconds: 0,
    nextObservationRecommendedAt: null,
    completedCheckInId: 7002,
    reviewEligible: true,
  });
});

test('foreground start omits placeId, coalesces rapid calls, and preserves server policy', async () => {
  const alternatePolicy = {
    ...inProgress,
    placeId: 88,
    requiredRadiusMeters: 240,
    requiredDwellSeconds: 12,
    verifiedDwellSeconds: 4,
    remainingSeconds: 8,
    nextObservationRecommendedAt: null,
  };
  mockForegroundStartMutateAsync.mockResolvedValue(alternatePolicy);
  const getLocation = jest.fn().mockResolvedValue({ status: 'granted', coordinate });
  const view = await renderHook(() => useVisitVerificationSessionController(
    { mode: 'foreground' },
    { getLocation },
  ));

  await act(async () => {
    const first = view.result.current.start();
    const second = view.result.current.start();
    await Promise.all([first, second]);
  });

  expect(getLocation).toHaveBeenCalledTimes(1);
  expect(mockForegroundStartMutateAsync).toHaveBeenCalledTimes(1);
  expect(mockStartMutateAsync).not.toHaveBeenCalled();
  expect(mockForegroundStartMutateAsync.mock.calls[0][0].body).toEqual(coordinate);
  expect(mockForegroundStartMutateAsync.mock.calls[0][0].body).not.toHaveProperty('placeId');
  expect(view.result.current.session).toEqual(alternatePolicy);
  expect(view.result.current.displayRemainingSeconds).toBe(8);
  view.unmount();
});

test('foreground screen reentry recovers the remembered session without starting another one', async () => {
  rememberActiveForegroundVisitVerificationSession(inProgress);
  const recovered = { ...inProgress, verifiedDwellSeconds: 35, remainingSeconds: 40 };
  mockRecoverMutateAsync.mockResolvedValue(recovered);
  const view = await renderHook(() => useVisitVerificationSessionController(
    { mode: 'foreground' },
  ));

  await act(async () => { await Promise.resolve(); });

  expect(mockRecoverMutateAsync).toHaveBeenCalledWith({
    sessionId: 9201,
    signal: expect.any(AbortSignal),
  });
  expect(mockForegroundStartMutateAsync).not.toHaveBeenCalled();
  expect(view.result.current.session).toEqual(recovered);
  view.unmount();
});

test('foreground resume refreshes server status before scheduling more observations', async () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    appStateListener = listener;
    return { remove: jest.fn() };
  });
  const completed = {
    ...inProgress,
    status: 'COMPLETED' as const,
    completedCheckInId: 7002,
    remainingSeconds: 0,
    nextObservationRecommendedAt: null,
  };
  mockRecoverMutateAsync.mockResolvedValue(completed);
  const view = await renderHook(() => useVisitVerificationSessionController(
    { mode: 'foreground' },
    { getLocation: jest.fn().mockResolvedValue({ status: 'granted', coordinate }) },
  ));
  await act(async () => { await view.result.current.start(); });

  await act(async () => { appStateListener?.('background'); });
  expect(view.result.current.phase).toBe('paused');
  await act(async () => {
    appStateListener?.('active');
    await Promise.resolve();
  });

  await waitFor(() => expect(view.result.current.session).toEqual(completed));
  expect(mockRecoverMutateAsync).toHaveBeenCalledTimes(1);
  view.unmount();
});

test('unmount aborts an in-flight foreground start request', async () => {
  mockForegroundStartMutateAsync.mockImplementation(() => new Promise(() => undefined));
  const view = await renderHook(() => useVisitVerificationSessionController(
    { mode: 'foreground' },
    { getLocation: jest.fn().mockResolvedValue({ status: 'granted', coordinate }) },
  ));

  await act(async () => {
    void view.result.current.start();
    await Promise.resolve();
  });
  const signal = mockForegroundStartMutateAsync.mock.calls[0][0].signal as AbortSignal;
  await act(async () => { view.unmount(); });
  expect(signal.aborted).toBe(true);
});

test('logout boundary aborts foreground work and clears the active controller session', async () => {
  mockForegroundStartMutateAsync.mockImplementation(() => new Promise(() => undefined));
  const view = await renderHook(() => useVisitVerificationSessionController(
    { mode: 'foreground' },
    { getLocation: jest.fn().mockResolvedValue({ status: 'granted', coordinate }) },
  ));

  await act(async () => {
    void view.result.current.start();
    await Promise.resolve();
  });
  const signal = mockForegroundStartMutateAsync.mock.calls[0][0].signal as AbortSignal;

  await act(async () => clearActiveForegroundVisitVerificationSession());

  expect(signal.aborted).toBe(true);
  expect(view.result.current.session).toBeNull();
  expect(view.result.current.phase).toBe('unauthenticated');
  view.unmount();
});

afterEach(() => {
  (AppState as unknown as { currentState: AppStateStatus }).currentState = originalAppState;
  jest.restoreAllMocks();
});

test('rapid start calls coalesce and schedule only at the server recommendation', async () => {
  const getLocation = jest.fn().mockResolvedValue({ status: 'granted', coordinate });
  const scheduled: Array<() => void> = [];
  const setTimer = jest.fn((callback: () => void) => {
    scheduled.push(callback);
    return 1 as unknown as ReturnType<typeof setTimeout>;
  });
  const dependencies = {
    clearTimer: jest.fn(),
    getLocation,
    now: () => Date.parse('2026-09-02T01:00:00Z'),
    setTimer,
  };
  const view = await renderHook(() => useVisitVerificationSessionController(17, dependencies));

  await act(async () => {
    const first = view.result.current.start();
    const second = view.result.current.start();
    await Promise.all([first, second]);
  });

  expect(getLocation).toHaveBeenCalledTimes(1);
  expect(mockStartMutateAsync).toHaveBeenCalledTimes(1);
  expect(mockStartMutateAsync.mock.calls[0][0].body).toEqual({ placeId: 17, ...coordinate });
  expect(setTimer).toHaveBeenCalledWith(expect.any(Function), 15_000);
  expect(scheduled).toHaveLength(1);
  view.unmount();
});

test('overlapping scheduled observations are blocked and background aborts the request', async () => {
  let appStateListener: ((state: AppStateStatus) => void) | undefined;
  const removeAppStateListener = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    appStateListener = listener;
    return { remove: removeAppStateListener };
  });
  let resolveObservation!: (value: typeof inProgress) => void;
  mockObservationMutateAsync.mockImplementation(() => new Promise((resolve) => {
    resolveObservation = resolve;
  }));
  const scheduled: Array<() => void> = [];
  const clearTimer = jest.fn();
  const dependencies = {
    clearTimer,
    getLocation: jest.fn().mockResolvedValue({ status: 'granted', coordinate }),
    now: () => Date.parse('2026-09-02T01:00:00Z'),
    setTimer: (callback: () => void) => {
      scheduled.push(callback);
      return 2 as unknown as ReturnType<typeof setTimeout>;
    },
  };
  const view = await renderHook(() => useVisitVerificationSessionController(17, dependencies));
  await act(async () => { await view.result.current.start(); });

  await act(async () => {
    scheduled[0]();
    scheduled[0]();
    await Promise.resolve();
  });
  expect(mockObservationMutateAsync).toHaveBeenCalledTimes(1);
  const signal = mockObservationMutateAsync.mock.calls[0][0].signal as AbortSignal;

  await act(async () => { appStateListener?.('background'); });
  expect(signal.aborted).toBe(true);
  expect(view.result.current.phase).toBe('paused');

  await act(async () => { resolveObservation(inProgress); });
  expect(view.result.current.phase).toBe('paused');
  view.unmount();
  expect(removeAppStateListener).toHaveBeenCalled();
});
