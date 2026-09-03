import { screen } from '@testing-library/react-native';
import React from 'react';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
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
  test('내 장소에서 지도와 동일한 전체 카테고리 탭을 제공한다', async () => {
    await renderWithProviders(<FavoritePlacesBottomSheet {...props} />);

    ['전체', '음악', '음식점', '팝업', '패션', '뷰티', '전시', '카페', '문화재', '기타']
      .forEach((name) => expect(screen.getByRole('tab', { name })).toBeVisible());

    expect(screen.getByRole('tab', { name: '전체', selected: true })).toHaveStyle({
      backgroundColor: '#FAEDF0',
      borderColor: '#FE5E84',
    });
    expect(screen.getByRole('tab', { name: '음악', selected: false })).toHaveStyle({
      backgroundColor: '#FFFFFF',
      borderColor: '#F2F2F3',
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
