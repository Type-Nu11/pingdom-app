import { screen } from '@testing-library/react-native';
import React from 'react';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import FavoritePlacesBottomSheet from '../FavoritePlacesBottomSheetDraft';
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

test('preserved draft keeps category styling and filtering after its V2 move', async () => {
  const { user } = await renderWithProviders(<FavoritePlacesBottomSheet {...props} />);
  await user.press(screen.getByRole('tab', { name: '음식점' }));
  expect(screen.getByRole('tab', { name: '음식점', selected: true })).toHaveStyle({ borderColor: '#FF245B' });
  expect(screen.getByText('저장한 카페')).toBeVisible();
  expect(screen.getByText('저장한 음식점')).toBeVisible();
  expect(screen.queryByText('저장한 문화재')).not.toBeOnTheScreen();
});

test('preserved draft disables pending unfavorite and keeps navigation callbacks', async () => {
  const remove = jest.fn(); const map = jest.fn();
  const { user } = await renderWithProviders(<FavoritePlacesBottomSheet {...props} onRemovePlace={remove} onOpenMap={map} pendingPlaceIds={{ '1': true }} />);
  await user.press(screen.getByRole('button', { name: '저장한 카페 즐겨찾기 해제' }));
  expect(remove).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: '저장한 음식점 즐겨찾기 해제' }));
  expect(remove).toHaveBeenCalledWith(places[2]);
  await user.press(screen.getByRole('button', { name: '지도' }));
  expect(map).toHaveBeenCalledTimes(1);
});
