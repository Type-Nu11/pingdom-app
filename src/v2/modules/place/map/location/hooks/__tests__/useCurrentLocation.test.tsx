import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { getCurrentLocation, watchCurrentLocation } from '../../services/locationService';
import { useCurrentLocation } from '../useCurrentLocation';

jest.mock('../../services/locationService', () => ({
  getCurrentLocation: jest.fn(), watchCurrentLocation: jest.fn(),
}));

const granted = { status: 'granted' as const, canAskAgain: true as const, coordinate: { lat: 37.5, lng: 127 } };
let changeState: (state: AppStateStatus) => void;
const originalState = AppState.currentState;
const remove = jest.fn();

beforeEach(() => {
  AppState.currentState = 'active';
  jest.mocked(getCurrentLocation).mockResolvedValue(granted);
  jest.mocked(watchCurrentLocation).mockResolvedValue({ remove });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    changeState = state => { AppState.currentState = state; listener(state); };
    return { remove: jest.fn() };
  });
});
afterEach(() => { AppState.currentState = originalState; });

test('화면이 가려지면 GPS 구독을 해제하고 다시 보일 때 권한 요청 없이 재개한다', async () => {
  const { result, rerender } = await renderHook(({ enabled }: { enabled: boolean }) => useCurrentLocation(enabled), { initialProps: { enabled: true } });
  expect(watchCurrentLocation).toHaveBeenCalledTimes(1);
  await rerender({ enabled: false });
  expect(remove).toHaveBeenCalledTimes(1);
  expect(result.current.coordinate).toEqual(granted.coordinate);
  await rerender({ enabled: true });
  expect(getCurrentLocation).toHaveBeenLastCalledWith(false);
  expect(watchCurrentLocation).toHaveBeenCalledTimes(2);
});

test('백그라운드에서는 구독과 새 위치 요청을 멈춘다', async () => {
  const { result } = await renderHook(() => useCurrentLocation());
  await act(async () => changeState('background'));
  expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => { await result.current.refresh(); });
  expect(getCurrentLocation).toHaveBeenCalledTimes(1);
  await act(async () => changeState('active'));
  expect(watchCurrentLocation).toHaveBeenCalledTimes(2);
});

test('화면을 떠난 뒤 늦게 생성된 GPS 구독도 즉시 해제한다', async () => {
  let resolveWatch!: (subscription: { remove: () => void }) => void;
  jest.mocked(watchCurrentLocation).mockImplementation(() => new Promise(resolve => { resolveWatch = resolve; }));
  const { rerender } = await renderHook(({ enabled }: { enabled: boolean }) => useCurrentLocation(enabled), { initialProps: { enabled: true } });
  await rerender({ enabled: false });
  await act(async () => resolveWatch({ remove }));
  expect(remove).toHaveBeenCalledTimes(1);
});

test('비활성 화면에서는 최초 위치 조회도 시작하지 않는다', async () => {
  await renderHook(() => useCurrentLocation(false));
  expect(getCurrentLocation).not.toHaveBeenCalled();
});
