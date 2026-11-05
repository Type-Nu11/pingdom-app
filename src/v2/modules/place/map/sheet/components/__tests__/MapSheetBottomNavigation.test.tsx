import React, { useState } from 'react';
import { Animated, PanResponder, processColor, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import MapSheetBottomNavigation, {
  MapSheetNavigationHiddenProvider,
  getMapSheetNavigationBottom,
  getMapSheetCollapsedVisibleHeight,
  getMapSheetTabSurfaceColor,
} from '../MapSheetBottomNavigation';

test('다른 탭을 누르는 동안에도 실제 선택된 탭만 강조한다', async () => {
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
    borderWidth: 1,
    height: 56,
    paddingLeft: 2,
    paddingTop: 6,
    width: '100%',
    maxWidth: 78,
  });

  const favorites = screen.getByRole('tab', { name: '즐겨찾기', selected: false });
  expect(getMapSheetTabSurfaceColor(false)).toBe('transparent');
  await fireEvent(favorites, 'pressIn');
  expect(screen.getByTestId('map-navigation-favorites-surface')).toHaveStyle({ backgroundColor: 'transparent' });
  expect(screen.getByTestId('map-navigation-map-surface')).toHaveStyle({ backgroundColor: 'rgba(228, 228, 229, 0.64)' });
  await fireEvent(favorites, 'pressOut');
  fireEvent.press(favorites);
  expect(onOpenFavorites).toHaveBeenCalledTimes(1);
});

test('다른 탭에서는 지도 아이콘 내부를 비우고 지도 선택 시 채움형으로 전환한다', async () => {
  const sheetTranslateY = new Animated.Value(0);
  const view = await renderWithProviders(
    <MapSheetBottomNavigation activeTab="favorites" sheetTranslateY={sheetTranslateY} />,
  );
  const outline = () => screen.queryByTestId('map-navigation-map-outline');

  // Figma 18×20.4 icon drawn 1:1 in its 18×21 box.
  expect(outline()).toHaveProp('color', '#3B3B40');
  expect(outline()).toHaveProp('height', 21);
  expect(outline()).toHaveProp('width', 18);
  expect(screen.getByRole('tab', { name: '지도', selected: false })).toBeVisible();

  await view.rerender(<MapSheetBottomNavigation activeTab="map" sheetTranslateY={sheetTranslateY} />);
  expect(outline()).toBeNull();
  expect(screen.getByTestId('map-navigation-map-filled')).toHaveProp('color', '#FF1956');
  expect(screen.getByRole('tab', { name: '지도', selected: true })).toBeVisible();

  await view.rerender(<MapSheetBottomNavigation activeTab="recommendations" sheetTranslateY={sheetTranslateY} />);
  expect(outline()).toHaveProp('color', '#3B3B40');
});

test('Figma Footer처럼 75px 탭이 10px씩 겹치고 비선택 아이콘·라벨은 Label/Neutral을 쓴다', async () => {
  await renderWithProviders(
    <MapSheetBottomNavigation activeTab="map" sheetTranslateY={new Animated.Value(0)} />,
    { appearancePreference: 'DARK' },
  );
  const tab = (id: string) => screen.getByTestId(`map-navigation-${id}-tab`);
  expect(tab('map')).toHaveStyle({ flex: 1, marginRight: -10 });
  expect(tab('reservations')).toHaveStyle({ flex: 1 });
  expect(tab('reservations')).not.toHaveStyle({ marginRight: -10 });
  expect(screen.getByTestId('map-navigation-map-surface')).toHaveStyle({ borderColor: 'rgba(255, 255, 255, 0.20)' });
  expect(screen.getByTestId('map-navigation-favorites-surface')).toHaveStyle({ borderColor: 'transparent' });
  expect(screen.getByText('즐겨찾기')).toHaveStyle({ color: '#D2D2D6' });
  expect(screen.getByText('지도')).toHaveStyle({ color: '#FF1956' });
});

test('iOS는 Figma처럼 화면 아래 16px에 두고 Android는 시스템 내비게이션 영역을 피한다', () => {
  expect(getMapSheetNavigationBottom(0, 'ios')).toBe(16);
  expect(getMapSheetNavigationBottom(34, 'ios')).toBe(16);
  expect(getMapSheetNavigationBottom(0, 'android')).toBe(16);
  expect(getMapSheetNavigationBottom(6, 'android')).toBe(16);
  expect(getMapSheetNavigationBottom(48, 'android')).toBe(58);
});

test.each([0, 6, 24, 48])('접힌 시트도 Android 하단 여백 %sdp에서 손잡이가 고정 메뉴 위에 남는다', bottomInset => {
  const visibleHeight = getMapSheetCollapsedVisibleHeight(bottomInset, 'android');
  const navigationTopFromBottom = getMapSheetNavigationBottom(bottomInset, 'android') + 64;
  expect(visibleHeight - 20).toBeGreaterThanOrEqual(navigationTopFromBottom + 8);
});

test('iOS 홈 인디케이터가 있어도 접힌 손잡이가 메뉴에 가려지지 않는다', () => {
  expect(getMapSheetCollapsedVisibleHeight(34, 'ios')).toBe(108);
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
    expect(screen.getByTestId('map-navigation-drag-indicator')).toBeVisible();
    await act(() => handler.onPanResponderMove?.(event, gesture(140)));
    expect(selected).not.toHaveBeenCalled();
    expect(screen.getByTestId('map-navigation-drag-indicator')).toHaveStyle({
      transform: [{ translateX: 77 }],
    });
    await act(() => handler.onPanResponderMove?.(event, gesture(150)));
    expect(screen.getByTestId('map-navigation-drag-indicator')).toHaveStyle({
      transform: [{ translateX: 87 }],
    });
    for (const [x, label] of [[148, '즐겨찾기'], [228, '커뮤니티'], [308, '예약'], [228, '커뮤니티'], [148, '즐겨찾기'], [68, '지도']] as const) {
      await act(() => handler.onPanResponderMove?.(event, gesture(x)));
      await act(() => new Promise(resolve => setTimeout(resolve, 120)));
      expect(screen.getByRole('tab', { name: label, selected: true })).toBeVisible();
      // Moving inside the same tab must not navigate or restart requests again.
      await act(() => handler.onPanResponderMove?.(event, gesture(x + 1)));
    }
    await act(() => handler.onPanResponderRelease?.(event, gesture(68)));
    expect(screen.queryByTestId('map-navigation-drag-indicator')).toBeNull();
    expect(selected.mock.calls.map(([tab]) => tab)).toEqual(['favorites', 'community', 'reservations', 'community', 'favorites', 'map']);
    expect(create).toHaveBeenCalledTimes(1);
    selected.mockClear();
    await act(() => handler.onPanResponderGrant?.(event, gesture(68)));
    for (const x of [148, 228, 308]) {
      await act(() => handler.onPanResponderMove?.(event, gesture(x)));
      await act(() => new Promise(resolve => setTimeout(resolve, 10)));
    }
    expect(selected).not.toHaveBeenCalled();
    await act(() => new Promise(resolve => setTimeout(resolve, 120)));
    expect(selected.mock.calls.map(([tab]) => tab)).toEqual(['reservations']);
    // Terminating a later drag must cancel its pending page switch.
    await act(() => handler.onPanResponderMove?.(event, gesture(148)));
    await act(() => handler.onPanResponderTerminate?.(event, gesture(148)));
    await act(() => new Promise(resolve => setTimeout(resolve, 120)));
    expect(selected).toHaveBeenCalledTimes(1);
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

test.each(['LIGHT', 'DARK'] as const)('%s 예약 선택은 Figma checkIn(28px, 체크 컷아웃) 채움 아이콘으로 표시한다', async appearancePreference => {
  await renderWithProviders(
    <MapSheetBottomNavigation activeTab="reservations" sheetTranslateY={new Animated.Value(0)} />,
    { appearancePreference },
  );
  const icon = screen.getByTestId('map-navigation-reservations-selected-icon');
  expect(icon).toHaveProp('color', '#FF1956');
  expect(icon).toHaveProp('width', 28);
  expect(icon).toHaveProp('height', 28);
  expect(screen.getByTestId('map-navigation-reservations-surface')).toHaveStyle({ width: '100%', maxWidth: 78 });
});

test.each([
  ['LIGHT', 'rgba(228, 228, 229, 0.64)', 'rgba(255, 255, 255, 0)'],
  ['DARK', 'rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.20)'],
] as const)('%s 장소추천 선택은 내부를 채운 아이콘과 안쪽 원형 선택면으로 표시한다', async (appearancePreference, surface, stroke) => {
  const view = await renderWithProviders(
    <MapSheetBottomNavigation activeTab="map" sheetTranslateY={new Animated.Value(0)} />,
    { appearancePreference },
  );
  expect(screen.queryByTestId('map-navigation-recommendations-selected-icon')).toBeNull();
  expect(screen.queryByTestId('map-navigation-recommendations-selected')).toBeNull();

  await view.rerender(<MapSheetBottomNavigation activeTab="recommendations" sheetTranslateY={new Animated.Value(0)} />);
  expect(screen.getByTestId('map-navigation-recommendations-selected-icon')).toHaveProp('color', '#FF1956');
  expect(screen.getByTestId('map-navigation-recommendations-selected')).toHaveStyle({
    backgroundColor: surface,
    borderColor: stroke,
    borderWidth: 1,
    height: 56,
    left: 4,
    top: 4,
    width: 56,
  });
  expect(screen.getByRole('tab', { name: '장소추천', selected: true })).toBeVisible();
});

test.each([
  ['map', '지도'], ['favorites', '즐겨찾기'], ['community', '커뮤니티'],
  ['reservations', '예약'], ['recommendations', '장소추천'],
] as const)('%s 시트는 350ms 안에 같은 버튼을 두 번 눌렀을 때만 올린다', async (activeTab, label) => {
  let time = 1000;
  const clock = jest.spyOn(Date, 'now').mockImplementation(() => time);
  const onDoublePress = jest.fn();
  const onOpen = jest.fn();
  await renderWithProviders(<MapSheetBottomNavigation activeTab={activeTab} onDoublePress={onDoublePress}
    onOpenMap={onOpen} onOpenFavorites={onOpen} onOpenCommunity={onOpen}
    onOpenReservations={onOpen} onOpenRecommendations={onOpen} sheetTranslateY={new Animated.Value(0)} />);
  const tab = screen.getByRole('tab', { name: label });
  await fireEvent.press(tab);
  expect(onDoublePress).not.toHaveBeenCalled();
  expect(onOpen).not.toHaveBeenCalled();
  time += 400;
  await fireEvent.press(tab);
  expect(onDoublePress).not.toHaveBeenCalled();
  time += 200;
  await fireEvent.press(tab);
  expect(onDoublePress).toHaveBeenCalledTimes(1);
  expect(onDoublePress).toHaveBeenCalledWith(activeTab);
  expect(onOpen).not.toHaveBeenCalled();
  clock.mockRestore();
});

test('다른 탭을 한 번 누르면 전환하고 두 번째 연속 탭에만 시트를 올린다', async () => {
  const onDoublePress = jest.fn();
  function Navigation() {
    const [tab, setTab] = useState<'map' | 'favorites' | 'community'>('map');
    return <MapSheetBottomNavigation activeTab={tab} onDoublePress={onDoublePress}
      onOpenFavorites={() => setTab('favorites')} onOpenCommunity={() => setTab('community')}
      sheetTranslateY={new Animated.Value(0)} />;
  }
  await renderWithProviders(<Navigation />);
  await fireEvent.press(screen.getByRole('tab', { name: '즐겨찾기' }));
  expect(screen.getByRole('tab', { name: '즐겨찾기', selected: true })).toBeVisible();
  expect(onDoublePress).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('tab', { name: '커뮤니티' }));
  expect(onDoublePress).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('tab', { name: '커뮤니티' }));
  expect(onDoublePress).toHaveBeenCalledTimes(1);
  expect(onDoublePress).toHaveBeenCalledWith('community');
});
