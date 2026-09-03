import { act, cleanup, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { ApiError } from '../../../../shared/api';
import { registerVisitVerificationResources } from '../../i18n/visitVerificationResources';
import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
import VisitVerificationMapCta from '../../components/VisitVerificationMapCta';
import VisitVerificationPlacesScreen from '../VisitVerificationPlacesScreen';
import VisitVerificationReviewScreen from '../VisitVerificationReviewScreen';
import VisitVerificationSessionScreen from '../VisitVerificationSessionScreen';

const mockUseCandidates = jest.fn();
const mockUsePlaceCard = jest.fn();
const mockUseSubmit = jest.fn();
const mockUseLocationPermission = jest.fn();
const mockUseSessionController = jest.fn();

jest.mock('../../hooks/useVisitVerificationCandidates', () => ({
  useVisitVerificationCandidates: () => mockUseCandidates(),
}));
jest.mock('../../../place-exploration/hooks/usePlaceExploration', () => ({
  usePlaceCard: () => mockUsePlaceCard(),
}));
jest.mock('../../hooks/useSubmitVisitVerification', () => ({
  useSubmitVisitVerification: () => mockUseSubmit(),
}));
jest.mock('../../hooks/useLocationPermissionStatus', () => ({
  useLocationPermissionStatus: () => mockUseLocationPermission(),
}));
jest.mock('../../hooks/useVisitVerificationSessionController', () => ({
  useVisitVerificationSessionController: () => mockUseSessionController(),
}));

const place = {
  id: 17,
  name: '매우 길지만 한 줄에서 잘려야 하는 실제 서버 장소 이름',
  category: '음식점',
  imageUrl: null,
};

async function renderFeature(ui: React.ReactElement, language: 'en' | 'ko' = 'ko') {
  const i18n = await createTestI18n(language);
  registerVisitVerificationResources(i18n);
  return renderWithProviders(ui, { i18n });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePlaceCard.mockReturnValue({ data: place, isError: false, isLoading: false });
  mockUseSubmit.mockReturnValue({ error: null, isError: false, isPending: false, mutateAsync: jest.fn() });
  mockUseLocationPermission.mockReturnValue('granted');
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: null,
    error: null,
    isBusy: false,
    phase: 'idle',
    retry: jest.fn(),
    session: null,
    start: jest.fn(),
  });
});
afterEach(async () => {
  await cleanup();
});

test('floating CTA blocks consecutive taps and unlocks again', async () => {
  const onPress = jest.fn();
  const view = await renderFeature(<VisitVerificationMapCta label="검증하기" onPress={onPress} />);

  await view.user.press(view.getByTestId('visit-verification-map-cta'));
  await view.user.press(view.getByTestId('visit-verification-map-cta'));
  expect(onPress).toHaveBeenCalledTimes(1);

  await new Promise((resolve) => setTimeout(resolve, 550));
  await view.user.press(view.getByTestId('visit-verification-map-cta'));
  expect(onPress).toHaveBeenCalledTimes(2);
});

test('recent visits render the normal empty state', async () => {
  const onBack = jest.fn();
  const onSelectPlace = jest.fn();
  mockUseCandidates.mockReturnValueOnce({
    candidates: [],
    checkInsQuery: { isError: false, isLoading: false },
  });
  const view = await renderFeature(<VisitVerificationPlacesScreen onBack={onBack} onSelectPlace={onSelectPlace} />);
  expect(view.getByTestId('visit-verification-empty')).toBeVisible();
  expect(view.getByTestId('visit-verification-empty-icon')).toBeVisible();
  expect(view.getByText('근처에 검증할 장소가 없어요!')).toBeVisible();
  expect(view.getByText('현재 위치에서 검증할 수 있는 장소를 찾지 못했어요\n현재 위치를 다시 확인해주세요')).toBeVisible();
  expect(view.queryByRole('header', { name: '검증하기' })).toBeNull();
  await view.user.press(view.getByRole('button', { name: '돌아가기' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('location permission denial is not presented as a normal empty list', async () => {
  mockUseLocationPermission.mockReturnValue('denied');
  mockUseCandidates.mockReturnValue({
    candidates: [],
    checkInsQuery: { isError: false, isLoading: false },
  });
  const view = await renderFeature(<VisitVerificationPlacesScreen onBack={jest.fn()} onSelectPlace={jest.fn()} />);
  expect(view.getByTestId('visit-verification-permission-denied')).toBeVisible();
  expect(view.queryByTestId('visit-verification-empty')).toBeNull();
});

test('recent visit errors expose retry', async () => {
  const onBack = jest.fn();
  const refetch = jest.fn();
  mockUseCandidates.mockReturnValueOnce({
    candidates: [],
    checkInsQuery: { error: new ApiError('offline', { isNetworkError: true }), isError: true, isLoading: false, refetch },
  });
  const view = await renderFeature(<VisitVerificationPlacesScreen onBack={onBack} onSelectPlace={jest.fn()} />);
  fireEvent.press(view.getByText('다시 시도'));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('ready recent visits pass actual place and check-in IDs', async () => {
  const onSelectPlace = jest.fn();
  mockUseCandidates.mockReturnValueOnce({
    candidates: [{
      address: '대구광역시 달성군 아주 긴 도로명 주소 123-45',
      category: '음식점',
      checkInId: 7001,
      distanceMeters: 123,
      error: null,
      imageUrls: [],
      name: place.name,
      placeId: 17,
      retry: jest.fn(),
      status: 'ready',
    }],
    checkInsQuery: {
      fetchNextPage: jest.fn(), hasNextPage: false, isError: false,
      isFetchNextPageError: false, isFetchingNextPage: false, isLoading: false,
    },
  });
  const view = await renderFeature(<VisitVerificationPlacesScreen onBack={jest.fn()} onSelectPlace={onSelectPlace} />);
  expect(view.getByTestId('visit-place-image-fallback')).toBeVisible();
  fireEvent.press(view.getByTestId('visit-place-7001'));
  expect(onSelectPlace).toHaveBeenCalledWith({ checkInId: 7001, placeId: 17 });
});

test('review UI caps local photos and reasons without blocking submission for local photo URIs', async () => {
  const mutateAsync = jest.fn();
  mockUseSubmit.mockReturnValue({ error: null, isError: false, isPending: false, mutateAsync });
  const photos = Array.from({ length: 4 }, (_, index) => ({ height: 10, width: 10, uri: `file://${index}` }));
  const mediaPicker = { pickPhotos: jest.fn().mockResolvedValue({ photos, status: 'selected' }) };
  const view = await renderFeature(<VisitVerificationReviewScreen mediaPicker={mediaPicker} onBack={jest.fn()} onComplete={jest.fn()} placeId={17} />);

  expect(view.getByTestId('visit-photo-picker-icon')).toBeVisible();
  expect(view.getByTestId('visit-review-input').props.placeholderTextColor).toBe('#767680');
  for (const reason of ['kind', 'easyToFind', 'delicious', 'multilingual', 'parking', 'photoSpot', 'clean']) {
    expect(view.getByTestId(`visit-reason-icon-${reason}`, { includeHiddenElements: true })).toBeTruthy();
  }
  await view.user.press(view.getByTestId('visit-photo-picker'));
  expect(view.getAllByLabelText(/번째 사진 삭제/)).toHaveLength(3);
  for (const reason of ['kind', 'easyToFind', 'delicious', 'multilingual', 'parking', 'photoSpot']) {
    await view.user.press(view.getByTestId(`visit-reason-${reason}`));
  }
  expect(view.getByTestId('visit-reason-photoSpot')).toBeDisabled();
  await view.user.type(view.getByTestId('visit-review-input'), '좋았어요.');
  await view.user.press(view.getByTestId('visit-submit'));
  expect(mutateAsync).toHaveBeenCalledWith({
    body: {
      content: '좋았어요.',
      recommendReason: '친절해요, 찾기 쉬워요, 맛있어요, 다국어 설명이 잘 되어 있어요, 주차하기 편해요',
    },
    placeId: 17,
  });
});

test('review submits up to three uploaded image URLs and multiple recommendation reasons', async () => {
  const mutateAsync = jest.fn().mockResolvedValue({ reviewId: 91 });
  const onComplete = jest.fn();
  mockUseSubmit.mockReturnValue({ error: null, isError: false, isPending: false, mutateAsync });
  const photos = Array.from({ length: 3 }, (_, index) => ({
    height: 10,
    uri: `https://cdn.example.com/reviews/${index}.jpg`,
    width: 10,
  }));
  const mediaPicker = { pickPhotos: jest.fn().mockResolvedValue({ photos, status: 'selected' }) };
  const view = await renderFeature(<VisitVerificationReviewScreen mediaPicker={mediaPicker} onBack={jest.fn()} onComplete={onComplete} placeId={17} />);

  await view.user.press(view.getByTestId('visit-photo-picker'));
  await view.user.press(view.getByTestId('visit-reason-kind'));
  await view.user.press(view.getByTestId('visit-reason-clean'));
  await view.user.type(view.getByTestId('visit-review-input'), '정말 좋았어요.');
  await view.user.press(view.getByTestId('visit-submit'));

  expect(mutateAsync).toHaveBeenCalledWith({
    body: {
      content: '정말 좋았어요.',
      imageUrls: photos.map((photo) => photo.uri),
      recommendReason: '친절해요, 매장이 깨끗해요',
    },
    placeId: 17,
  });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

test('confirmed one-reason text submission is locked against duplicate requests', async () => {
  let resolveMutation!: (value: unknown) => void;
  const mutateAsync = jest.fn(() => new Promise((resolve) => { resolveMutation = resolve; }));
  const onComplete = jest.fn();
  mockUseSubmit.mockReturnValue({ error: null, isError: false, isPending: false, mutateAsync });
  const view = await renderFeature(<VisitVerificationReviewScreen onBack={jest.fn()} onComplete={onComplete} placeId={17} />);

  await view.user.press(view.getByTestId('visit-reason-kind'));
  await view.user.type(view.getByTestId('visit-review-input'), '정말 친절했어요.');
  await view.user.press(view.getByTestId('visit-submit'));
  await view.user.press(view.getByTestId('visit-submit'));
  expect(mutateAsync).toHaveBeenCalledTimes(1);
  expect(mutateAsync).toHaveBeenCalledWith({
    body: { content: '정말 친절했어요.', recommendReason: '친절해요' },
    placeId: 17,
  });

  await act(async () => { resolveMutation({ reviewId: 91 }); });
  expect(onComplete).toHaveBeenCalledTimes(1);
});

test('session start UI is accessible in Korean and blocks duplicate work through controller state', async () => {
  const start = jest.fn();
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: null,
    error: null,
    isBusy: false,
    phase: 'idle',
    retry: jest.fn(),
    session: null,
    start,
  });
  const view = await renderFeature(<VisitVerificationSessionScreen onBack={jest.fn()} onComplete={jest.fn()} placeId={17} />);
  await view.user.press(view.getByText('방문 인증 시작'));
  expect(start).toHaveBeenCalledTimes(1);
  expect(view.getByRole('button', { name: '뒤로' })).toBeVisible();
});

test('session UI renders server progress metrics and terminal states in English', async () => {
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: 41,
    error: null,
    isBusy: false,
    phase: 'observing',
    retry: jest.fn(),
    session: {
      id: 9201,
      status: 'PROXIMITY_LOST',
      requiredRadiusMeters: 24,
      requiredDwellSeconds: 75,
      remainingSeconds: 45,
      verifiedDwellSeconds: 34,
      latestDistanceMeters: 31,
      completedCheckInId: null,
      reviewEligible: false,
    },
    start: jest.fn(),
  });
  const view = await renderFeature(<VisitVerificationSessionScreen onBack={jest.fn()} onComplete={jest.fn()} placeId={17} />, 'en');
  expect(view.getByText('You left the allowed radius')).toBeVisible();
  expect(view.getByText('45 seconds remaining')).toBeVisible();
  expect(view.getByText('Allowed radius: 24m')).toBeVisible();
  expect(view.getByText('Required stay: 75 seconds')).toBeVisible();
  expect(view.getByText('Verified stay: 34 seconds')).toBeVisible();
});

test('session UI displays the default 500m and 30-second server policy unchanged', async () => {
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: 29,
    error: null,
    isBusy: false,
    phase: 'observing',
    retry: jest.fn(),
    session: {
      id: 9201,
      placeId: 17,
      status: 'STARTED',
      requiredRadiusMeters: 500,
      requiredDwellSeconds: 30,
      verifiedDwellSeconds: 0,
      remainingSeconds: 30,
    },
    start: jest.fn(),
  });
  const view = await renderFeature(<VisitVerificationSessionScreen mode="foreground" onBack={jest.fn()} onComplete={jest.fn()} />);
  expect(view.getByText('허용 반경: 500m')).toBeVisible();
  expect(view.getByText('요구 체류 시간: 30초')).toBeVisible();
  expect(view.getByText('인증된 체류 시간: 0초')).toBeVisible();
  expect(view.getByText('남은 시간: 30초')).toBeVisible();
});

test.each([
  ['ambiguous-place', '현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요.'],
  ['proximity-lost', '반경 이탈'],
  ['network-error', '네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요.'],
])('foreground error phase %s has distinct copy', async (phase, message) => {
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: null,
    error: null,
    isBusy: false,
    phase,
    retry: jest.fn(),
    session: null,
    start: jest.fn(),
  });
  const view = await renderFeature(<VisitVerificationSessionScreen mode="foreground" onBack={jest.fn()} onComplete={jest.fn()} />);
  expect(view.getByText(message)).toBeVisible();
});

test('foreground 404 uses the dedicated nearby-place empty design', async () => {
  const onBack = jest.fn();
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: null,
    error: null,
    isBusy: false,
    phase: 'no-place',
    retry: jest.fn(),
    session: null,
    start: jest.fn(),
  });
  const view = await renderFeature(<VisitVerificationSessionScreen mode="foreground" onBack={onBack} onComplete={jest.fn()} />);
  expect(view.getByTestId('visit-verification-foreground-no-place')).toBeVisible();
  expect(view.getByTestId('visit-verification-foreground-no-place-icon')).toBeVisible();
  expect(view.getByText('근처에 검증할 장소가 없어요!')).toBeVisible();
  await view.user.press(view.getByRole('button', { name: '돌아가기' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('completed verification leaves the session UI and opens the recent visit flow once', async () => {
  const onComplete = jest.fn();
  mockUseSessionController.mockReturnValue({
    displayRemainingSeconds: 0,
    error: null,
    isBusy: false,
    phase: 'observing',
    retry: jest.fn(),
    session: {
      id: 9201,
      placeId: 88,
      status: 'COMPLETED',
      remainingSeconds: 0,
      completedCheckInId: 7002,
      reviewEligible: true,
    },
    start: jest.fn(),
  });
  await renderFeature(<VisitVerificationSessionScreen onBack={jest.fn()} onComplete={onComplete} placeId={17} />);
  expect(onComplete).toHaveBeenCalledTimes(1);
});
