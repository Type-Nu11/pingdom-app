import React from 'react';
import { screen } from '@testing-library/react-native';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import { ApiError } from '../../../../shared/api';
import { useCategories, useInfinitePostsByCategory } from '../../hooks/useCommunity';
import type { CommunityPostPage, ListCategoriesResponse } from '../../api/communityApi';
import CommunityBottomSheet from '../CommunityBottomSheet';

jest.mock('../../hooks/useCommunity', () => ({
  useCategories: jest.fn(),
  useInfinitePostsByCategory: jest.fn(),
}));

const navigation = {
  onOpenMap: jest.fn(),
  onOpenPost: jest.fn(),
  onOpenRecommendations: jest.fn(),
  onOpenReservations: jest.fn(),
  onOpenWrite: jest.fn(),
};

function createBottomSheetProps() {
  return {
    collapsedTranslateY: 600,
    height: 700,
    mediumTranslateY: 300,
    onHandlePress: jest.fn(),
    panHandlers: {} as GestureResponderHandlers,
    sheetChromeBottom: new Animated.Value(0),
    sheetTranslateY: new Animated.Value(0),
    snapPoint: 'expanded' as const,
  };
}

const categoriesFixture: ListCategoriesResponse = {
  categories: [
    { categoryId: 'PLACE', categoryName: '장소' },
    { categoryId: 'TRAVEL', categoryName: '여행' },
  ],
};

function categoriesResult(overrides: Record<string, unknown> = {}) {
  return ({
    data: categoriesFixture,
    error: null,
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useCategories>);
}

function postPage(overrides: Partial<CommunityPostPage> = {}): CommunityPostPage {
  return {
    hasNext: false,
    limit: 20,
    page: 1,
    posts: [],
    totalCount: 0,
    totalPages: 0,
    ...overrides,
  };
}

function postsResult(overrides: Record<string, unknown> = {}) {
  return ({
    data: { pages: [postPage()], pageParams: [1] },
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useInfinitePostsByCategory>);
}

async function renderSheet(ui: React.ReactElement) {
  return renderWithProviders(ui, { language: 'ko' });
}

describe('CommunityBottomSheet loading/empty/error states', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
  });

  test('카테고리와 게시글을 불러오는 동안 스켈레톤을 보여준다', async () => {
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({ data: undefined, isLoading: true }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-loading')).toBeVisible();
  });

  test('게시글이 없으면 빈 상태를 보여준다', async () => {
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult());

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-empty')).toBeVisible();
  });

  test('최초 조회 오류는 재시도로 표시하고 재시도를 누르면 다시 조회한다', async () => {
    const refetch = jest.fn();
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(
      postsResult({ data: undefined, error: new ApiError('실패', { status: 500 }), isError: true, refetch }),
    );

    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-error')).toBeVisible();
    await user.press(screen.getByText('다시 시도'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
