import React, { useState } from 'react';
import { Animated, PanResponder, processColor, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import MapSheetBottomNavigation, {
  MapSheetNavigationHiddenProvider,
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

test('iOS는 Figma처럼 화면 아래 16px에 두고 Android는 시스템 내비게이션 영역을 피한다', () => {
  expect(getMapSheetNavigationBottom(0, 'ios')).toBe(16);
  expect(getMapSheetNavigationBottom(34, 'ios')).toBe(16);
  expect(getMapSheetNavigationBottom(0, 'android')).toBe(16);
  expect(getMapSheetNavigationBottom(6, 'android')).toBe(16);
  expect(getMapSheetNavigationBottom(48, 'android')).toBe(58);
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

test('누른 채 오른쪽으로 움직이면 즐겨찾기·커뮤니티·예약을 연속 선택하고 되돌아갈 수 있다', async () => {
  const create = jest.spyOn(PanResponder, 'create');
  const selected = jest.fn();
  const sheetTranslateY = new Animated.Value(0);
  function Navigation() {
    const [tab, setTab] = useState<'map' | 'favorites' | 'community' | 'reservations'>('map');
    const open = (next: typeof tab) => { selected(next); setTab(next); };
    return <MapSheetBottomNavigation activeTab={tab} sheetTranslateY={sheetTranslateY}
      onOpenMap={() => open('map')} onOpenFavorites={() => open('favorites')}
      onOpenCommunity={() => open('community')} onOpenReservations={() => open('reservations')} />;
  }
  try {
    await renderWithProviders(<Navigation />);
    await act(() => screen.getByTestId('map-navigation-swipe').props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 328, height: 64 } } }));
    const handler = create.mock.calls.at(-1)![0];
    const event = {} as GestureResponderEvent;
    const gesture = (moveX: number, dx = 0, dy = 0) => ({ moveX, dx, dy } as PanResponderGestureState);
    expect(handler.onMoveShouldSetPanResponderCapture?.(event, gesture(68, 2))).toBe(false);
    expect(handler.onMoveShouldSetPanResponderCapture?.(event, gesture(68, 3, 40))).toBe(false);
    expect(handler.onMoveShouldSetPanResponderCapture?.(event, gesture(68, 40, 40))).toBe(false);
    expect(handler.onMoveShouldSetPanResponderCapture?.(event, gesture(148, 80, 3))).toBe(true);
    await act(() => handler.onPanResponderGrant?.(event, gesture(68)));
    for (const [x, label] of [[148, '즐겨찾기'], [228, '커뮤니티'], [308, '예약'], [228, '커뮤니티'], [148, '즐겨찾기'], [68, '지도']] as const) {
      await act(() => handler.onPanResponderMove?.(event, gesture(x)));
      expect(screen.getByRole('tab', { name: label, selected: true })).toBeVisible();
      // Moving inside the same tab must not navigate or restart requests again.
      await act(() => handler.onPanResponderMove?.(event, gesture(x + 1)));
    }
    await act(() => handler.onPanResponderRelease?.(event, gesture(68)));
    expect(selected.mock.calls.map(([tab]) => tab)).toEqual(['favorites', 'community', 'reservations', 'community', 'favorites', 'map']);
    expect(create).toHaveBeenCalledTimes(1);
  } finally { create.mockRestore(); }
});

test('시트 내부 하단바를 숨겨도 화면이 소유한 하단바는 유지한다', async () => {
  await renderWithProviders(<>
    <MapSheetNavigationHiddenProvider value={true}>
      <MapSheetBottomNavigation activeTab="community" sheetTranslateY={new Animated.Value(0)} />
    </MapSheetNavigationHiddenProvider>
    <MapSheetBottomNavigation activeTab="community" sheetTranslateY={new Animated.Value(0)} />
  </>);
  expect(screen.getAllByTestId('map-navigation-swipe')).toHaveLength(1);
  expect(screen.getAllByRole('tab')).toHaveLength(5);
});
