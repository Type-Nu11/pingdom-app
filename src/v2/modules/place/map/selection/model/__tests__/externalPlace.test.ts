import {
  EXTERNAL_PLACE_MARKER_ID,
  createExternalPlaceMarker,
  getExternalPlaceKey,
  resolveMapSearchSelection,
  toExternalRouteDestination,
  type MapSearchSelection,
} from '../externalPlace';
import { findMapPreviewPlace } from '../../utils/mapPreviewSelection';

const selection = (overrides: Partial<MapSearchSelection> = {}): MapSearchSelection => ({
  address: '서울 성동구 성수동2가 1',
  id: '17',
  isRegisteredPlace: false,
  lat: 37.5446,
  lng: 127.0559,
  name: '성수 외부 카페',
  roadAddress: '서울 성동구 연무장길 1',
  ...overrides,
});

describe('resolveMapSearchSelection', () => {
  test('등록 장소는 현재 지도 목록과 무관하게 서버 canonical ID로 연결한다', () => {
    expect(resolveMapSearchSelection(selection({ id: '9001', isRegisteredPlace: true })))
      .toEqual({ kind: 'registered', placeId: 9001 });
  });

  test('외부 결과는 ID가 핑덤 장소 ID와 같아도 등록 장소로 연결하지 않는다', () => {
    const target = resolveMapSearchSelection(selection({ id: '17' }));

    expect(target).toEqual({
      kind: 'external',
      place: {
        address: '서울 성동구 연무장길 1',
        coordinate: { latitude: 37.5446, longitude: 127.0559 },
        name: '성수 외부 카페',
        provider: 'kakao',
        providerPlaceId: '17',
      },
    });
  });

  test('외부 결과는 이름이 등록 장소와 같아도 출처로만 구분한다', () => {
    const registered = resolveMapSearchSelection(selection({ id: '17', isRegisteredPlace: true }));
    const external = resolveMapSearchSelection(selection({ id: '17' }));

    expect(registered.kind).toBe('registered');
    expect(external.kind).toBe('external');
  });

  test.each(['', '0', '-3', '1.5', '17abc', 'keyword-37-127-카페', '9007199254740993'])(
    '등록 장소의 ID %p 는 canonical ID가 아니므로 상세로 연결하지 않는다',
    (id) => {
      expect(resolveMapSearchSelection(selection({ id, isRegisteredPlace: true })))
        .toEqual({ kind: 'unresolved' });
    },
  );

  test('도로명 주소가 없으면 지번 주소를 쓰고 공백을 정리한다', () => {
    const target = resolveMapSearchSelection(selection({
      address: '  서울 성동구 성수동2가 1 ',
      name: '  성수 외부 카페 ',
      roadAddress: '   ',
    }));

    expect(target).toMatchObject({
      kind: 'external',
      place: { address: '서울 성동구 성수동2가 1', name: '성수 외부 카페' },
    });
  });

  test.each([
    [Number.NaN, 127.0559],
    [37.5446, Number.POSITIVE_INFINITY],
    [91, 127.0559],
    [37.5446, 181],
  ])('유효하지 않은 좌표 (%p, %p)는 좌표 없는 외부 장소가 된다', (lat, lng) => {
    const target = resolveMapSearchSelection(selection({ lat, lng }));

    expect(target).toMatchObject({ kind: 'external', place: { coordinate: null } });
  });
});

describe('external place map presentation', () => {
  const resolved = resolveMapSearchSelection(selection());
  const place = resolved.kind === 'external' ? resolved.place : null;

  test('공급자와 공급자 ID로 선택을 식별한다', () => {
    expect(place && getExternalPlaceKey(place)).toBe('kakao:17');
  });

  test('검색 마커를 만들고 그 마커는 등록 장소 미리보기를 열지 않는다', () => {
    expect(createExternalPlaceMarker(place)).toEqual({
      category: 'etc',
      id: EXTERNAL_PLACE_MARKER_ID,
      lat: 37.5446,
      lng: 127.0559,
      markerType: 'search',
    });
    expect(findMapPreviewPlace(EXTERNAL_PLACE_MARKER_ID, [{ id: 17 }])).toBeNull();
  });

  test('길찾기는 핑덤 장소 ID 없이 좌표만 전달한다', () => {
    expect(toExternalRouteDestination(place)).toEqual({
      address: '서울 성동구 연무장길 1',
      latitude: 37.5446,
      longitude: 127.0559,
      name: '성수 외부 카페',
      placeId: 0,
    });
  });

  test('선택이 없거나 좌표가 없으면 마커와 길찾기 목적지를 만들지 않는다', () => {
    const withoutCoordinate = place && { ...place, coordinate: null };

    expect(createExternalPlaceMarker(null)).toBeNull();
    expect(toExternalRouteDestination(null)).toBeNull();
    expect(createExternalPlaceMarker(withoutCoordinate)).toBeNull();
    expect(toExternalRouteDestination(withoutCoordinate)).toBeNull();
  });
});
