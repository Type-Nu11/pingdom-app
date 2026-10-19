import React from 'react';
import { screen } from '@testing-library/react-native';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import { ApiError } from '../../../../shared/api';
import { lightColors, lightLiquidGlass } from '../../../../shared/theme';
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
  onOpenFavorites: jest.fn(),
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

describe('CommunityBottomSheet loading/empty/error states', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult());
  });

  test('카테고리와 게시글을 불러오는 동안 스켈레톤을 보여준다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({ data: undefined, isLoading: true }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-loading')).toBeVisible();
  });

  test('게시글이 없으면 빈 상태를 보여준다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-empty')).toBeVisible();
  });

  test('커뮤니티에서 즐겨찾기 탭을 누르면 이동 콜백을 호출한다', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
    const onOpenFavorites = jest.fn();
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} onOpenFavorites={onOpenFavorites} />);
    await user.press(screen.getByRole('tab', { name: '즐겨찾기' }));
    expect(onOpenFavorites).toHaveBeenCalledTimes(1);
  });

  test('최초 조회 오류는 재시도로 표시하고 재시도를 누르면 다시 조회한다', async () => {
    const refetch = jest.fn();
    jest.mocked(useCommunityFeed).mockReturnValue(
      postsResult({ data: undefined, error: new ApiError('실패', { status: 500 }), isError: true, refetch }),
    );

    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(await screen.findByTestId('v2-community-list-error')).toBeVisible();
    await user.press(screen.getByText('다시 시도'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('CommunityBottomSheet Figma layout', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult());
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
      data: { pages: [postPage({ posts: [{ postId: 7, title: '성수 팝업 후기' }], totalCount: 1, totalPages: 1 })], pageParams: [1] },
    }));
  });

  test('opens on the "전체" tab and tags a card only with the category its item carries', async () => {
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult({
      data: {
        pages: [postPage({
          posts: [
            { category: { categoryId: 'TRAVEL', categoryName: '여행' }, postId: 7, title: '성수 팝업 후기' },
            { postId: 8, title: '카테고리 없는 글' },
          ],
          totalCount: 2,
          totalPages: 1,
        })],
        pageParams: [1],
      },
    }));

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(screen.getByTestId('v2-community-sheet-category-all')).toBeSelected();
    expect(screen.getByTestId('v2-community-post-7-tag')).toHaveTextContent('여행');
    expect(screen.queryByTestId('v2-community-post-8-tag')).toBeNull();
  });

  test('falls back to the selected category for an item returned without one', async () => {
    const { user } = await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    await user.press(screen.getByTestId('v2-community-sheet-category-PLACE'));

    expect(screen.getByTestId('v2-community-post-7-tag')).toHaveTextContent('장소');
  });

  test('shows the 44px country filter button in the title row', async () => {
    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(screen.getByTestId('v2-community-sheet-filter')).toHaveStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.56)',
      borderTopLeftRadius: 22,
      height: 44,
      width: 44,
    });
    expect(screen.getByLabelText('국가 필터')).toBeTruthy();
  });

  test('shows the write button only on the expanded sheet, like the Figma frames', async () => {
    const { rerender } = await renderSheet(
      <CommunityBottomSheet {...createBottomSheetProps()} {...navigation} snapPoint="medium" />,
    );
    expect(screen.queryByTestId('v2-community-sheet-write-fab')).toBeNull();

    await rerender(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} snapPoint="expanded" />);
    expect(screen.getByTestId('v2-community-sheet-write-fab')).toBeTruthy();
    expect(screen.getByTestId('v2-community-sheet-write-fab')).toHaveStyle({ backgroundColor: '#FF1956' });
  });
});

describe('CommunityBottomSheet category failure', () => {
  test('shows the category error in the list area instead of an empty-list message', async () => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult({
      data: undefined,
      error: new ApiError('Network error', { isNetworkError: true }),
      isError: true,
    }));
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult());

    await renderSheet(<CommunityBottomSheet {...createBottomSheetProps()} {...navigation} />);

    expect(screen.getByTestId('v2-community-categories-error')).toBeTruthy();
    expect(screen.getByText('연결에 문제가 있습니다')).toBeTruthy();
    expect(screen.queryByTestId('v2-community-list-empty')).toBeNull();
  });
});

describe('CommunityBottomSheet header alignment', () => {
  beforeEach(() => {
    jest.mocked(useCategories).mockReturnValue(categoriesResult());
    jest.mocked(useCountries).mockReturnValue(countriesResult());
    jest.mocked(useCommunityFeed).mockReturnValue(postsResult());
  });

  test('44dp 제목 행이 핸들 바로 아래에서 시작하고 헤더도 드래그 영역이다', async () => {
    const onMoveShouldSetResponderCapture = jest.fn();
    await renderSheet(
      <CommunityBottomSheet
        {...createBottomSheetProps()}
        {...navigation}
        panHandlers={{ onMoveShouldSetResponderCapture } as GestureResponderHandlers}
      />,
    );
    const header = screen.getByTestId('v2-community-sheet-header');
    expect(header.props.onMoveShouldSetResponderCapture).toBe(onMoveShouldSetResponderCapture);
    // Figma Community (10250:35439): the title row follows the 19dp handle area directly.
    expect(header.parent).not.toHaveStyle({ marginTop: -9 });
    expect(screen.getByRole('header', { name: '커뮤니티' })).toHaveStyle({ fontSize: 20, lineHeight: 26 });
  });

  test.each([
    ['medium', 8],
    ['expanded', 8],
  ] as const)('%s 커뮤니티 시트 내용은 386dp 열 안에서 화면 좌우 24dp에 정렬된다', async (snapPoint, inset) => {
    await renderSheet(
      <CommunityBottomSheet {...createBottomSheetProps()} {...navigation} expandedTranslateY={130} snapPoint={snapPoint} />,
    );
    expect(screen.getByTestId('v2-community-sheet-inner')).toHaveStyle({ paddingLeft: inset });
  });

  test('하프 칩은 글래스, 펼친 시트 칩은 Background/Normal + Fill/Neutral 테두리로 그림자 없이 그린다', async () => {
    const half = await renderSheet(
      <CommunityBottomSheet {...createBottomSheetProps()} {...navigation} expandedTranslateY={130} snapPoint="medium" />,
    );
    const halfChip = screen.getByTestId('v2-community-sheet-category-TRAVEL');
    expect(halfChip).toHaveStyle({ backgroundColor: lightLiquidGlass.category.tint, boxShadow: lightLiquidGlass.category.shadow });
    half.unmount();

    await renderSheet(
      <CommunityBottomSheet {...createBottomSheetProps()} {...navigation} expandedTranslateY={130} snapPoint="expanded" />,
    );
    const flatChip = screen.getByTestId('v2-community-sheet-category-TRAVEL');
    expect(flatChip).toHaveStyle({ backgroundColor: lightColors.background, borderColor: lightColors.fillNeutral });
    expect(flatChip).not.toHaveStyle({ boxShadow: lightLiquidGlass.category.shadow });
  });
});
