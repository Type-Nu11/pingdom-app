import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../v2/shared/testing/testProviders';
import MapTopOverlay from '../MapTopOverlay';
import { MAP_TOP_OVERLAY_METRICS } from '../../styles/MapTopOverlay.styles';

const props = {
  activeCategory: 'all' as const,
  onCategoryChange: jest.fn(),
  onLocatePress: jest.fn(),
  onProfilePress: jest.fn(),
  onQueryChange: jest.fn(),
  onSearchFocus: jest.fn(),
  onSubmitSearch: jest.fn(),
  query: '',
};

describe('MapTopOverlay', () => {
  test('검색바와 카테고리를 최소 터치 크기 이상으로 표시한다', () => {
    expect(MAP_TOP_OVERLAY_METRICS.searchHeight).toBe(48);
    expect(MAP_TOP_OVERLAY_METRICS.categoryHeight).toBeGreaterThanOrEqual(38);
    expect(MAP_TOP_OVERLAY_METRICS.searchLabelSize).toBe(17);
    expect(MAP_TOP_OVERLAY_METRICS.categoryLabelSize).toBe(14);
  });

  test('expanded 시트에서는 검색창을 유지하고 지도 카테고리를 숨긴다', async () => {
    await renderWithProviders(<MapTopOverlay {...props} showCategories={false} />);

    expect(screen.getByRole('button', { name: '장소 검색' })).toBeVisible();
    expect(screen.queryByText('전체')).not.toBeOnTheScreen();
    expect(screen.queryByText('음식점')).not.toBeOnTheScreen();
  });

  test('시트가 내려가면 지도 카테고리를 표시한다', async () => {
    const view = await renderWithProviders(<MapTopOverlay {...props} showCategories />);

    expect(screen.getByText('전체')).toBeVisible();
    expect(screen.getByText('음식점')).toBeVisible();
    const locateButton = screen.getByRole('button', { name: '내 위치로 이동' });
    expect(locateButton).toBeVisible();
    expect(locateButton).toHaveStyle({ height: 44, width: 44 });
    await view.user.press(locateButton);
    await view.user.press(locateButton);
    expect(props.onLocatePress).toHaveBeenCalledTimes(2);
  });
});
