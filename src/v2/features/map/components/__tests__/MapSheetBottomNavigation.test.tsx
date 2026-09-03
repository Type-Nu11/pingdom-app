import React from 'react';
import { Animated } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import MapSheetBottomNavigation, {
  getMapSheetNavigationBottom,
  getMapSheetTabSurfaceColor,
} from '../MapSheetBottomNavigation';

test('선택, 기본, pressed 상태를 공통 탭 표현으로 제공한다', async () => {
  const onOpenFavorites = jest.fn();
  await renderWithProviders(
    <MapSheetBottomNavigation
      activeTab="map"
      onOpenFavorites={onOpenFavorites}
      sheetTranslateY={new Animated.Value(0)}
    />,
  );

  expect(screen.getByRole('tab', { name: '지도', selected: true })).toBeVisible();
  expect(screen.getByTestId('map-navigation-map-surface')).toHaveStyle({
    backgroundColor: 'rgba(228, 228, 229, 0.56)',
    height: 56,
    width: 78,
  });

  const favorites = screen.getByRole('tab', { name: '즐겨찾기', selected: false });
  expect(getMapSheetTabSurfaceColor(false, true)).toBe('#EDEDEF');
  fireEvent.press(favorites);
  expect(onOpenFavorites).toHaveBeenCalledTimes(1);
});

test('하단 safe-area inset을 탭 바 위치에 반영한다', () => {
  expect(getMapSheetNavigationBottom(0)).toBe(24);
  expect(getMapSheetNavigationBottom(34)).toBe(44);
});
