import type { i18n as I18nInstance } from 'i18next';

import { i18n, initializeI18n } from '../../../shared/i18n';

export const placeReportResources = {
  en: {
    placeReport: {
      back: 'Back',
      card: {
        badge: 'First Recorder',
        description: 'woo._sm’s record was the first one left here.',
      },
      category: {
        beauty: 'Beauty',
        cafe: 'Cafe',
        exhibition: 'Exhibition',
        fashion: 'Fashion',
        heritage: 'Heritage',
        music: 'Music',
        other: 'Other',
        popup: 'Pop-up',
        restaurant: 'Restaurant',
      },
      complete: {
        cardAction: 'View place card',
        interestAction: 'Save as a place of interest',
        notice: 'This place is not verified yet. It will become verified as more records are added.',
        title: 'The new place\nis now on the map',
      },
      feature: {
        clean: 'Clean store',
        delicious: 'Delicious',
        easyToFind: 'Easy to find',
        kind: 'Friendly',
        multilingual: 'Multilingual information',
        parking: 'Easy parking',
        photoSpot: 'Great for photos',
      },
      field: {
        caption: 'Caption',
        captionPlaceholder: 'Enter a caption',
        category: 'Category',
        detailAddress: 'Detailed address',
        detailAddressPlaceholder: 'Enter a detailed address',
        features: 'Features',
        operationHours: 'Operating period',
        operationHoursPlaceholder: '09:00 ~ 20:00',
        photo: 'Add 1 photo (required)',
        placeName: 'Place name',
        placeNamePlaceholder: 'Enter the place name',
      },
      firstRecord: {
        submit: 'Report place',
        title: 'Leave the place’s\nfirst record',
      },
      mapEntry: 'Verify',
      prepared: {
        body: 'This action will be connected after the place-report API is available.',
        title: 'Coming soon',
      },
      progress: 'Place report progress',
      progressValue: 'Step {{current}} of {{total}}',
      selectSpot: {
        choose: 'Select',
        locationError: 'Move the map to select the place location.',
        locationReady: 'The marker location is selected.',
        search: 'Search',
        searchAccessibility: 'Search for the report location',
        title: 'Select the location\nof the place to report',
      },
      validation: {
        category: 'Select a category.',
        detailAddress: 'Enter the detailed address.',
        operationHours: 'Enter the operating hours.',
        photo: 'Add one photo.',
        placeName: 'Enter the place name.',
      },
      placeInfo: {
        next: 'Next',
        title: 'Tell us the name and\ncategory of the place',
      },
      photo: {
        add: 'Add a photo',
        delete: 'Remove selected photo',
        errorBody: 'Please try selecting the photo again.',
        errorTitle: 'Could not open photos',
        permissionBody: 'Allow photo access to add a photo.',
        permissionTitle: 'Photo access required',
        selected: 'Selected photo',
      },
    },
  },
  ko: {
    placeReport: {
      back: '뒤로',
      card: {
        badge: 'First Recorder',
        description: '이 장소가 알려지고 변해가는 과정에 woo._sm님의 기록이 첫 번째로 남았어요.',
      },
      category: {
        beauty: '뷰티',
        cafe: '카페',
        exhibition: '전시',
        fashion: '패션',
        heritage: '문화재',
        music: '음악',
        other: '기타',
        popup: '팝업',
        restaurant: '음식점',
      },
      complete: {
        cardAction: '장소 카드 보러가기',
        interestAction: '관심 장소로 등록하기',
        notice: '아직 미검증 장소예요. 다른 유저의 기록이 쌓이면 검증된 장소로 바뀝니다.',
        title: '새로운 장소가\n지도에 올라갔어요',
      },
      feature: {
        clean: '매장이 깨끗해요',
        delicious: '맛있어요',
        easyToFind: '찾기 쉬워요',
        kind: '친절해요',
        multilingual: '다국어 설명이 잘 되어 있어요',
        parking: '주차하기 편해요',
        photoSpot: '사진 찍기 좋아요',
      },
      field: {
        caption: '캡션',
        captionPlaceholder: '캡션을 입력해주세요',
        category: '카테고리',
        detailAddress: '상세 주소',
        detailAddressPlaceholder: '상세 주소를 입력하세요',
        features: '특징',
        operationHours: '운영 기간',
        operationHoursPlaceholder: '09:00 ~ 20:00',
        photo: '사진 1장 추가 (필수)',
        placeName: '장소 이름',
        placeNamePlaceholder: '장소 이름을 입력하세요',
      },
      firstRecord: {
        submit: '장소 제보하기',
        title: '장소의 첫 기록을\n남겨주세요',
      },
      mapEntry: '검증하기',
      prepared: {
        body: '장소 제보 API가 준비되면 연결될 예정입니다.',
        title: '연동 준비 중',
      },
      progress: '장소 제보 진행 단계',
      progressValue: '{{total}}단계 중 {{current}}단계',
      selectSpot: {
        choose: '선택',
        locationError: '지도를 움직여 장소 위치를 선택해 주세요.',
        locationReady: '마커 위치가 선택됐어요.',
        search: '검색하기',
        searchAccessibility: '제보할 위치 검색',
        title: '제보할 장소의\n위치를 선택해 주세요',
      },
      validation: {
        category: '카테고리를 선택해 주세요.',
        detailAddress: '상세 주소를 입력해 주세요.',
        operationHours: '운영 시간을 입력해 주세요.',
        photo: '사진 1장을 추가해 주세요.',
        placeName: '장소 이름을 입력해 주세요.',
      },
      placeInfo: {
        next: '다음',
        title: '장소의 이름과\n카테고리를 알려주세요',
      },
      photo: {
        add: '사진 추가',
        delete: '선택한 사진 삭제',
        errorBody: '사진을 다시 선택해 주세요.',
        errorTitle: '사진을 열지 못했어요',
        permissionBody: '사진을 추가하려면 사진 접근을 허용해 주세요.',
        permissionTitle: '사진 접근 권한이 필요해요',
        selected: '선택한 사진',
      },
    },
  },
} as const;

export function registerPlaceReportResources(instance: I18nInstance) {
  (['en', 'ko'] as const).forEach((language) => {
    instance.addResourceBundle(
      language,
      'translation',
      placeReportResources[language],
      true,
      true,
    );
  });
}

export async function initializePlaceReportI18n() {
  await initializeI18n();
  registerPlaceReportResources(i18n);
}
