import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { useDeviceHeading } from '../useDeviceHeading';

jest.mock('expo-location', () => ({ watchHeadingAsync: jest.fn() }));
let emit: (value: Location.LocationHeadingObject) => void;
let changeState: (state: AppStateStatus) => void;
const remove = jest.fn();
const originalState = AppState.currentState;
beforeEach(() => {
  AppState.currentState = 'active';
  jest.mocked(Location.watchHeadingAsync).mockImplementation(async callback => { emit = callback; return { remove }; });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
    changeState = state => { AppState.currentState = state; listener(state); };
    return { remove: jest.fn() };
  });
});
afterEach(() => { AppState.currentState = originalState; });

test('GPS 이동 없이 방향을 갱신하고 진북이 없으면 자북을 사용한다', async () => {
  const { result } = await renderHook(() => useDeviceHeading(true));
  await act(async () => emit({ trueHeading: 90, magHeading: 80, accuracy: 3 }));
  expect(result.current).toBe(90);
  await act(async () => emit({ trueHeading: -1, magHeading: 180, accuracy: 2 }));
  expect(result.current).toBe(180);
  await act(async () => emit({ trueHeading: NaN, magHeading: -1, accuracy: 0 }));
  expect(result.current).toBe(180);
});

test('화면 비활성화와 백그라운드에서 구독을 해제하고 복귀하면 재개한다', async () => {
  const { rerender } = await renderHook(({ enabled }: { enabled: boolean }) => useDeviceHeading(enabled), { initialProps: { enabled: true } });
  await act(async () => changeState('background'));
  expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => changeState('active'));
  expect(Location.watchHeadingAsync).toHaveBeenCalledTimes(2);
  await rerender({ enabled: false });
  expect(remove).toHaveBeenCalledTimes(2);
});

test('화면을 떠난 뒤 생성된 구독과 늦게 도착한 방향 이벤트를 버린다', async () => {
  let finish!: (subscription: Location.LocationSubscription) => void;
  jest.mocked(Location.watchHeadingAsync).mockImplementation(callback => {
    emit = callback;
    return new Promise(resolve => { finish = resolve; });
  });
  const { result, rerender } = await renderHook(({ enabled }: { enabled: boolean }) => useDeviceHeading(enabled), { initialProps: { enabled: true } });
  await rerender({ enabled: false });
  await act(async () => { emit({ trueHeading: 90, magHeading: 90, accuracy: 3 }); finish({ remove }); });
  expect(remove).toHaveBeenCalledTimes(1);
  expect(result.current).toBeUndefined();
});
