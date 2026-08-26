import { screen } from '@testing-library/react-native';
import React from 'react';
import { Animated, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../v2/shared/testing/testProviders';
import MapBottomSheet, {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../MapBottomSheet';

jest.mock('../../hooks/usePlacePreviewImages', () => ({
  usePlacePreviewImages: () => ({ imageUrlsByPlaceId: {} }),
}));

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
  test('긴 추천 텍스트를 표시 계층에서 제한하고 카드와 즐겨찾기 동작을 분리한다', async () => {
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
    expect(screen.getByText(longReason).props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    });
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

    result.unmount();
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

    expect(screen.getByText(`추천 순위 1 · ${longSource}`).props).toMatchObject({
      ellipsizeMode: 'tail',
      numberOfLines: 1,
    });
    expect(screen.getByText('장소명 없음')).toBeVisible();
    expect(screen.getByText('이미지 없음')).toBeVisible();
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
    expect(screen.getByText('현재 위치와 가까운 장소입니다')).toBeVisible();
    expect(screen.queryByText('오늘 검증하고 쿠폰 받자!')).not.toBeOnTheScreen();
  });

  test('위치 안내는 실제 추천 목록에만 노출하고 영어 리소스를 제공한다', async () => {
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
    loading.unmount();

    await renderWithProviders(
      <MapBottomSheet
        {...commonProps}
        recommendationPlaces={places.slice(0, 1)}
        recommendationsState="ready"
      />,
      { language: 'en' },
    );

    expect(screen.getByText('These places are close to your current location.')).toBeVisible();
  });

  test('GET /places 장소 목록을 기본 피드에 표시하고 랭킹 탭은 렌더링하지 않는다', async () => {
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
        snapPoint="medium"
      />,
    );

    expect(screen.getByText('추천 장소 1')).toBeVisible();
    expect(screen.queryByText('우리 지역 핫플')).not.toBeOnTheScreen();
    expect(screen.queryByText('전국 트렌드')).not.toBeOnTheScreen();
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
