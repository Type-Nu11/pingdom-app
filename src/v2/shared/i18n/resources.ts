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
    },
  },
} as const;
