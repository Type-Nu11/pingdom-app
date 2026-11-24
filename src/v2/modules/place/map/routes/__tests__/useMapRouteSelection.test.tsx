import { act, renderHook } from '@testing-library/react-native';
import { useMapRouteSelection } from '../hooks/useMapRouteSelection';

type Options = Parameters<typeof useMapRouteSelection>[0];
const focusedMap: Options = {
  isFocused: true,
  previewPlaceId: undefined,
  actionPlaceId: undefined,
  externalPlace: null,
};

test('선택된 등록 장소에서만 출발·도착 경로를 열고 장소가 바뀌면 닫는다', async () => {
  const selectedPlace = { ...focusedMap, previewPlaceId: 12, actionPlaceId: 12 };
  const { result, rerender } = await renderHook(useMapRouteSelection, { initialProps: selectedPlace });

  await act(async () => result.current.openRegisteredRoute(99, 'origin'));
  expect(result.current.registeredRoute).toBeNull();

  await act(async () => result.current.openRegisteredRoute(12, 'origin'));
  expect(result.current.registeredRoute).toEqual({ placeId: 12, role: 'origin', originSelection: 'currentLocation' });
  await act(async () => result.current.openRegisteredRoute(12, 'destination'));
  expect(result.current.registeredRoute?.role).toBe('destination');

  await rerender({ ...selectedPlace, previewPlaceId: 13, actionPlaceId: 13 });
  expect(result.current.registeredRoute).toBeNull();
});

test('음성 길찾기는 장소가 준비되면 수동 출발지로 한 번만 열리고 닫은 뒤 다시 열리지 않는다', async () => {
  const loadingPlace = { ...focusedMap, previewPlaceId: 12 };
  const { result, rerender } = await renderHook(useMapRouteSelection, { initialProps: loadingPlace });

  await act(async () => result.current.requestAssistantDirections(12));
  expect(result.current.registeredRoute).toBeNull();
  await rerender({ ...loadingPlace, actionPlaceId: 12 });
  expect(result.current.registeredRoute).toEqual({ placeId: 12, role: 'destination', originSelection: 'manual' });

  await act(async () => result.current.closeRegisteredRoute());
  await rerender({ ...loadingPlace, actionPlaceId: 12 });
  expect(result.current.registeredRoute).toBeNull();
});

test('지도 포커스를 잃으면 빈 경로와 외부 경로를 닫고, 외부 장소 교체 시에도 이전 경로를 닫는다', async () => {
  const externalPlace = {
    address: '',
    coordinate: { latitude: 35.87, longitude: 128.6 },
    name: '외부 장소',
    provider: 'kakao' as const,
    providerPlaceId: '120',
  };
  const selectedPlace = { ...focusedMap, externalPlace };
  const { result, rerender } = await renderHook(useMapRouteSelection, { initialProps: selectedPlace });

  await act(async () => result.current.openExternalRoute('origin'));
  expect(result.current.externalRouteRole).toBe('origin');
  expect(result.current.externalRouteDestination?.placeId).toBe(0);

  const nextPlace = { ...selectedPlace, externalPlace: { ...externalPlace, providerPlaceId: '121' } };
  await rerender(nextPlace);
  expect(result.current.externalRouteRole).toBeNull();

  await act(async () => {
    result.current.openExternalRoute('destination');
    result.current.openEmptyRoute();
  });
  await rerender({ ...nextPlace, isFocused: false });
  expect(result.current.externalRouteRole).toBeNull();
  expect(result.current.emptyRouteOpen).toBe(false);
});
