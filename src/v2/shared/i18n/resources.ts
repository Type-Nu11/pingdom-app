export const resources = {
  en: {
    translation: {
      common: {
        error: {
          description: 'Please try again in a moment.',
          retry: 'Try again',
          title: 'Something went wrong',
        },
      },
      examplePlaces: {
        count: '{{count}} places',
        emptyDescription: 'Try again after place data is available.',
        emptyTitle: 'No places yet',
        loading: 'Loading places...',
        title: 'Place list example',
      },
      map: {
        locate: 'My location',
        location: {
          deniedDescription: 'The map is using a default area. Allow location access to show your position.',
          deniedTitle: 'Location access is off',
          failedDescription: 'The map is using a default area. Check location services and try again.',
          failedTitle: 'Could not find your location',
          loading: 'Finding your current location...',
          openSettings: 'Open settings',
          retry: 'Check again',
        },
        testPlace: 'Test place',
        title: 'Nearby map',
        visibleCenter: '{{lat}}, {{lng}}',
      },
      placeDetail: {
        back: 'Back',
        placeId: 'Place ID: {{placeId}}',
        title: 'Place detail',
      },
    },
  },
  ko: {
    translation: {
      common: {
        error: {
          description: '잠시 후 다시 시도해 주세요.',
          retry: '다시 시도',
          title: '문제가 발생했습니다',
        },
      },
      examplePlaces: {
        count: '장소 {{count}}개',
        emptyDescription: '장소 데이터가 등록된 후 다시 확인해 주세요.',
        emptyTitle: '아직 등록된 장소가 없습니다',
        loading: '장소를 불러오는 중입니다...',
        title: '장소 목록 예제',
      },
      map: {
        locate: '내 위치',
        location: {
          deniedDescription: '기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요.',
          deniedTitle: '위치 권한이 꺼져 있습니다',
          failedDescription: '기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요.',
          failedTitle: '현재 위치를 찾지 못했습니다',
          loading: '현재 위치를 찾는 중입니다...',
          openSettings: '설정 열기',
          retry: '다시 확인',
        },
        testPlace: '테스트 장소',
        title: '주변 지도',
        visibleCenter: '{{lat}}, {{lng}}',
      },
      placeDetail: {
        back: '뒤로',
        placeId: '장소 ID: {{placeId}}',
        title: '장소 상세',
      },
    },
  },
} as const;

export const supportedLanguages = ['en', 'ko'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
