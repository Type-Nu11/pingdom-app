import { act, cleanup, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { ApiError } from '../../../../shared/api/ApiError';
import { clearActiveForegroundVisitVerificationSession } from '../model/visitVerificationSession';
import { useForegroundVisitVerification } from '../hooks/useForegroundVisitVerification';

const mockClient = {};
const mockPermission = jest.fn();
const mockLocation = jest.fn();
const mockStart = jest.fn();
const mockObserve = jest.fn();
const mockRecover = jest.fn();
const mockApply = jest.fn();
const originalAppState = AppState.currentState;
let changeState: (state: AppStateStatus) => void;

jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => mockClient }));
jest.mock('../../../../shared/location/foregroundPermission', () => ({
  foregroundPermission: { get: () => mockPermission() },
}));
jest.mock('../../../../shared/location/currentLocation', () => ({
  getCurrentCoordinate: () => mockLocation(),
}));
jest.mock('../api/visitVerificationApi', () => ({
  visitVerificationApi: {
    startForegroundSession: (...args: unknown[]) => mockStart(...args),
    submitObservation: (...args: unknown[]) => mockObserve(...args),
    getSession: (...args: unknown[]) => mockRecover(...args),
  },
}));
jest.mock('../hooks/useVisitVerificationSessionMutations', () => ({
  applyVisitVerificationSessionResult: (...args: unknown[]) => mockApply(...args),
}));

const inProgress = {
  id: 9201, placeId: 17, status: 'IN_PROGRESS' as const,
  requiredRadiusMeters: 500, requiredDwellSeconds: 30, remainingSeconds: 30,
  nextObservationRecommendedAt: '2026-09-30T00:00:30Z',
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-30T00:00:00Z'));
  jest.clearAllMocks();
  clearActiveForegroundVisitVerificationSession();
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
    changeState = (state) => { AppState.currentState = state; callback(state); };
    return { remove: jest.fn() };
  });
  mockPermission.mockResolvedValue({ status: 'granted' });
  mockLocation.mockImplementation(async () => ({
    status: 'granted',
    coordinate: { latitude: 35.1, longitude: 128.1, accuracyMeters: 4, observedAt: new Date().toISOString() },
  }));
  mockStart.mockResolvedValue(inProgress);
  mockRecover.mockResolvedValue(inProgress);
  mockObserve.mockResolvedValue({ ...inProgress, status: 'COMPLETED', completedCheckInId: 7002, remainingSeconds: 0 });
  mockApply.mockResolvedValue(undefined);
});

afterEach(async () => {
  await cleanup();
  AppState.currentState = originalAppState;
  jest.useRealTimers();
});

test('collects the 30-second stay and publishes the completed check-in without a button press', async () => {
  await renderHook(() => useForegroundVisitVerification());
  expect(mockStart).toHaveBeenCalledTimes(1);
  expect(mockObserve).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(29_999); });
  expect(mockObserve).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(1); });
  expect(mockObserve).toHaveBeenCalledWith(9201, expect.objectContaining({ observedAt: '2026-09-30T00:00:30.000Z' }), expect.any(AbortSignal));
  expect(mockApply).toHaveBeenLastCalledWith(mockClient, expect.objectContaining({ status: 'COMPLETED', completedCheckInId: 7002 }));
});

test('absence of a place retries discovery rather than creating a check-in', async () => {
  mockStart.mockRejectedValue(new ApiError('no place', { status: 404 }));
  await renderHook(() => useForegroundVisitVerification());
  expect(mockApply).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(10_000); });
  expect(mockStart).toHaveBeenCalledTimes(2);
  expect(mockObserve).not.toHaveBeenCalled();
});

test('denied permission never requests coordinates or starts a server session', async () => {
  mockPermission.mockResolvedValue({ status: 'denied' });
  await renderHook(() => useForegroundVisitVerification());
  await act(async () => { jest.advanceTimersByTime(30_000); });
  expect(mockLocation).not.toHaveBeenCalled();
  expect(mockStart).not.toHaveBeenCalled();
});

test('backgrounding cancels scheduled observations and resumes through server recovery', async () => {
  await renderHook(() => useForegroundVisitVerification());
  await act(async () => { changeState('background'); jest.advanceTimersByTime(60_000); });
  expect(mockObserve).not.toHaveBeenCalled();
  await act(async () => { changeState('active'); });
  expect(mockRecover).toHaveBeenCalledWith(9201, expect.any(AbortSignal));
  expect(mockStart).toHaveBeenCalledTimes(1);
});

test('late GPS results from a suspended generation never start a session', async () => {
  let finishLocation!: (result: unknown) => void;
  mockLocation.mockImplementationOnce(() => new Promise(resolve => { finishLocation = resolve; }));
  await renderHook(() => useForegroundVisitVerification());
  await act(async () => { changeState('background'); });
  await act(async () => { finishLocation({ status: 'granted', coordinate: { latitude: 35.1, longitude: 128.1 } }); });
  expect(mockStart).not.toHaveBeenCalled();
});

test('logout aborts collection and blocks further discovery', async () => {
  await renderHook(() => useForegroundVisitVerification());
  await act(async () => { clearActiveForegroundVisitVerificationSession(); jest.advanceTimersByTime(60_000); });
  expect(mockObserve).not.toHaveBeenCalled();
  await act(async () => { changeState('background'); changeState('active'); });
  expect(mockStart).toHaveBeenCalledTimes(1);
});
