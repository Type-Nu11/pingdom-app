import React from 'react';
import { Animated, processColor } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
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
    backgroundColor: 'rgba(228, 228, 229, 0.64)',
    height: 56,
    width: 78,
  });

  const favorites = screen.getByRole('tab', { name: '즐겨찾기', selected: false });
  expect(getMapSheetTabSurfaceColor(false, true)).toBe('rgba(228, 228, 229, 0.82)');
  fireEvent.press(favorites);
  expect(onOpenFavorites).toHaveBeenCalledTimes(1);
});

test('다른 탭에서는 지도 아이콘 내부를 비우고 지도 선택 시 채움형으로 전환한다', async () => {
  const sheetTranslateY = new Animated.Value(0);
  const view = await renderWithProviders(
    <MapSheetBottomNavigation activeTab="favorites" sheetTranslateY={sheetTranslateY} />,
  );
  const outline = () => screen.queryByTestId('map-navigation-map-outline');

  expect(outline()).toHaveProp('fill', null);
  expect(outline()).toHaveProp('stroke', { type: 0, payload: processColor('#3B3B40') });
  expect(screen.getByRole('tab', { name: '지도', selected: false })).toBeVisible();

  await view.rerender(<MapSheetBottomNavigation activeTab="map" sheetTranslateY={sheetTranslateY} />);
  expect(outline()).toBeNull();
  expect(screen.getByRole('tab', { name: '지도', selected: true })).toBeVisible();

  await view.rerender(<MapSheetBottomNavigation activeTab="recommendations" sheetTranslateY={sheetTranslateY} />);
  expect(outline()).toHaveProp('fill', null);
  expect(outline()).toHaveProp('stroke', { type: 0, payload: processColor('#3B3B40') });
});

test('Figma의 하단 16px 간격을 유지하고 시스템 영역은 피한다', () => {
  expect(getMapSheetNavigationBottom(0)).toBe(16);
  expect(getMapSheetNavigationBottom(6)).toBe(16);
  expect(getMapSheetNavigationBottom(34)).toBe(44);
});

test('Android elevation 대신 Figma의 6% 확산 그림자를 사용한다', async () => {
  await renderWithProviders(
    <MapSheetBottomNavigation activeTab="map" sheetTranslateY={new Animated.Value(0)} />,
  );

  expect(screen.getByTestId('map-navigation-recommendations')).toHaveStyle({
    boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)',
  });
  expect(screen.getByTestId('map-navigation-recommendations')).not.toHaveStyle({ elevation: 4 });
});
