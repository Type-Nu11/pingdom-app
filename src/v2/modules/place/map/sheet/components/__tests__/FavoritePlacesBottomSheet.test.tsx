import { MapSheetScrollToTopProvider } from '../../hooks/useMapSheetScrollToTop';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { ScrollView, Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import FavoritePlacesBottomSheet from '../FavoritePlacesBottomSheet';
import type { DecisionPlace } from '../MapBottomSheet';

const places: DecisionPlace[] = [
  {
    address: '카페 주소',
    category: 'CAFE',
    distance: '100m',
    id: 1,
    latitude: 35.6,
    longitude: 128.4,
    name: '저장한 카페',
    tags: [],
    verifiedAgo: 'recently',
    wait: '예약 가능',
  },
  {
    address: '문화재 주소',
    category: 'CULTURAL_HERITAGE',
    distance: '200m',
    id: 2,
    latitude: 35.61,
    longitude: 128.41,
    name: '저장한 문화재',
    tags: [],
    verifiedAgo: 'recently',
    wait: '바로 입장',
  },
  {
    address: '음식점 주소',
    category: 'FOOD',
    distance: '300m',
    id: 3,
    latitude: 35.62,
    longitude: 128.42,
    name: '저장한 음식점',
    tags: [],
    verifiedAgo: 'recently',
    wait: '10분',
  },
];

const props = {
  collapsedTranslateY: 600,
  hasNextPage: false,
  height: 700,
  imageUrlsByPlaceId: {},
  isError: false,
  isFetchNextPageError: false,
  isFetchingNextPage: false,
  isLoading: false,
  isUnauthorized: false,
  mediumTranslateY: 300,
  onHandlePress: jest.fn(),
  onLoadMore: jest.fn(),
  onOpenMap: jest.fn(),
  onPlacePress: jest.fn(),
  onRemovePlace: jest.fn(),
  onRetry: jest.fn(),
  panHandlers: {} as GestureResponderHandlers,
  places,
  sheetChromeBottom: new Animated.Value(0),
  sheetTranslateY: new Animated.Value(300),
  snapPoint: 'medium' as const,
};

describe('FavoritePlacesBottomSheet categories', () => {
  test('목록을 배경과 동일한 하단 경계와 모서리 안에 가둔다', async () => {
    await renderWithProviders(<FavoritePlacesBottomSheet {...props} sheetChromeBottom={new Animated.Value(300)} />);
    expect(screen.getByTestId('favorites-sheet-content-viewport')).toHaveStyle({
      position: 'absolute', overflow: 'hidden', top: 0, bottom: 308, left: 8, right: 8,
      borderBottomLeftRadius: 48, borderBottomRightRadius: 48,
    });
  });

  test('내 장소에서 지도와 동일한 전체 카테고리 탭을 제공한다', async () => {
    await renderWithProviders(<FavoritePlacesBottomSheet {...props} />);

    ['전체', '음악', '음식점', '팝업', '패션', '뷰티', '전시', '카페', '문화재', '기타']
      .forEach((name) => expect(screen.getByRole('tab', { name })).toBeVisible());

    expect(screen.getByRole('tab', { name: '전체', selected: true })).toHaveStyle({
      backgroundColor: 'rgba(255, 201, 211, 0.24)',
      borderColor: 'rgba(255, 74, 117, 0.88)',
    });
    expect(screen.getByRole('tab', { name: '음악', selected: false })).toHaveStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.36)',
      borderColor: 'rgba(255, 255, 255, 0.60)',
    });
  });

  test('카페와 음식점을 분리하고 문화재 서버 별칭을 필터링한다', async () => {
    const { user } = await renderWithProviders(<FavoritePlacesBottomSheet {...props} />);

    await user.press(screen.getByRole('tab', { name: '카페' }));
    expect(screen.getByText('저장한 카페')).toBeVisible();
    expect(screen.queryByText('저장한 음식점')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: '문화재' }));
    expect(screen.getByText('저장한 문화재')).toBeVisible();
    expect(screen.queryByText('저장한 카페')).not.toBeOnTheScreen();
  });
});

test('refresh failure keeps favorites and offers query recovery', async () => {
  const retry = jest.fn().mockResolvedValue({});
  const view = await renderWithProviders(<FavoritePlacesBottomSheet {...props} isError error={new Error('secret')} onRetry={retry} />);
  expect(screen.getByText('저장한 카페')).toBeTruthy();
  expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy();
  await view.user.press(screen.getByText('다시 시도'));
  expect(retry).toHaveBeenCalledTimes(1);
});

test.each([
  ['medium', 8],
  ['expanded', 0],
] as const)('%s 시트 내용은 Figma처럼 시트 가장자리에서 16dp(중간은 시트 8dp 안쪽)에 놓인다', async (snapPoint, inset) => {
  await renderWithProviders(
    <FavoritePlacesBottomSheet {...props} expandedTranslateY={130} snapPoint={snapPoint} />,
  );
  expect(screen.getByTestId('favorites-sheet-inner')).toHaveStyle({ paddingLeft: inset, paddingRight: inset });
});

test('제목과 칩 영역도 시트 드래그를 시작할 수 있다', async () => {
  const onMoveShouldSetResponderCapture = jest.fn();
  await renderWithProviders(
    <FavoritePlacesBottomSheet {...props} panHandlers={{ onMoveShouldSetResponderCapture } as GestureResponderHandlers} />,
  );
  expect(screen.getByTestId('favorites-sheet-header').props.onMoveShouldSetResponderCapture).toBe(onMoveShouldSetResponderCapture);
});

test.each(['LIGHT', 'DARK'] as const)('%s 즐겨찾기는 칩 그림자를 부드럽게 그리고 시트 경계 안에서만 표시한다', async appearancePreference => {
  await renderWithProviders(<FavoritePlacesBottomSheet {...props} />, { appearancePreference });
  expect(screen.getByTestId('favorites-category-scroll')).toHaveStyle({ overflow: 'visible' });
  expect(screen.getByRole('tab', { name: '전체' })).toHaveStyle({
    boxShadow: `0px 2px 8px -2px ${appearancePreference === 'LIGHT' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.40)'}`,
  });
  expect(screen.getByTestId('favorites-sheet-content-viewport')).toHaveStyle({ overflow: 'hidden' });
});

test('더블 탭 요청은 즐겨찾기 필터를 유지하며 목록만 처음으로 이동한다', async () => {
  const scroll = jest.spyOn(ScrollView.prototype, 'scrollTo');
  const ui = (request: number) => <MapSheetScrollToTopProvider value={request}><FavoritePlacesBottomSheet {...props} /></MapSheetScrollToTopProvider>;
  const view = await renderWithProviders(ui(0));
  await view.user.press(screen.getByRole('tab', { name: '카페' }));
  scroll.mockClear();
  await view.rerender(ui(1));
  expect(scroll).toHaveBeenCalledWith({ animated: true, y: 0 });
  expect(screen.getByRole('tab', { name: '카페', selected: true })).toBeVisible();
  expect(screen.getByTestId('favorites-place-scroll').props.contentContainerStyle).toEqual(expect.arrayContaining([expect.objectContaining({ paddingBottom: expect.any(Number) })]));
  scroll.mockRestore();
});
