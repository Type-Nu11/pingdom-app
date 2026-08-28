import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../v2/shared/testing/testProviders';
import { runTimingMotion } from '../../../../v2/shared/motion';
import MapBottomSheet, {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../MapBottomSheet';

jest.mock('../../hooks/usePlacePreviewImages', () => ({
  usePlacePreviewImages: () => ({ imageUrlsByPlaceId: {} }),
}));

jest.mock('../../../../v2/shared/motion', () => {
  const actual = jest.requireActual('../../../../v2/shared/motion');
  return {
    ...actual,
    runTimingMotion: jest.fn((value: Animated.Value, toValue: number) => {
      value.setValue(toValue);
      return null;
    }),
  };
});

const places: DecisionPlace[] = Array.from({ length: 7 }, (_, index) => ({
  address: `테스트 주소 ${index + 1}`,
  category: 'POPUP',
  distance: `${index + 1}km`,
  id: index + 1,
  latitude: 35.6,
  longitude: 128.4,
  name: `추천 장소 ${index + 1}`,
  recommendationReason: '테스트 추천 이유',
  tags: [],
  verifiedAgo: 'recently',
  wait: '예약 가능',
}));

describe('MapBottomSheet recommendations', () => {
  test('긴 장소명을 제한하고 추천 이유 없이 카드와 즐겨찾기 동작을 분리한다', async () => {
    const longName = '이름이 매우 긴 추천 장소 '.repeat(8);
    const longReason = '사용자의 여행 취향과 현재 위치를 반영한 추천 이유 '.repeat(8);
    const longSource = 'PERSONALIZED_LOCATION_RECOMMENDATION_SOURCE_'.repeat(8);
    const onPress = jest.fn();
    const onToggleBookmark = jest.fn();
    const place = { ...places[0], name: longName, recommendationReason: longReason };
    const result = await renderWithProviders(
      <RecommendationFeaturedCard
        bookmarked={false}
        imageUrl="https://example.com/place.jpg"
        onPress={onPress}
        onToggleBookmark={onToggleBookmark}
        pending={false}
        place={place}
      />,
    );

    expect(screen.getByText(longName).props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 2,
    });
    expect(screen.queryByText(longReason)).not.toBeOnTheScreen();
    expect(screen.getByText('여기서 1km').props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    });
    expect(screen.getByTestId('recommendation-featured-image').props.source)
      .toEqual({ uri: 'https://example.com/place.jpg' });
    expect(screen.getByTestId('recommendation-featured-blur-image').props).toMatchObject({
      blurRadius: 10,
      source: { uri: 'https://example.com/place.jpg' },
    });
    expect(screen.getByTestId('recommendation-featured-image').props.onError)
      .toEqual(expect.any(Function));

    await result.user.press(screen.getByRole('button', { name: '즐겨찾기' }));
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    await result.user.press(screen.getByRole('button', { name: `${longName}, 1km` }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await result.unmount();
    await renderWithProviders(
      <RecommendationFeaturedCard
        bookmarked={false}
        onPress={onPress}
        onToggleBookmark={onToggleBookmark}
        pending={false}
        place={{
          ...place,
          name: '',
          recommendationRank: 1,
          recommendationReason: undefined,
          recommendationSource: longSource,
        }}
      />,
    );

    expect(screen.queryByText(`추천 순위 1 · ${longSource}`)).not.toBeOnTheScreen();
    expect(screen.getByText('장소명 없음')).toBeVisible();
    expect(screen.getByText('이미지 없음')).toBeVisible();
  });

  test('원격 이미지 load/error와 URI 변경 시 fade 및 fallback 상태를 초기화한다', async () => {
    const props = {
      bookmarked: false,
      onPress: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined),
      pending: false,
      place: places[0],
    };
    const result = await renderWithProviders(
      <RecommendationFeaturedCard {...props} imageUrl="https://example.com/a.jpg" />,
    );

    const firstImage = result.getByTestId('recommendation-featured-image');
    await fireEvent(firstImage, 'load');
    expect(jest.mocked(runTimingMotion)).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      1,
      expect.objectContaining({ useNativeDriver: true }),
    );

    await fireEvent(firstImage, 'error');
    expect(result.getByText('이미지를 불러오지 못했어요')).toBeVisible();

    await result.rerender(
      <RecommendationFeaturedCard {...props} imageUrl="https://example.com/b.jpg" />,
    );
    expect(result.queryByText('이미지를 불러오지 못했어요')).not.toBeOnTheScreen();
    expect(result.getByTestId('recommendation-featured-image').props.source)
      .toEqual({ uri: 'https://example.com/b.jpg' });
  });

  test('loading/error/empty/ready 전환에서 현재 상태만 렌더링한다', async () => {
    const commonProps = {
      activeFilters: [],
      bookmarkedPlaceIds: {},
      collapsedTranslateY: 600,
      content: { type: 'recommendations' } as const,
      height: 700,
      mediumTranslateY: 300,
      onBackHome: jest.fn(),
      onCouponPress: jest.fn(),
      onDetailPress: jest.fn(),
      onFilterPress: jest.fn(),
      onGoNowPress: jest.fn(),
      onHandlePress: jest.fn(),
      onPlacePress: jest.fn(),
      onQueryChange: jest.fn(),
      onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(),
      onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined),
      panHandlers: {} as GestureResponderHandlers,
      places: [],
      selectedPlace: null,
      sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(0),
      snapPoint: 'medium' as const,
    };
    const result = await renderWithProviders(
      <MapBottomSheet {...commonProps} recommendationPlaces={[]} recommendationsState="loading" />,
    );

    expect(result.getByTestId('recommendation-state-loading')).toBeVisible();
    expect(result.queryByTestId('recommendation-card-1')).not.toBeOnTheScreen();
    await result.rerender(
      <MapBottomSheet {...commonProps} recommendationPlaces={[]} recommendationsState="error" />,
    );
    expect(result.getByTestId('recommendation-state-error')).toBeVisible();
    expect(result.queryByTestId('recommendation-state-loading')).not.toBeOnTheScreen();
    await result.rerender(
      <MapBottomSheet {...commonProps} recommendationPlaces={[]} recommendationsState="empty" />,
    );
    expect(result.getByTestId('recommendation-state-empty')).toBeVisible();
    await result.rerender(
      <MapBottomSheet
        {...commonProps}
        recommendationPlaces={places.slice(0, 1)}
        recommendationsState="ready"
      />,
    );
    expect(result.getByTestId('recommendation-card-1')).toBeVisible();
    expect(result.queryByTestId('recommendation-state-empty')).not.toBeOnTheScreen();
    expect(result.queryByText('PlaceReport')).not.toBeOnTheScreen();
  });

  test('카드 연속 탭과 nested 즐겨찾기 mutation 중복을 각각 차단한다', async () => {
    const onPress = jest.fn();
    let resolveBookmark!: () => void;
    const bookmarkPromise = new Promise<void>((resolve) => {
      resolveBookmark = resolve;
    });
    const onToggleBookmark = jest.fn(() => bookmarkPromise);
    const result = await renderWithProviders(
      <RecommendationFeaturedCard
        bookmarked={false}
        onPress={onPress}
        onToggleBookmark={onToggleBookmark}
        pending={false}
        place={places[0]}
      />,
    );

    const card = result.getByTestId('recommendation-card-1');
    await fireEvent.press(card);
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);

    const bookmark = result.getByRole('button', { name: '즐겨찾기' });
    const event = { stopPropagation: jest.fn() };
    await fireEvent.press(bookmark, event);
    await fireEvent.press(bookmark, event);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(bookmark.props.accessibilityState).toEqual({
      busy: false,
      checked: false,
      disabled: false,
    });

    await act(async () => resolveBookmark());
  });

  test('즐겨찾기 mutation 중에도 낙관적으로 변경된 별 상태를 그대로 표시한다', async () => {
    await renderWithProviders(
      <RecommendationFeaturedCard
        bookmarked
        onPress={jest.fn()}
        onToggleBookmark={jest.fn()}
        pending
        place={places[0]}
      />,
    );

    const bookmark = screen.getByRole('button', { name: '즐겨찾기 해제' });
    expect(bookmark.props.accessibilityState).toEqual({
      busy: true,
      checked: true,
      disabled: true,
    });
    expect(screen.queryByText('…')).not.toBeOnTheScreen();
  });

  test('장소 미리보기의 예약 캡슐은 선택 장소로 예약 생성을 요청한다', async () => {
    const onCreateReservation = jest.fn();
    const selectedPlace = places[0];
    const { user } = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onCouponPress={jest.fn()}
        onCreateReservation={onCreateReservation}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        places={places}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
      />,
    );

    await user.press(screen.getByRole('button', { name: '예약' }));
    expect(onCreateReservation).toHaveBeenCalledWith(selectedPlace, undefined);
  });

  test('확장 추천 목록의 두 행은 각각 독립된 가로 스크롤로 렌더링된다', async () => {
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'recommendations' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onCouponPress={jest.fn()}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        places={[]}
        recommendationPlaces={places}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="expanded"
      />,
    );

    expect(screen.getByTestId('recommendation-grid-row-1')).toBeVisible();
    expect(screen.getByTestId('recommendation-grid-row-2')).toBeVisible();
    expect(screen.getByText('핑덤이 user님이 좋아할만한 장소를 추천해드려요!')).toBeVisible();
    expect(screen.getAllByText('user님 취향 저격')).toHaveLength(2);
    expect(screen.getAllByText('user님 주변 숨은 장소들')).toHaveLength(1);
    expect(screen.queryByText('테스트 추천 이유')).not.toBeOnTheScreen();
    expect(screen.queryByText('현재 위치와 가까운 장소입니다')).not.toBeOnTheScreen();
    expect(screen.getByText('오늘 검증하고 쿠폰 받자!')).toBeVisible();
  });

  test('추천 목록 헤더에 별도 위치 안내 문구를 표시하지 않는다', async () => {
    const commonProps = {
      activeFilters: [],
      bookmarkedPlaceIds: {},
      collapsedTranslateY: 600,
      content: { type: 'recommendations' } as const,
      height: 700,
      mediumTranslateY: 300,
      onBackHome: jest.fn(),
      onCouponPress: jest.fn(),
      onDetailPress: jest.fn(),
      onFilterPress: jest.fn(),
      onGoNowPress: jest.fn(),
      onHandlePress: jest.fn(),
      onPlacePress: jest.fn(),
      onQueryChange: jest.fn(),
      onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(),
      onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined),
      panHandlers: {} as GestureResponderHandlers,
      places: [],
      selectedPlace: null,
      sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(0),
      snapPoint: 'medium' as const,
    };
    const loading = await renderWithProviders(
      <MapBottomSheet
        {...commonProps}
        recommendationPlaces={[]}
        recommendationsState="loading"
      />,
    );

    expect(screen.getByText('나만을 위한 추천 장소를 불러오고 있어요')).toBeVisible();
    expect(screen.queryByText('현재 위치와 가까운 장소입니다')).not.toBeOnTheScreen();
    await loading.unmount();

    await renderWithProviders(
      <MapBottomSheet
        {...commonProps}
        recommendationPlaces={places.slice(0, 1)}
        recommendationsState="ready"
      />,
      { language: 'en' },
    );

    expect(screen.queryByText('These places are close to your current location.')).not.toBeOnTheScreen();
  });

  test('GET /places 장소 목록에 지역·전국 피드 탭을 표시하고 선택 상태를 전환한다', async () => {
    const { user } = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'home' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onCouponPress={jest.fn()}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        places={places}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
      />,
    );

    expect(screen.getByText('추천 장소 1')).toBeVisible();
    const localFeed = screen.getByRole('tab', { name: '우리 지역 핫플' });
    const nationalFeed = screen.getByRole('tab', { name: '전국 트렌드' });
    expect(localFeed.props.accessibilityState).toEqual({ selected: true });
    expect(nationalFeed.props.accessibilityState).toEqual({ selected: false });

    await user.press(nationalFeed);
    expect(screen.getByRole('tab', { name: '우리 지역 핫플' }).props.accessibilityState)
      .toEqual({ selected: false });
    expect(screen.getByRole('tab', { name: '전국 트렌드' }).props.accessibilityState)
      .toEqual({ selected: true });
  });

  test('확장 홈에서 서버 장소의 전체 카테고리 필터를 제공한다', async () => {
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'home' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onCouponPress={jest.fn()}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        places={places}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="expanded"
      />,
    );

    ['팝업', '음악', '음식점', '패션', '뷰티', '전시', '카페', '문화재', '기타']
      .forEach((name) => expect(screen.getByRole('tab', { name })).toBeVisible());
  });
});
