import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { watchCurrentLocation } from '../../location/services/locationService';
import { useRouteTracking } from '../hooks/useRouteTracking';

jest.mock('../../location/services/locationService', () => ({ watchCurrentLocation: jest.fn() }));
jest.mock('../api/routesApi', () => ({
  findCarRoute: jest.fn(() => new Promise(() => {})),
}));

const location = { status: 'granted' as const, canAskAgain: true as const, coordinate: { lat: 37.5, lng: 127 } };
const origin = { placeId: 1, name: '출발', latitude: 37.5, longitude: 127 };
const destination = { placeId: 2, name: '도착', latitude: 37.6, longitude: 127.1 };
const originalAppState = AppState.currentState;
let onAppStateChange: (state: AppStateStatus) => void;
const removeAppStateListener = jest.fn();

beforeEach(() => {
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    onAppStateChange = listener;
    return { remove: removeAppStateListener };
  });
});

afterEach(() => {
  AppState.currentState = originalAppState;
  jest.restoreAllMocks();
});

test('반복적인 백그라운드 전환에서 경로 타이머와 위치 구독을 정리하고 복귀할 때 다시 시작한다', async () => {
  const removeWatch = jest.fn();
  jest.mocked(watchCurrentLocation).mockResolvedValue({ remove: removeWatch });
  const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
  const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
  const { result, unmount } = await renderHook(() => useRouteTracking(location));

  await act(async () => result.current.start(origin, destination));
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    expect(watchCurrentLocation).toHaveBeenCalledTimes(cycle);
    const timer = setIntervalSpy.mock.results.at(-1)?.value;

    await act(async () => onAppStateChange('background'));
    expect(removeWatch).toHaveBeenCalledTimes(cycle);
    expect(clearIntervalSpy).toHaveBeenCalledWith(timer);

    await act(async () => onAppStateChange('active'));
  }

  await act(async () => result.current.stop());
  expect(removeWatch).toHaveBeenCalledTimes(4);
  expect(clearIntervalSpy).toHaveBeenCalledWith(setIntervalSpy.mock.results.at(-1)?.value);
  await unmount();
  expect(removeAppStateListener).toHaveBeenCalledTimes(1);
});

test('안내를 종료한 뒤 위치 구독이 늦게 생성되면 즉시 해제한다', async () => {
  let resolveWatch!: (subscription: { remove: () => void }) => void;
  jest.mocked(watchCurrentLocation).mockImplementationOnce(() => new Promise(resolve => { resolveWatch = resolve; }));
  const { result } = await renderHook(() => useRouteTracking(location));

  await act(async () => result.current.start(origin, destination));
  await act(async () => result.current.stop());

  const removeWatch = jest.fn();
  await act(async () => resolveWatch({ remove: removeWatch }));
  expect(removeWatch).toHaveBeenCalledTimes(1);
  expect(result.current.tracking).toBeNull();
});
