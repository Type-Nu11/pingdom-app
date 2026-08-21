import type { i18n as I18nInstance } from 'i18next';

import { i18n, initializeI18n } from '../../../shared/i18n';

export const reservationResources = {
  en: {
    reservation: {
      common: {
        back: 'Go back',
        favorites: 'Favorites',
        map: 'Map',
        recommendations: 'Place recommendations',
        reservations: 'Reservations',
        verify: 'Verify',
      },
      detail: {
        description: 'Reservation and payment details will be loaded with this reservation ID when the server contract is connected.',
        identifier: 'Reservation ID',
        pending: 'Reservation and payment details coming soon',
        title: 'Reservation details',
      },
      fixtures: {
        daeseong: {
          address: '123 m · 79-3 Changni-ro 11-gil, Guji-myeon, Dalseong-gun, Daegu',
          category: 'Restaurant',
          name: 'Daeseong Chinese Restaurant',
          shortAddress: 'Guji-myeon, Daegu',
        },
        goyang: {
          address: '12.3 km · 1601 Jungang-ro, Ilsanseo-gu, Goyang, Gyeonggi …',
          category: 'Music',
          name: 'Goyang Stadium',
        },
        layered: {
          name: 'Layered\nCoffee Lab',
        },
        oasis: {
          name: 'Oasis\nPop-up Store',
        },
        reasons: {
          english: 'English support',
          parking: 'Parking available',
          reviews: 'Popular reviews',
        },
      },
      list: {
        available: 'Bookable',
        card: {
          createdAt: 'Requested at',
          detail: 'View reservation details  ›',
          eyebrow: 'My reservation',
          hint: 'Opens reservation details',
          label: 'Reservation {{id}}, {{status}}',
          number: 'Reservation #{{id}}',
          productType: 'Product type',
          quantity: 'Quantity',
        },
        emptyDescription: 'Find a place you like on the map.',
        emptyTitle: 'No reservations yet',
        error: 'Could not load reservations',
        loading: 'Loading reservations',
        nearbySubtitle: 'Discover places currently accepting reservations!',
        nearbyTitle: 'Reservations near Daegu Guji',
        panelAdjust: 'Resize reservation panel',
        previewLabel: '{{name}} reservation preview',
        retry: 'Try again',
        savedTitle: 'Saved reservations',
        statuses: {
          canceled: 'Canceled',
          completed: 'Completed',
          confirmed: 'Confirmed',
          expired: 'Expired',
          noShow: 'No-show',
          pending: 'Pending confirmation',
          unknown: 'Status needs review',
        },
      },
      verification: {
        alerts: {
          completeBody: 'You can submit this review after the review API is connected.',
          completeTitle: 'Review ready',
          photoErrorBody: 'Please try again in a moment.',
          photoErrorTitle: 'Could not load photos',
          permissionBody: 'Allow photo access in Settings.',
          permissionTitle: 'Photo access required',
        },
        photo: {
          add: 'Add photos',
          delete: 'Remove attached photo',
          title: 'Add photos',
        },
        reasons: {
          clean: 'Clean store',
          delicious: 'Delicious',
          description: 'Select up to 5',
          easyToFind: 'Easy to find',
          kind: 'Friendly staff',
          multilingual: 'Clear multilingual information',
          parking: 'Easy parking',
          photoSpot: 'Great for photos',
          selectedCount: '{{count}}/5 selected',
          title: 'Why recommend it?',
        },
        recentVisits: 'Recent visits',
        review: {
          placeholder: 'Share your experience with other travelers',
          submit: 'Submit review',
          title: 'Write a review',
        },
        title: 'Verify visit',
      },
    },
  },
  ko: {
    reservation: {
      common: {
        back: '뒤로 가기',
        favorites: '즐겨찾기',
        map: '지도',
        recommendations: '장소추천',
        reservations: '예약',
        verify: '검증하기',
      },
      detail: {
        description: '서버의 예약 상세 및 결제 조회 계약이 연결되면 이 예약 식별자로 정보를 불러옵니다.',
        identifier: '예약 식별자',
        pending: '상세·결제 내역 준비 중',
        title: '예약 상세',
      },
      fixtures: {
        daeseong: {
          address: '123m · 대구광역시 달성군 구지면 창리로11길 79-3',
          category: '음식점',
          name: '대성반점',
          shortAddress: '대구 구지면',
        },
        goyang: {
          address: '12.3km · 경기도 고양시 일산서구 중앙로 1601 …',
          category: '음악',
          name: '고양종합운동장',
        },
        layered: {
          name: '레이어드\n커피 랩',
        },
        oasis: {
          name: '오아시스\n팝업 스토어',
        },
        reasons: {
          english: '영어응대 가능',
          parking: '주차 가능',
          reviews: '리뷰 많은',
        },
      },
      list: {
        available: '예약 가능',
        card: {
          createdAt: '접수 일시',
          detail: '예약 상세 보기  ›',
          eyebrow: '내 예약',
          hint: '예약 상세 화면으로 이동합니다',
          label: '예약 {{id}}, {{status}}',
          number: '예약 번호 {{id}}',
          productType: '상품 유형',
          quantity: '예약 수량',
        },
        emptyDescription: '지도에서 마음에 드는 장소를 찾아보세요.',
        emptyTitle: '아직 예약 내역이 없어요',
        error: '예약을 불러오지 못했어요',
        loading: '예약을 불러오는 중이에요',
        nearbySubtitle: '현재 예약 가능 장소를 찾아드려요!',
        nearbyTitle: '대구 구지 주변 예약',
        panelAdjust: '예약 패널 크기 조절',
        previewLabel: '{{name}} 예약 미리보기',
        retry: '다시 시도',
        savedTitle: '예약함',
        statuses: {
          canceled: '취소됨',
          completed: '이용 완료',
          confirmed: '예약 확정',
          expired: '기간 만료',
          noShow: '미방문',
          pending: '확정 대기',
          unknown: '상태 확인 필요',
        },
      },
      verification: {
        alerts: {
          completeBody: '리뷰 제출 API가 연결되면 등록할 수 있어요.',
          completeTitle: '작성 완료',
          photoErrorBody: '잠시 후 다시 시도해 주세요.',
          photoErrorTitle: '사진을 불러오지 못했습니다',
          permissionBody: '설정에서 사진 접근을 허용해 주세요.',
          permissionTitle: '사진 권한이 필요합니다',
        },
        photo: {
          add: '사진 첨부',
          delete: '첨부 사진 삭제',
          title: '사진 첨부',
        },
        reasons: {
          clean: '매장이 깨끗해요',
          delicious: '맛있어요',
          description: '최대 5개까지 선택할 수 있어요',
          easyToFind: '찾기 쉬워요',
          kind: '친절해요',
          multilingual: '다국어 설명이 잘 되어 있어요',
          parking: '주차하기 편해요',
          photoSpot: '사진 찍기 좋아요',
          selectedCount: '{{count}}/5개 선택됨',
          title: '추천 이유',
        },
        recentVisits: '최근 방문',
        review: {
          placeholder: '다른 사람들에게 user님의 후기를 알려주세요',
          submit: '리뷰하기',
          title: '후기 작성',
        },
        title: '검증하기',
      },
    },
  },
} as const;

export function registerReservationResources(instance: I18nInstance) {
  (['en', 'ko'] as const).forEach((language) => {
    instance.addResourceBundle(
      language,
      'translation',
      reservationResources[language],
      true,
      true,
    );
  });
}

export async function initializeReservationI18n() {
  await initializeI18n();
  registerReservationResources(i18n);
}
