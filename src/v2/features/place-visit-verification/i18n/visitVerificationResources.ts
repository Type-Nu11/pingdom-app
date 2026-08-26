import type { i18n as I18nInstance } from 'i18next';

import { i18n, initializeI18n } from '../../../shared/i18n';

export const visitVerificationResources = {
  en: {
    addPhotos: 'Add photos',
    back: 'Back',
    contract: {
      multipleReasons: 'Multiple recommendation reasons cannot be submitted until the server defines their storage format.',
      photoUpload: 'Photos cannot be submitted until a tourist review upload endpoint is available.',
    },
    distanceKm: '{{value}}km',
    distanceMeters: '{{value}}m',
    emptyDescription: 'We could not find a place you can verify from your current location. Check your location and try again.',
    emptyTitle: 'No places nearby to verify!',
    errorTitle: 'Could not load recent visits',
    permissionDenied: 'Allow photo library access in Settings to attach photos.',
    permissionTitle: 'Location access is off',
    locationPermissionDenied: 'Allow location access to find places eligible for verification near you.',
    photoCount: '{{count}}/3',
    photoDelete: 'Remove photo {{index}}',
    photoSection: 'Attach photos',
    placeError: 'Could not load this place.',
    placeLoading: 'Loading place information...',
    placePhoto: '{{name}} photo {{index}}',
    reasonHelp: 'Select up to 5',
    reasonSection: 'Recommendation reasons',
    reasons: {
      clean: 'Clean store',
      delicious: 'Delicious',
      easyToFind: 'Easy to find',
      kind: 'Friendly',
      multilingual: 'Good multilingual descriptions',
      parking: 'Easy parking',
      photoSpot: 'Great for photos',
    },
    recentVisits: 'Recent visits',
    retry: 'Try again',
    return: 'Go back',
    reviewPlaceholder: 'Tell others what you liked about this place.',
    reviewSection: 'Write a review',
    submit: 'Verify',
    submitting: 'Submitting...',
    title: 'Verify',
    unknownCategory: 'Place',
    validation: {
      contentRequired: 'Write a review before submitting.',
      contentTooLong: 'Your review must be 2,000 characters or fewer.',
      reasonRequired: 'Select at least one recommendation reason.',
    },
  },
  ko: {
    addPhotos: '사진 선택',
    back: '뒤로',
    contract: {
      multipleReasons: '복수 추천 이유 저장 형식이 서버에 정의되기 전에는 제출할 수 없어요.',
      photoUpload: '관광객 리뷰 사진 업로드 API가 제공되기 전에는 사진을 제출할 수 없어요.',
    },
    distanceKm: '{{value}}km',
    distanceMeters: '{{value}}m',
    emptyDescription: '현재 위치에서 검증할 수 있는 장소를 찾지 못했어요. 현재 위치를 다시 확인해 주세요.',
    emptyTitle: '근처에 검증할 장소가 없어요!',
    errorTitle: '최근 방문을 불러오지 못했어요',
    permissionDenied: '사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요.',
    permissionTitle: '위치 권한이 꺼져 있어요',
    locationPermissionDenied: '주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요.',
    photoCount: '{{count}}/3',
    photoDelete: '{{index}}번째 사진 삭제',
    photoSection: '사진 첨부',
    placeError: '장소 정보를 불러오지 못했어요.',
    placeLoading: '장소 정보를 불러오는 중이에요...',
    placePhoto: '{{name}} 사진 {{index}}',
    reasonHelp: '최대 5개 선택',
    reasonSection: '추천 이유',
    reasons: {
      clean: '매장이 깨끗해요',
      delicious: '맛있어요',
      easyToFind: '찾기 쉬워요',
      kind: '친절해요',
      multilingual: '다국어 설명이 잘 되어 있어요',
      parking: '주차하기 편해요',
      photoSpot: '사진 찍기 좋아요',
    },
    recentVisits: '최근 방문',
    retry: '다시 시도',
    return: '돌아가기',
    reviewPlaceholder: '다른 사람들에게 이 장소의 좋은 점을 알려주세요.',
    reviewSection: '후기 작성',
    submit: '검증하기',
    submitting: '제출 중',
    title: '검증하기',
    unknownCategory: '장소',
    validation: {
      contentRequired: '후기를 작성해 주세요.',
      contentTooLong: '후기는 2,000자 이하로 작성해 주세요.',
      reasonRequired: '추천 이유를 한 개 이상 선택해 주세요.',
    },
  },
} as const;

export function registerVisitVerificationResources(instance: I18nInstance) {
  (['en', 'ko'] as const).forEach((language) => {
    instance.addResourceBundle(
      language,
      'translation',
      { visitVerification: visitVerificationResources[language] },
      true,
      true,
    );
  });
}

export async function initializeVisitVerificationI18n() {
  await initializeI18n();
  registerVisitVerificationResources(i18n);
}
