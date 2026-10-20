import {
  buildKakaoDirectionsUrl,
  buildPlaceShareContent,
  openPlaceDirections,
  sharePlace,
  type PlaceActionNative,
  type PlaceActionTarget,
} from '../placeActions';

const target: PlaceActionTarget = {
  address: '서울 종로구 세종대로 175',
  latitude: 37.572,
  longitude: 126.9769,
  name: '한글 장소 / 팝업 & 카페',
  placeId: 17,
};

function native(overrides: Partial<PlaceActionNative> = {}): PlaceActionNative {
  return {
    canOpenUrl: jest.fn(async () => true),
    isShareAvailable: jest.fn(() => true),
    openUrl: jest.fn(async () => undefined),
    share: jest.fn(async () => 'shared'),
    ...overrides,
  };
}

describe('place actions', () => {
  test('공식 앱 장소 딥링크를 장소명·주소와 함께 공유한다', () => {
    expect(buildPlaceShareContent(target)).toEqual({
      message: '한글 장소 / 팝업 & 카페\n서울 종로구 세종대로 175\npingdom://places/17',
      title: '한글 장소 / 팝업 & 카페',
    });
  });

  test('주소와 공식 링크가 없으면 검증된 좌표를 공유한다', () => {
    expect(buildPlaceShareContent({
      ...target,
      address: ' ',
      placeId: Number.NaN,
    })).toEqual({
      message: '한글 장소 / 팝업 & 카페\n37.572, 126.9769',
      title: '한글 장소 / 팝업 & 카페',
    });
  });

  test.each([
    ['shared', 'shared'],
    ['dismissed', 'dismissed'],
  ] as const)('공유 native 결과 %s를 %s로 보존한다', async (nativeResult, expected) => {
    const bridge = native({ share: jest.fn(async () => nativeResult) });
    await expect(sharePlace(target, bridge)).resolves.toBe(expected);
  });

  test('공유 기능 미지원과 native 실패를 구분한다', async () => {
    const unavailable = native({ isShareAvailable: jest.fn(() => false) });
    await expect(sharePlace(target, unavailable)).resolves.toBe('unavailable');
    expect(unavailable.share).not.toHaveBeenCalled();

    const failed = native({ share: jest.fn(async () => { throw new Error('native'); }) });
    await expect(sharePlace(target, failed)).resolves.toBe('failed');
  });

  test('Kakao 공식 웹 길찾기 URL에 한글·공백·특수문자 장소명과 좌표를 안전하게 넣는다', () => {
    expect(buildKakaoDirectionsUrl(target)).toBe(
      'https://map.kakao.com/link/to/%ED%95%9C%EA%B8%80%20%EC%9E%A5%EC%86%8C%20%2F%20%ED%8C%9D%EC%97%85%20%26%20%EC%B9%B4%ED%8E%98,37.572,126.9769',
    );
  });

  test.each([
    [Number.NaN, 126.9], [Number.POSITIVE_INFINITY, 126.9],
    [91, 126.9], [-91, 126.9], [37.5, 181], [37.5, -181],
  ])('잘못된 좌표 %s,%s는 외부 URL을 검사하거나 열지 않는다', async (latitude, longitude) => {
    const bridge = native();
    await expect(openPlaceDirections({ ...target, latitude, longitude }, bridge))
      .resolves.toBe('invalid-location');
    expect(bridge.canOpenUrl).not.toHaveBeenCalled();
    expect(bridge.openUrl).not.toHaveBeenCalled();
  });

  test('공식 웹 URL 미지원, canOpenURL 실패, openURL 실패를 구분한다', async () => {
    const unavailable = native({ canOpenUrl: jest.fn(async () => false) });
    await expect(openPlaceDirections(target, unavailable)).resolves.toBe('unavailable');
    expect(unavailable.openUrl).not.toHaveBeenCalled();

    const checkFailed = native({
      canOpenUrl: jest.fn(async () => { throw new Error('check'); }),
    });
    await expect(openPlaceDirections(target, checkFailed))
      .resolves.toBe('availability-check-failed');
    expect(checkFailed.openUrl).not.toHaveBeenCalled();

    const failed = native({ openUrl: jest.fn(async () => { throw new Error('open'); }) });
    await expect(openPlaceDirections(target, failed)).resolves.toBe('open-failed');
  });
});
