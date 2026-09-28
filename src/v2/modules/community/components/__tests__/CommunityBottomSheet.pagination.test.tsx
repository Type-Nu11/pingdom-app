import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
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

describe('CommunityBottomSheet pagination', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
  });

  test('hasNext가 false면 목록 끝에 닿아도 다음 페이지를 요청하지 않는다', async () => {
    const fetchNextPage = jest.fn();
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: { pages: [postPage({ hasNext: false, posts: [{ postId: 1, title: '글 1' }] })], pageParams: [1] },
      fetchNextPage,
      hasNextPage: false,
    }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    await screen.findByTestId('v2-community-post-list');

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  test('hasNext가 true면 목록 끝에 닿았을 때 다음 페이지를 조회한다', async () => {
    const fetchNextPage = jest.fn();
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: { pages: [postPage({ hasNext: true, posts: [{ postId: 1, title: '첫 페이지 글' }], totalPages: 2 })], pageParams: [1] },
      fetchNextPage,
      hasNextPage: true,
    }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    const list = await screen.findByTestId('v2-community-post-list');

    fireEvent(list, 'onEndReached');

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test('다음 페이지 조회가 실패하면 재시도 버튼을 보여주고 자동 재요청하지 않는다', async () => {
    const fetchNextPage = jest.fn();
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: { pages: [postPage({ hasNext: true, posts: [{ postId: 1, title: '첫 페이지 글' }], totalPages: 2 })], pageParams: [1] },
      fetchNextPage,
      hasNextPage: true,
      isFetchNextPageError: true,
    }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    const list = await screen.findByTestId('v2-community-post-list');

    expect(screen.getByText('게시글을 더 불러오지 못했어요.')).toBeVisible();

    fireEvent(list, 'onEndReached');
    fireEvent(list, 'onEndReached');

    // Reaching the end again while a fetch-next-page error stands doesn't
    // auto-retry; only the explicit retry button does.
    expect(fetchNextPage).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('다시 시도'));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
