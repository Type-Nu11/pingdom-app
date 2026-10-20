import { createTestI18n } from '../../../app/testing/testProviders';

describe('place action translations', () => {
  test.each([
    ['ko', {
      departureUnsupported: '출발 기능은 아직 지원하지 않습니다.',
      directionsFailed: '길찾기를 실행하지 못했습니다.',
      directionsUnavailable: '외부 지도 앱을 열 수 없습니다.',
      locationMissing: '장소 위치 정보가 없습니다.',
      shareFailed: '공유를 실행하지 못했습니다.',
      shareUnavailable: '이 기기에서는 공유 기능을 사용할 수 없습니다.',
    }],
    ['en', {
      departureUnsupported: 'Starting from a place is not supported yet.',
      directionsFailed: 'Could not start directions.',
      directionsUnavailable: 'Could not open an external map.',
      locationMissing: 'This place has no location information.',
      shareFailed: 'Could not share this place.',
      shareUnavailable: 'Sharing is not available on this device.',
    }],
  ] as const)('%s 안내 문구를 제공한다', async (language, expected) => {
    const i18n = await createTestI18n(language);
    expect({
      departureUnsupported: i18n.t('map.placeActions.departureUnsupported'),
      directionsFailed: i18n.t('map.placeActions.directionsFailed'),
      directionsUnavailable: i18n.t('map.placeActions.directionsUnavailable'),
      locationMissing: i18n.t('map.placeActions.locationMissing'),
      shareFailed: i18n.t('map.placeActions.shareFailed'),
      shareUnavailable: i18n.t('map.placeActions.shareUnavailable'),
    }).toEqual(expected);
  });
});
