import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { PlaceActionNative, PlaceActionTarget } from '../../services/placeActions';
import { usePlaceActions } from '../usePlaceActions';

const placeA: PlaceActionTarget = {
  address: '주소 A', latitude: 37.5, longitude: 127, name: '장소 A', placeId: 1,
};
const placeB: PlaceActionTarget = {
  address: '주소 B', latitude: 35.1, longitude: 129, name: '장소 B', placeId: 2,
};

function deferred<T>() {
  let reject!: (reason?: unknown) => void;
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, reject, resolve };
}

function native(overrides: Partial<PlaceActionNative> = {}): PlaceActionNative {
  return {
    canOpenUrl: jest.fn(async () => true),
    isShareAvailable: jest.fn(() => true),
    openUrl: jest.fn(async () => undefined),
    share: jest.fn(async () => 'shared'),
    ...overrides,
  };
}

describe('usePlaceActions', () => {
  test('빠른 연속 공유 탭은 native 공유창을 한 번만 연다', async () => {
    const pending = deferred<'shared'>();
    const bridge = native({ share: jest.fn(() => pending.promise) });
    const { result } = await renderHook(() => usePlaceActions(placeA, { native: bridge }));

    await act(async () => {
      void result.current.share(placeA);
      void result.current.share(placeA);
      await Promise.resolve();
    });
    expect(bridge.share).toHaveBeenCalledTimes(1);
    expect(result.current.busyAction).toBe('share');

    await act(async () => {
      pending.resolve('shared');
      await pending.promise;
    });
    await waitFor(() => expect(result.current.busyAction).toBeNull());
  });

  test('길찾기 실행 중 연속 탭도 외부 URL을 한 번만 연다', async () => {
    const pending = deferred<void>();
    const bridge = native({ openUrl: jest.fn(() => pending.promise) });
    const { result } = await renderHook(() => usePlaceActions(placeA, { native: bridge }));

    await act(async () => {
      void result.current.directions(placeA);
      void result.current.directions(placeA);
      await Promise.resolve();
    });
    await waitFor(() => expect(bridge.openUrl).toHaveBeenCalledTimes(1));
    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
  });

  test('장소 A 실행 중 B로 전환하면 A 결과가 B의 상태나 안내를 변경하지 않는다', async () => {
    const pendingA = deferred<'shared'>();
    const onFeedback = jest.fn();
    const bridge = native({
      share: jest.fn()
        .mockImplementationOnce(() => pendingA.promise)
        .mockResolvedValueOnce('shared'),
    });
    let selectedPlace = placeA;
    const { result, rerender } = await renderHook(
      () => usePlaceActions(selectedPlace, { native: bridge, onFeedback }),
    );

    await act(async () => {
      void result.current.share(placeA);
      await Promise.resolve();
    });
    selectedPlace = placeB;
    await rerender(undefined);
    await waitFor(() => expect(result.current.busyAction).toBeNull());
    await act(async () => result.current.share(placeB));
    expect(bridge.share).toHaveBeenCalledTimes(2);

    await act(async () => pendingA.reject(new Error('A failed')));
    expect(onFeedback).not.toHaveBeenCalled();
    expect(result.current.busyAction).toBeNull();
  });

  test('공유 취소는 안내하지 않고 실패·미지원 결과만 구분해 안내한다', async () => {
    const onFeedback = jest.fn();
    const bridge = native({ share: jest
      .fn()
      .mockResolvedValueOnce('dismissed')
      .mockRejectedValueOnce(new Error('failed')) });
    const { result } = await renderHook(() => usePlaceActions(placeA, { native: bridge, onFeedback }));

    await act(async () => result.current.share(placeA));
    expect(onFeedback).not.toHaveBeenCalled();
    await act(async () => result.current.share(placeA));
    expect(onFeedback).toHaveBeenLastCalledWith('share-failed');
  });

  test('공유 기능 미지원은 공유 실패와 다른 안내를 요청한다', async () => {
    const onFeedback = jest.fn();
    const bridge = native({ isShareAvailable: jest.fn(() => false) });
    const { result } = await renderHook(
      () => usePlaceActions(placeA, { native: bridge, onFeedback }),
    );

    await act(async () => result.current.share(placeA));
    expect(onFeedback).toHaveBeenLastCalledWith('share-unavailable');
  });

  test('좌표 없음, 외부 지도 미지원, openURL 실패 안내를 구분한다', async () => {
    const onFeedback = jest.fn();
    const invalid = { ...placeA, latitude: Number.NaN };
    let selectedPlace = invalid;
    let bridge = native();
    const view = await renderHook(
      () => usePlaceActions(selectedPlace, { native: bridge, onFeedback }),
    );

    await act(async () => view.result.current.directions(invalid));
    expect(onFeedback).toHaveBeenLastCalledWith('place-location-missing');

    selectedPlace = placeB;
    bridge = native({ canOpenUrl: jest.fn(async () => false) });
    await view.rerender(undefined);
    await act(async () => view.result.current.directions(placeB));
    expect(onFeedback).toHaveBeenLastCalledWith('directions-unavailable');

    selectedPlace = placeA;
    bridge = native({ openUrl: jest.fn(async () => { throw new Error('open'); }) });
    await view.rerender(undefined);
    await act(async () => view.result.current.directions(placeA));
    expect(onFeedback).toHaveBeenLastCalledWith('directions-failed');
  });
});
