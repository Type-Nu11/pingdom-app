import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import MapTopOverlay from '../MapTopOverlay';
import { MAP_TOP_OVERLAY_METRICS } from '../../styles/MapTopOverlay.styles';

const props = {
  activeCategory: 'all' as const,
  onCategoryChange: jest.fn(),
  onLocatePress: jest.fn(),
  onProfilePress: jest.fn(),
  onQueryChange: jest.fn(),
  onRefreshMap: jest.fn(),
  onSearchFocus: jest.fn(),
  onSubmitSearch: jest.fn(),
  query: '',
};

describe('MapTopOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Figma의 검색창·카테고리 비율을 유지하고 작은 칩의 터치 영역을 보완한다', async () => {
    await renderWithProviders(<MapTopOverlay {...props} />);

    expect(MAP_TOP_OVERLAY_METRICS.headerHeight).toBe(60);
    expect(MAP_TOP_OVERLAY_METRICS.searchHeight).toBe(44);
    expect(screen.getByText('검색하기')).toHaveStyle({ fontSize: 18, fontWeight: '500' });
    expect(screen.getByText('전체')).toHaveStyle({ fontSize: 14, fontWeight: '500' });
    expect(screen.getByRole('button', { name: '전체' }).props.hitSlop).toEqual({ top: 5, bottom: 5 });
  });

  test('expanded 시트에서는 검색창을 유지하고 지도 카테고리를 숨긴다', async () => {
    await renderWithProviders(<MapTopOverlay {...props} showCategories={false} />);

    expect(screen.getByRole('button', { name: '지도 장소 검색' })).toBeVisible();
    expect(screen.queryByText('전체')).not.toBeOnTheScreen();
    expect(screen.queryByText('음식점')).not.toBeOnTheScreen();
  });

  test('카테고리마다 Figma 아이콘 원본 비율을 유지해 라벨 간격이 벌어지지 않는다', async () => {
    await renderWithProviders(<MapTopOverlay {...props} />);
    for (const [id, width, height] of [
      ['food', 15, 18], ['music', 18.75, 15.625], ['popup', 18, 17],
      ['fashion', 24, 18], ['beauty', 7, 18], ['art', 18, 18],
      ['cafe', 18.75, 17.709], ['heritage', 21, 18], ['etc', 14, 2],
    ] as const) {
      expect(screen.getByTestId(`map-category-icon-${id}`)).toHaveStyle({ width, height });
    }
  });

  test('카테고리는 Pretendard Medium을 사용하고 선택한 라벨과 테두리만 분홍색으로 바뀐다', async () => {
    const view = await renderWithProviders(<MapTopOverlay {...props} />);
    await waitFor(() => expect(screen.getByText('음식점')).toHaveStyle({
      fontFamily: 'Pretendard', fontSize: 14, fontWeight: '500', lineHeight: 18.2,
    }));
    await view.user.press(screen.getByRole('button', { name: '음식점' }));
    expect(props.onCategoryChange).toHaveBeenCalledWith('food');

    await view.rerender(<MapTopOverlay {...props} activeCategory="food" />);
    expect(screen.getByRole('button', { name: '음식점', selected: true })).toBeVisible();
    expect(screen.getByRole('button', { name: '음식점' })).toHaveStyle({ borderColor: 'rgba(255, 74, 117, 0.88)' });
    expect(screen.getByRole('button', { name: '전체' })).toHaveStyle({ borderColor: 'transparent' });
    expect(screen.getByText('음식점')).toHaveStyle({ color: '#FF1956' });
    expect(screen.getByText('전체')).toHaveStyle({ color: '#5E5E66' });
  });

  test('검색창의 바깥·안쪽 Figma 그림자가 실제 네이티브 View에 전달된다', async () => {
    await renderWithProviders(<MapTopOverlay {...props} />);
    expect(screen.getByTestId('map-header-shadow')).toHaveStyle({
      boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)',
    });
    expect(screen.getByTestId('map-search-inset-shadow')).toHaveStyle({
      boxShadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
    });
  });

  test('시트가 내려가면 지도 카테고리를 표시한다', async () => {
    const view = await renderWithProviders(<MapTopOverlay {...props} showCategories />);

    expect(screen.getByText('전체')).toBeVisible();
    expect(screen.getByText('음식점')).toBeVisible();
    const locateButton = screen.getByRole('button', { name: '내 위치' });
    expect(locateButton).toBeVisible();
    expect(locateButton).toHaveStyle({ height: 44, width: 44 });
    expect(screen.getByTestId('map-locate-icon').props).toEqual(expect.objectContaining({
      color: '#3B3B40',
      height: 20,
      width: 20,
    }));
    await act(async () => {
      fireEvent(screen.getByTestId('map-locate-button'), 'onPressIn');
    });
    expect(screen.getByTestId('map-locate-icon').props.color).toBe('#FF1956');
    await act(async () => {
      fireEvent(screen.getByTestId('map-locate-button'), 'onPressOut');
    });
    expect(screen.getByTestId('map-locate-icon').props.color).toBe('#3B3B40');
    await view.user.press(locateButton);
    await view.user.press(locateButton);
    expect(props.onLocatePress).toHaveBeenCalledTimes(2);
  });

  test('마이페이지와 동일한 사용자 프로필 이미지를 표시한다', async () => {
    await renderWithProviders(
      <MapTopOverlay {...props} profileImageUrl="https://cdn.example.com/profile.jpg" />,
    );

    expect(screen.getByTestId('v2-map-profile-image').props.source).toEqual({
      uri: 'https://cdn.example.com/profile.jpg',
    });
  });

  test('English mode translates visible and accessibility copy without Korean leakage', async () => {
    await renderWithProviders(<MapTopOverlay {...props} showCategories />, { language: 'en' });

    expect(screen.getByRole('button', { name: 'Search places on the map' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'My location' })).toBeVisible();
    expect(screen.getByText('All')).toBeVisible();
    expect(screen.queryByText('전체')).not.toBeOnTheScreen();
  });
});
