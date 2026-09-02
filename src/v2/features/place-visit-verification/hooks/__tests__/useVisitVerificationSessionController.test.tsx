import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useVisitVerificationSessionController } from '../useVisitVerificationSessionController';

const mockStartMutateAsync = jest.fn();
const mockObservationMutateAsync = jest.fn();
const originalAppState = AppState.currentState;

jest.mock('../useVisitVerificationSessionMutations', () => ({
  useStartVisitVerificationSession: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockStartMutateAsync,
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
  (AppState as unknown as { currentState: AppStateStatus }).currentState = 'active';
  mockStartMutateAsync.mockResolvedValue(inProgress);
  mockObservationMutateAsync.mockResolvedValue({
    ...inProgress,
    status: 'COMPLETED',
    remainingSeconds: 0,
    nextObservationRecommendedAt: null,
    completedCheckInId: 7002,
    reviewEligible: true,
  });
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
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    appStateListener = listener;
    return { remove: jest.fn() };
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
  expect(clearTimer).toHaveBeenCalled();
});
