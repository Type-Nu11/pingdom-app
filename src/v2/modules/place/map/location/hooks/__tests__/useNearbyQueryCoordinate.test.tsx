import { renderHook } from '@testing-library/react-native';
import type { Coordinate } from '../../../camera/model/map.types';
import { useNearbyQueryCoordinate } from '../useNearbyQueryCoordinate';

test('GPS 흔들림은 인기·추천 요청 좌표를 바꾸지 않고 누적 100m 이동하면 갱신한다', async () => {
  const origin = { lat: 37.5, lng: 127 };
  const { result, rerender } = await renderHook(
    ({ coordinate }: { coordinate: Coordinate | null }) => useNearbyQueryCoordinate(coordinate),
    { initialProps: { coordinate: origin as Coordinate | null } },
  );
  await rerender({ coordinate: { lat: 37.5003, lng: 127 } });
  expect(result.current).toBe(origin);
  await rerender({ coordinate: { lat: 37.5006, lng: 127 } });
  expect(result.current).toBe(origin);
  const moved = { lat: 37.501, lng: 127 };
  await rerender({ coordinate: moved });
  expect(result.current).toBe(moved);
  await rerender({ coordinate: null });
  expect(result.current).toBeNull();
  await rerender({ coordinate: origin });
  expect(result.current).toBe(origin);
});
