import { MapSheetScrollToTopProvider } from '../../../place/map/sheet';
import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { FlatList, Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import { useCategories, useCommunityFeed, useCountries } from '../../hooks/useCommunity';
import type { CommunityPostPage, ListCategoriesResponse } from '../../api/communityApi';
import CommunityBottomSheet from '../CommunityBottomSheet';

jest.mock('../../hooks/useCommunity', () => ({
  useCategories: jest.fn(),
  useCommunityFeed: jest.fn(),
  useCountries: jest.fn(),
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

function countriesResult(overrides: Record<string, unknown> = {}) {
  return ({
    data: ['KR', 'US', 'JP'],
    isError: false,
    isLoading: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useCountries>);
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
  } as unknown as ReturnType<typeof useCommunityFeed>);
}

async function renderSheet(ui: React.ReactElement) {
  return renderWithProviders(ui, { language: 'ko' });
}

describe('CommunityBottomSheet interactions', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult());
  });

  test('더블 탭은 게시글 목록 스크롤을 처음으로 이동한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({ data: { pages: [postPage({ posts: [{ postId: 1, title: '글' }] })], pageParams: [1] } }));
    const scroll = jest.spyOn(FlatList.prototype, 'scrollToOffset').mockImplementation(() => {});
    const ui = (request: number) => <MapSheetScrollToTopProvider value={request}><CommunityBottomSheet {...createBottomSheetProps()} {...navigation} /></MapSheetScrollToTopProvider>;
    const view = await renderSheet(ui(0));
    scroll.mockClear();
    await view.rerender(ui(1));
    expect(scroll).toHaveBeenCalledWith({ animated: true, offset: 0 });
    scroll.mockRestore();
  });

  test('카테고리를 누르면 해당 카테고리로 게시글 조회를 전환한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
      data: { pages: [postPage({ posts: [{ postId: 1, title: '장소 글' }] })], pageParams: [1] },
    }));

    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    expect(await screen.findByText('장소 글')).toBeVisible();
    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: null, countryCode: undefined, limit: 20 });

    await user.press(screen.getByTestId('v2-community-sheet-category-TRAVEL'));

    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: 'TRAVEL', countryCode: undefined, limit: 20 });

    await user.press(screen.getByTestId('v2-community-sheet-category-all'));

    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: null, countryCode: undefined, limit: 20 });
  });

  test('게시글을 누르면 상세로 이동한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
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
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
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

  test('국가 메뉴에서 고른 국가를 조회 파라미터로 넘기고, 같은 국가를 다시 누르면 해제한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    await user.press(screen.getByTestId('v2-community-sheet-filter'));
    expect(screen.getByTestId('v2-community-country-KR')).toHaveTextContent('한국');
    expect(screen.getByTestId('v2-community-country-US')).toHaveTextContent('미국');
    // Figma: rows are 52px, 6px apart; every row after the first opens with a separator.
    expect(screen.getByTestId('v2-community-country-KR')).toHaveStyle({ borderTopColor: 'transparent', height: 52, marginTop: 0 });
    expect(screen.getByTestId('v2-community-country-US')).toHaveStyle({ borderTopColor: '#D1D4D5', borderTopWidth: 1, height: 52, marginTop: 6 });
    await user.press(screen.getByTestId('v2-community-country-JP'));

    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: null, countryCode: 'JP', limit: 20 });
    expect(screen.queryByTestId('v2-community-country-JP')).toBeNull();

    await user.press(screen.getByTestId('v2-community-sheet-category-PLACE'));
    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: 'PLACE', countryCode: 'JP', limit: 20 });

    await user.press(screen.getByTestId('v2-community-sheet-filter'));
    expect(screen.getByTestId('v2-community-country-JP')).toBeSelected();
    await user.press(screen.getByTestId('v2-community-country-JP'));

    expect(useCommunityFeed).toHaveBeenLastCalledWith({ categoryId: 'PLACE', countryCode: undefined, limit: 20 });
  });

  test('계약에 없는 국가 코드는 코드 그대로 보여준다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult({ data: ['KR', 'XX'] }));
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    await user.press(screen.getByTestId('v2-community-sheet-filter'));

    expect(screen.getByTestId('v2-community-country-XX')).toHaveTextContent('XX');
  });

  test('국가 목록 조회가 실패하면 메뉴에서 재시도할 수 있다', async () => {
    const refetch = jest.fn();
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult({ data: undefined, isError: true, refetch }));
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    await user.press(screen.getByTestId('v2-community-sheet-filter'));
    expect(screen.getByText('국가 목록을 불러오지 못했어요.')).toBeVisible();
    await user.press(screen.getByTestId('v2-community-country-retry'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('필터가 바뀌면 목록을 새로 마운트해 스크롤과 페이지를 처음부터 시작한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
      data: { pages: [postPage({ posts: [{ postId: 1, title: '글' }] })], pageParams: [1] },
    }));
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);
    const before = screen.getByTestId('v2-community-post-list');

    await user.press(screen.getByTestId('v2-community-sheet-filter'));
    await user.press(screen.getByTestId('v2-community-country-KR'));

    expect(screen.getByTestId('v2-community-post-list')).not.toBe(before);
  });
});
