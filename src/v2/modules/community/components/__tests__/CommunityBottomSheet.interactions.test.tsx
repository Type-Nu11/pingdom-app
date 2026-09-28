import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
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

describe('CommunityBottomSheet interactions', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
  });

  test('카테고리를 누르면 해당 카테고리로 게시글 조회를 전환한다', async () => {
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: { pages: [postPage({ posts: [{ postId: 1, title: '장소 글' }] })], pageParams: [1] },
    }));

    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    expect(await screen.findByText('장소 글')).toBeVisible();
    expect(useInfinitePostsByCategory).toHaveBeenLastCalledWith('PLACE', expect.anything(), expect.anything());

    await user.press(screen.getByTestId('v2-community-sheet-category-TRAVEL'));

    expect(useInfinitePostsByCategory).toHaveBeenLastCalledWith('TRAVEL', expect.anything(), expect.anything());
  });

  test('게시글을 누르면 상세로 이동한다', async () => {
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: { pages: [postPage({ posts: [{ postId: 42, title: '눌러볼 글' }] })], pageParams: [1] },
    }));
    const onOpenPost = jest.fn();

    const { user } = await renderSheet(
      <CommunityBottomSheet {...createBottomSheetProps()} {...navigation} onOpenPost={onOpenPost} />,
    );

    const post = await screen.findByTestId('v2-community-post-42');
    await user.press(post);
    expect(onOpenPost).toHaveBeenCalledWith(42);
  });

  test('관심없음을 선택하면 해당 글을 목록에서 즉시 감춘다', async () => {
    jest.mocked(useInfinitePostsByCategory).mockReturnValue(postsResult({
      data: {
        pages: [postPage({ posts: [{ postId: 1, title: '숨길 글' }, { postId: 2, title: '남을 글' }] })],
        pageParams: [1],
      },
    }));

    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    expect(await screen.findByText('숨길 글')).toBeVisible();

    await user.press(screen.getByTestId('v2-community-post-1-overflow'));
    await user.press(screen.getByTestId('v2-community-overflow-not-interested'));

    await waitFor(() => expect(screen.queryByText('숨길 글')).toBeNull());
    expect(screen.getByText('남을 글')).toBeVisible();
  });
});
