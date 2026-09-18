import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Animated, Text, type GestureResponderHandlers } from 'react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../../../../../shared/theme';
import { runTimingMotion } from '../../../../../../shared/motion';
import type {
  RankedPlaceFeed,
  RankedPlaceFeedStatus,
  RankedPlaceViewModel,
} from '../../../../home-feeds';
import MapBottomSheet, {
  ExpandedPlaceCard,
  getMapGridCardSize,
  getMapHomeSheetVisibleHeight,
  RecommendationFeaturedCard,
  selectPlaceDetailAddress,
  type DecisionPlace,
  type MapPreviewFallbackContent,
} from '../MapBottomSheet';

jest.mock('../../../../detail', () => ({
  ...jest.requireActual('../../../../detail'),
  usePlacePreviewImages: () => ({ imageUrlsByPlaceId: {} }),
}));

jest.mock('../../../../../../shared/motion', () => {
  const actual = jest.requireActual('../../../../../../shared/motion');
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

const toRankedPlace = (place: DecisionPlace, rank = 1): RankedPlaceViewModel => ({
  address: place.address,
  bookmarkAdds: 10,
  bookmarkCount: 100,
  bookmarked: false,
  bookmarkRemoves: 2,
  category: place.category,
  name: place.name,
  netBookmarkGrowth: 8,
  placeId: place.id,
  rank,
});

const rankedFeed = (
  feedPlaces: RankedPlaceViewModel[],
  status: RankedPlaceFeedStatus = feedPlaces.length > 0 ? 'ready' : 'empty',
  retry = jest.fn(),
): RankedPlaceFeed => ({
  hasNext: false,
  places: feedPlaces,
  retry,
  status,
});

const rankedPlaces = places.map((place, index) => toRankedPlace(place, index + 1));

describe('지도 확장 카드의 실제 표시 크기', () => {
  test.each(['LIGHT', 'DARK'] as const)('%s 이미지가 없어도 테마 표면과 고정된 카드 영역을 유지한다', async (appearancePreference) => {
    const colors = appearancePreference === 'DARK' ? darkColors : lightColors;
    const place = rankedPlaces[0];
    await renderWithProviders(<ExpandedPlaceCard
      bookmarked={false}
      onPress={jest.fn()}
      onToggleBookmark={jest.fn()}
      pending={false}
      place={place}
      size={getMapGridCardSize(359)}
    />, { appearancePreference });
    expect(screen.getByRole('button', { name: `${place.name}, ${place.address}` })).toHaveStyle({
      backgroundColor: colors.surfaceMuted, borderColor: colors.border, width: 163.5,
    });
    expect(screen.queryByTestId('recommendation-featured-image')).not.toBeOnTheScreen();
    expect(screen.getByText(place.name)).toBeOnTheScreen();
  });
  test.each([375, 402])('%i 폭에서 두 카드와 여백이 가용 폭 안에 들어간다', (width) => {
    const size = getMapGridCardSize(width - 16);
    expect(size.width * 2 + 16 + 16 + 16).toBeCloseTo(width);
    expect(size.height / size.width).toBeCloseTo(222 / 177);
    if (width === 402) expect(size).toEqual({ width: 177, height: 222 });
  });

  test.each(['ko', 'en'] as const)('%s 긴 이름과 이미지 실패에도 카드 크기와 원문을 유지한다', async (language) => {
    const name = language === 'ko' ? '아주 긴 장소 이름을 가진 복합문화공간 '.repeat(5) : 'A very long cultural venue name '.repeat(5);
    const place = { ...rankedPlaces[0], name };
    await renderWithProviders(<ExpandedPlaceCard
      bookmarked={false}
      imageUrl="https://example.com/place.jpg"
      onPress={jest.fn()}
      onToggleBookmark={jest.fn()}
      pending={false}
      place={place}
      size={getMapGridCardSize(386)}
    />, { language });
    const card = screen.getByRole('button', { name: `${name}, ${place.address}` });
    expect(card).toHaveStyle({ width: 177, height: 222 });
    expect(screen.getByText(name).props.numberOfLines).toBe(2);
    expect(screen.getByText(name).props.ellipsizeMode).toBe('tail');
    expect(screen.getByText(name)).toHaveStyle({ fontSize: 16, fontWeight: '700' });
    await act(async () => fireEvent(screen.getByTestId('recommendation-featured-image'), 'error', { nativeEvent: { error: 'unavailable' } }));
    expect(screen.queryByTestId('recommendation-featured-image')).not.toBeOnTheScreen();
    expect(card).toHaveStyle({ width: 177, height: 222 });
    expect(screen.getByText(name)).toBeOnTheScreen();
  });
});

describe('MapBottomSheet recommendations', () => {
  test('장소 상세 주소는 서버 도로명 주소 하나만 우선 표시한다', () => {
    expect(selectPlaceDetailAddress('목록 주소', {
      jibunAddress: '서버 지번 주소',
      roadAddress: '서버 도로명 주소',
    })).toBe('서버 도로명 주소');
    expect(selectPlaceDetailAddress('목록 주소', {
      jibunAddress: '서버 지번 주소',
    })).toBe('목록 주소');
  });

  test('장소 사진을 누르면 전체 화면에서 사진을 넘기고 닫을 수 있다', async () => {
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
        previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [],
            imageUrls: ['https://example.com/place-1.jpg', 'https://example.com/place-2.jpg'],
            statusDescription: '',
            statusEmphasis: '',
          },
        }}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(300)}
        snapPoint="medium"
      />,
    );

    expect(screen.getByRole('button', { name: '추천 장소 1 사진 1 상세 보기' })).toHaveStyle({ width: 242, height: 182 });
    await user.press(screen.getByRole('button', { name: '추천 장소 1 사진 2 상세 보기' }));
    expect(screen.getByTestId('place-photo-viewer')).toBeVisible();
    expect(screen.getByLabelText('추천 장소 1 사진 2장 중 2번째')).toBeVisible();

    await user.press(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByLabelText('추천 장소 1 사진 2장 중 1번째')).toBeVisible();

    await user.press(screen.getByRole('button', { name: '사진 닫기' }));
    expect(screen.queryByTestId('place-photo-viewer')).not.toBeOnTheScreen();
  });

  test('쿠폰 콘텐츠는 미리보기 액션 없이 상세에서만 렌더링한다', async () => {
    const selectedPlace = places[0];
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'place-preview', placeId: selectedPlace.id } as const,
      couponContent: <Text>실서버 쿠폰 발급 영역</Text>,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onCreateReservation: jest.fn(), onDetailPress: jest.fn(),
      onFilterPress: jest.fn(), onGoNowPress: jest.fn(), onHandlePress: jest.fn(),
      onPlacePress: jest.fn(), onQueryChange: jest.fn(), onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(), onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined), panHandlers: {} as GestureResponderHandlers,
      places, recommendationPlaces: [], recommendationsState: 'ready' as const,
      previewFallbackContentByPlaceId: {
        [String(selectedPlace.id)]: {
          amenities: [], coupons: [{ period: '2026.09.01~2026.09.30', title: '관광객 쿠폰' }],
          imageUrls: [], statusDescription: '', statusEmphasis: '', verifiedEvidenceCount: 23,
        },
      },
      selectedPlace, sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(300),
    };
    const result = await renderWithProviders(
      <MapBottomSheet {...commonProps} snapPoint="medium" />,
    );

    expect(screen.queryByRole('button', { name: '쿠폰 받기' })).not.toBeOnTheScreen();
    expect(screen.queryByText('실서버 쿠폰 발급 영역')).not.toBeOnTheScreen();

    await result.rerender(<MapBottomSheet {...commonProps} snapPoint="expanded" />);
    expect(screen.getByText('실서버 쿠폰 발급 영역')).toBeVisible();
    expect(screen.getByText('23명이 검증했어요!')).toBeVisible();
    expect(screen.getByTestId('map-detail-active-tab-indicator')).toHaveStyle({
      height: 2,
      width: 40,
    });
  });

  test('장소 상세 영업 상태를 한 줄 요약으로 한국어·영어·fallback 렌더링한다', async () => {
    const selectedPlace = places[0];
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'place-preview', placeId: selectedPlace.id } as const,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onCreateReservation: jest.fn(), onDetailPress: jest.fn(),
      onFilterPress: jest.fn(), onGoNowPress: jest.fn(), onHandlePress: jest.fn(),
      onPlacePress: jest.fn(), onQueryChange: jest.fn(), onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(), onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined), panHandlers: {} as GestureResponderHandlers,
      places, recommendationPlaces: [], recommendationsState: 'ready' as const,
      selectedPlace, sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(0), snapPoint: 'expanded' as const,
    };
    const fallback = (statusText: string, detailText: string | null, fullText: string) => ({
      [String(selectedPlace.id)]: {
        amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: statusText,
        operatingSummary: {
          detailText, fullText, kind: detailText ? 'open' as const : 'unknown' as const,
          statusText, tone: detailText ? 'positive' as const : 'neutral' as const,
          transitionDay: detailText ? 'today' as const : null,
          transitionTime: detailText ? '20:00' : null,
        },
      },
    });

    const result = await renderWithProviders(
      <MapBottomSheet
        {...commonProps}
        previewFallbackContentByPlaceId={fallback(
          '영업 중', '20:00에 영업 종료', '영업 중 · 20:00에 영업 종료',
        )}
      />,
      { language: 'ko' },
    );
    expect(screen.getByText('영업 중 · 20:00에 영업 종료')).toBeVisible();
    expect(screen.queryByText(/MONDAY|TUESDAY/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/20:00:00/)).not.toBeOnTheScreen();

    await result.rerender(
      <MapBottomSheet
        {...commonProps}
        previewFallbackContentByPlaceId={fallback(
          'Open', 'Closes at 20:00', 'Open · Closes at 20:00',
        )}
      />,
    );
    expect(screen.getByText('Open · Closes at 20:00')).toBeVisible();

    await result.rerender(
      <MapBottomSheet
        {...commonProps}
        previewFallbackContentByPlaceId={fallback(
          '영업시간 정보 없음', null, '영업시간 정보 없음',
        )}
      />,
    );
    expect(screen.getByText('영업시간 정보 없음')).toBeVisible();
  });

  test('긴 장소명과 실제 추천 이유를 말줄임하고 접근성·즐겨찾기 동작을 일관되게 유지한다', async () => {
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
      blurRadius: 2,
      source: { uri: 'https://example.com/place.jpg' },
    });
    expect(screen.getByTestId('recommendation-featured-image').props.onError)
      .toEqual(expect.any(Function));

    await result.user.press(screen.getByRole('button', { name: '즐겨찾기' }));
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    await result.user.press(screen.getByRole('button', {
      name: `${longName}, ${longReason}, 1km`,
    }));
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
      disabled: false,
      selected: false,
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
      disabled: true,
      selected: true,
    });
    expect(screen.queryByText('…')).not.toBeOnTheScreen();
  });

  test('장소 미리보기의 예약 캡슐은 선택 장소로 예약 생성을 요청한다', async () => {
    const onCreateReservation = jest.fn();
    const onStartVisitVerification = jest.fn();
    const onBackHome = jest.fn();
    const onToggleBookmark = jest.fn(async () => undefined);
    const selectedPlace = places[0];
    const result = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700}
        mediumTranslateY={300}
        onBackHome={onBackHome}
        onCreateReservation={onCreateReservation}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onStartVisitVerification={onStartVisitVerification}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={onToggleBookmark}
        panHandlers={{} as GestureResponderHandlers}
        places={places}
        previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [],
            imageUrls: [],
            reservation: { kind: 'available', disabled: false },
            statusDescription: '',
            statusEmphasis: '',
          },
        }}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
      />,
    );

    await result.user.press(screen.getByRole('button', { name: '예약' }));
    await result.user.press(screen.getByRole('button', { name: '예약' }));
    expect(onCreateReservation).toHaveBeenCalledWith(selectedPlace, undefined);
    expect(onCreateReservation).toHaveBeenCalledTimes(1);

    await result.user.press(screen.getByRole('button', { name: '도착' }));
    expect(onStartVisitVerification).toHaveBeenCalledWith(selectedPlace);

    const bookmark = screen.getByTestId('place-preview-bookmark');
    const close = screen.getByTestId('place-preview-close');
    expect(screen.getByTestId('map-sheet-handle-target').props.hitSlop).toBeUndefined();
    expect(bookmark).toHaveStyle({ height: 44, width: 44 });
    expect(close).toHaveStyle({ height: 44, width: 44 });
    await result.user.press(bookmark);
    await result.user.press(close);
    expect(onToggleBookmark).toHaveBeenCalledWith(selectedPlace, true);
    expect(onBackHome).toHaveBeenCalledTimes(1);
  });

  test('빈 availability는 예약 페이지로 이동하고 API 오류는 재시도한다', async () => {
    const onCreateReservation = jest.fn();
    const onRetryAvailability = jest.fn();
    const selectedPlace = places[0];
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'place-preview', placeId: selectedPlace.id } as const,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onCreateReservation, onDetailPress: jest.fn(),
      onFilterPress: jest.fn(), onGoNowPress: jest.fn(), onHandlePress: jest.fn(),
      onPlacePress: jest.fn(), onQueryChange: jest.fn(), onRetryAvailability,
      onRetryRecommendations: jest.fn(), onSearchFocus: jest.fn(), onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined), panHandlers: {} as GestureResponderHandlers,
      places, recommendationPlaces: [], recommendationsState: 'ready' as const,
      selectedPlace, sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(0), snapPoint: 'medium' as const,
    };
    const fallback = (reservation: MapPreviewFallbackContent['reservation']) => ({
      [String(selectedPlace.id)]: {
        amenities: [], imageUrls: [], reservation, statusDescription: '', statusEmphasis: '',
      },
    });
    const result = await renderWithProviders(
      <MapBottomSheet {...commonProps} previewFallbackContentByPlaceId={fallback({
        kind: 'empty', disabled: false,
      })} />,
    );

    expect(screen.queryByText('현재 예약 가능한 일정이 없습니다')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '예약' }).props.accessibilityState)
      .toMatchObject({ disabled: false });
    await result.user.press(screen.getByRole('button', { name: '예약' }));
    await result.user.press(screen.getByRole('button', { name: '예약' }));
    expect(onCreateReservation).toHaveBeenCalledTimes(1);
    await result.rerender(
      <MapBottomSheet
        {...commonProps}
        previewFallbackContentByPlaceId={fallback({
          kind: 'empty', disabled: false,
        })}
        snapPoint="expanded"
      />,
    );
    expect(screen.queryByRole('adjustable', { name: '추천 패널 크기 조절' }))
      .not.toBeOnTheScreen();
    await result.rerender(
      <MapBottomSheet {...commonProps} previewFallbackContentByPlaceId={fallback({
        kind: 'error', disabled: true,
      })} />,
    );
    await result.user.press(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetryAvailability).toHaveBeenCalledTimes(1);
    expect(onCreateReservation).toHaveBeenCalledTimes(1);
  });

  test('미지원 출발은 초기 선택이나 활성 버튼으로 노출하지 않고 도착 동작은 유지한다', async () => {
    const selectedPlace = places[0];
    const onStartVisitVerification = jest.fn();
    const { user } = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onCreateReservation={jest.fn()}
        onDetailPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onStartVisitVerification={onStartVisitVerification}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        places={places}
        previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [],
            coupons: [{ period: '2026.09.01 ~ 2026.09.30', title: '방문 쿠폰' }],
            imageUrls: [],
            statusDescription: '',
            statusEmphasis: '',
          },
        }}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
      />,
    );

    expect(screen.queryByRole('button', { name: '쿠폰 받기' })).not.toBeOnTheScreen();
    expect(screen.queryByText('방문 인증 시작')).not.toBeOnTheScreen();
    const departure = screen.getByLabelText('출발');
    const arrival = screen.getByRole('button', { name: '도착' });
    expect(screen.queryByRole('button', { name: '출발' })).not.toBeOnTheScreen();
    expect(departure.props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
      selected: false,
    });
    expect(departure.props.accessibilityHint).toBe('출발 기능은 아직 지원하지 않습니다.');
    expect(departure).not.toHaveStyle({ backgroundColor: '#FFF0F4' });
    await user.press(arrival);
    expect(arrival.props.accessibilityState.selected).toBe(true);
    expect(departure.props.accessibilityState.selected).toBe(false);
    expect(onStartVisitVerification).toHaveBeenCalledWith(selectedPlace);
  });

  test('프리뷰와 확장 상세의 공유·길찾기는 같은 선택 장소 callback을 사용한다', async () => {
    const selectedPlace = places[0];
    const onSharePlace = jest.fn();
    const onDirectionsPress = jest.fn();
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'place-preview', placeId: selectedPlace.id } as const,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onCreateReservation: jest.fn(), onDetailPress: jest.fn(),
      onDirectionsPress, onFilterPress: jest.fn(), onGoNowPress: jest.fn(),
      onHandlePress: jest.fn(), onPlacePress: jest.fn(), onQueryChange: jest.fn(),
      onRetryRecommendations: jest.fn(), onSearchFocus: jest.fn(), onSharePlace,
      onSubmitSearch: jest.fn(), onToggleBookmark: jest.fn(async () => undefined),
      panHandlers: {} as GestureResponderHandlers, places,
      recommendationPlaces: [], recommendationsState: 'ready' as const, selectedPlace,
      sheetChromeBottom: new Animated.Value(0), sheetTranslateY: new Animated.Value(300),
    };
    const view = await renderWithProviders(
      <MapBottomSheet {...commonProps} snapPoint="medium" />,
    );

    await view.user.press(screen.getByRole('button', { name: '공유' }));
    await view.user.press(screen.getByRole('button', { name: '길찾기' }));
    expect(onSharePlace).toHaveBeenLastCalledWith(selectedPlace);
    expect(onDirectionsPress).toHaveBeenLastCalledWith(selectedPlace);

    await view.rerender(
      <MapBottomSheet {...commonProps} sheetTranslateY={new Animated.Value(0)} snapPoint="expanded" />,
    );
    await view.user.press(screen.getByRole('button', { name: '공유' }));
    await view.user.press(screen.getByRole('button', { name: '길찾기' }));
    expect(onSharePlace).toHaveBeenCalledTimes(2);
    expect(onDirectionsPress).toHaveBeenCalledTimes(2);
    expect(onSharePlace).toHaveBeenLastCalledWith(selectedPlace);
    expect(onDirectionsPress).toHaveBeenLastCalledWith(selectedPlace);
  });

  test('공유 busy와 유효하지 않은 좌표의 길찾기를 disabled 접근성 상태로 표시한다', async () => {
    const selectedPlace = { ...places[0], latitude: Number.NaN };
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
        onDetailPress={jest.fn()}
        onDirectionsPress={jest.fn()}
        onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()}
        onPlacePress={jest.fn()}
        onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()}
        onSharePlace={jest.fn()}
        onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers}
        placeActionBusy="share"
        places={places}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(300)}
        snapPoint="medium"
      />,
    );

    expect(screen.getByLabelText('공유').props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
      selected: false,
    });
    expect(screen.queryByRole('button', { name: '공유' })).not.toBeOnTheScreen();
    expect(screen.getByLabelText('길찾기').props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
      selected: false,
    });
    expect(screen.queryByRole('button', { name: '길찾기' })).not.toBeOnTheScreen();
  });

  test('확장 추천 목록은 배열 순번 대신 장소의 실제 추천 이유를 표시한다', async () => {
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'recommendations' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
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
    expect(screen.getAllByText('테스트 추천 이유')).toHaveLength(3);
    expect(screen.queryByText('user님 취향 저격')).not.toBeOnTheScreen();
    expect(screen.queryByText('user님 주변 숨은 장소들')).not.toBeOnTheScreen();
    expect(screen.queryByText('현재 위치와 가까운 장소입니다')).not.toBeOnTheScreen();
    expect(screen.getByText('오늘 검증하고 쿠폰 받자!')).toBeVisible();
  });

  test('추천 그리드는 드래그 전에 같은 스크롤 트리에 미리 렌더링한다', async () => {
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'recommendations' } as const,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onDetailPress: jest.fn(), onFilterPress: jest.fn(),
      onGoNowPress: jest.fn(), onHandlePress: jest.fn(), onPlacePress: jest.fn(),
      onQueryChange: jest.fn(), onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(), onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined),
      panHandlers: {} as GestureResponderHandlers, places: [], recommendationPlaces: places,
      recommendationsState: 'ready' as const, selectedPlace: null,
      sheetChromeBottom: new Animated.Value(0), sheetTranslateY: new Animated.Value(0),
    };
    await renderWithProviders(
      <MapBottomSheet {...commonProps} snapPoint="medium" />,
    );

    expect(screen.getByTestId('recommendation-grid-row-1')).toBeOnTheScreen();
    expect(screen.getByTestId('recommendation-grid-row-2')).toBeOnTheScreen();
    expect(screen.getByTestId('recommendation-content-scroll').props.contentContainerStyle)
      .toEqual(expect.objectContaining({ paddingBottom: 116 }));
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
        localFeed={rankedFeed(rankedPlaces)}
        nationalFeed={rankedFeed(rankedPlaces)}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
      />,
    );

    expect(screen.getAllByText('추천 장소 1').length).toBeGreaterThan(0);
    expect(screen.getByTestId('map-navigation-map-surface')).toHaveStyle({
      borderRadius: 28,
      width: 78,
    });
    const handleTarget = screen.getByTestId('map-sheet-handle-target');
    expect(handleTarget).toHaveStyle({
      alignItems: 'center',
      height: 19,
    });
    expect(handleTarget.props.hitSlop).toBeUndefined();
    const localFeed = screen.getByRole('tab', { name: '우리 지역 핫플' });
    const nationalFeed = screen.getByRole('tab', { name: '전국 트렌드' });
    expect(localFeed.props.accessibilityState).toEqual({ selected: true });
    expect(nationalFeed.props.accessibilityState).toEqual({ selected: false });
    fireEvent(screen.getByTestId('feed-segment-control'), 'layout', {
      nativeEvent: { layout: { height: 48, width: 370, x: 16, y: 507 } },
    });
    await waitFor(() => {
      expect(screen.getByTestId('feed-segment-indicator')).toBeOnTheScreen();
    });
    expect(screen.getByTestId('feed-segment-indicator')).toHaveStyle({
      borderRadius: 20,
      bottom: 4,
      left: 4,
      top: 4,
      width: 181,
    });
    expect(screen.getByRole('button', { name: '추천 장소 1, 테스트 주소 1' })).toHaveStyle({
      height: 182,
      width: 242,
    });
    expect(screen.getByTestId('feed-content-transition')).toBeOnTheScreen();
    expect(screen.queryByRole('tab', { name: '팝업' })).not.toBeOnTheScreen();

    (runTimingMotion as jest.Mock).mockClear();
    await user.press(nationalFeed);
    expect(screen.getByRole('tab', { name: '우리 지역 핫플' }).props.accessibilityState)
      .toEqual({ selected: false });
    expect(screen.getByRole('tab', { name: '전국 트렌드' }).props.accessibilityState)
      .toEqual({ selected: true });
    expect(runTimingMotion).toHaveBeenCalledWith(
      expect.any(Animated.Value),
      1,
      expect.objectContaining({ useNativeDriver: true }),
    );
  });

  test('전국 탭은 지역 장소 역순이 아니라 독립적인 전국 트렌드 응답을 표시한다', async () => {
    const localPlaces = places.slice(0, 2);
    const nationalPlace = {
      address: '부산광역시 해운대구',
      bookmarkCount: 321,
      bookmarked: false,
      category: 'POPUP',
      imageUrl: 'https://example.com/national.jpg',
      name: '전국 트렌드 장소',
      placeId: 901,
      rank: 1,
    };
    const { user } = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'home' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
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
        places={localPlaces}
        localFeed={rankedFeed([], 'empty')}
        nationalFeed={rankedFeed([{
          ...nationalPlace,
          bookmarkAdds: 30,
          bookmarkRemoves: 4,
          netBookmarkGrowth: 26,
        }])}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(300)}
        snapPoint="medium"
      />,
    );

    await user.press(screen.getByRole('tab', { name: '전국 트렌드' }));

    expect(screen.getByText('전국 트렌드 장소')).toBeOnTheScreen();
    expect(screen.queryByText('추천 장소 2')).not.toBeOnTheScreen();
    const swipe = screen.getByTestId('map-feed-swipe');
    const event = (pageX: number, count = 1) => ({ nativeEvent: {
      pageX, pageY: 100, touches: Array.from({ length: count }, () => ({ pageX, pageY: 100 })),
    } });
    await act(async () => {
      fireEvent(swipe, 'startShouldSetResponderCapture', event(220));
      fireEvent(swipe, 'responderRelease', event(100, 0));
    });
    expect(screen.getByRole('tab', { name: '우리 지역 핫플', selected: true })).toBeOnTheScreen();
    expect(screen.queryByText('전국 트렌드 장소')).not.toBeOnTheScreen();
    await act(async () => {
      fireEvent(swipe, 'startShouldSetResponderCapture', event(100));
      fireEvent(screen.getByTestId('map-feed-featured-scroll'), 'touchStart', event(100));
      fireEvent(swipe, 'responderRelease', event(220, 0));
    });
    expect(screen.getByRole('tab', { name: '우리 지역 핫플', selected: true })).toBeOnTheScreen();
    await act(async () => {
      fireEvent(swipe, 'startShouldSetResponderCapture', event(100));
      fireEvent(swipe, 'responderRelease', event(220, 0));
    });
    expect(screen.getByRole('tab', { name: '전국 트렌드', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('전국 트렌드 장소')).toBeOnTheScreen();
  });

  test('medium 홈은 확장 전용 트리를 지연하고 첫 탭 feedback과 overlay 입력 상태를 보장한다', async () => {
    const onOpenLikedPlaces = jest.fn();
    const onMoveShouldSetResponder = jest.fn(() => true);
    const commonProps = {
      activeFilters: [],
      bookmarkedPlaceIds: {},
      collapsedTranslateY: 600,
      content: { type: 'home' } as const,
      height: 700,
      mediumTranslateY: 300,
      onBackHome: jest.fn(),
      onCouponPress: jest.fn(),
      onDetailPress: jest.fn(),
      onFilterPress: jest.fn(),
      onGoNowPress: jest.fn(),
      onHandlePress: jest.fn(),
      onOpenLikedPlaces,
      onPlacePress: jest.fn(),
      onQueryChange: jest.fn(),
      onRetryRecommendations: jest.fn(),
      onSearchFocus: jest.fn(),
      onSubmitSearch: jest.fn(),
      onToggleBookmark: jest.fn(async () => undefined),
      panHandlers: { onMoveShouldSetResponder } as GestureResponderHandlers,
      places,
      localFeed: rankedFeed(rankedPlaces),
      nationalFeed: rankedFeed(rankedPlaces),
      recommendationPlaces: [],
      recommendationsState: 'ready' as const,
      selectedPlace: null,
      sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(300),
    };
    const view = await renderWithProviders(
      <MapBottomSheet {...commonProps} snapPoint="medium" />,
    );

    expect(screen.queryByTestId('expanded-home-only-content')).not.toBeOnTheScreen();
    const favorites = screen.getByTestId('map-navigation-favorites');
    await view.user.press(favorites);
    expect(onOpenLikedPlaces).toHaveBeenCalledTimes(1);

    await view.rerender(<MapBottomSheet {...commonProps} snapPoint="expanded" />);
    expect(screen.getByTestId('expanded-home-only-content').props.pointerEvents).toBe('auto');

    // Exercise the actual row measurement, not only the sizing helper. Horizontal
    // preview cards remain 242x182 while grid cards respond to the sheet width.
    for (const rowWidth of [359, 386]) {
      await act(async () => fireEvent(screen.getByTestId('map-expanded-place-grid'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 0, width: rowWidth, height: 800 } },
      }));
      const cards = screen.getAllByRole('button', { name: `${rankedPlaces[0].name}, ${rankedPlaces[0].address}` });
      expect(cards.at(-1)).toHaveStyle(getMapGridCardSize(rowWidth));
    }

    await view.rerender(<MapBottomSheet {...commonProps} snapPoint="medium" />);
    expect(screen.getByTestId('expanded-home-only-content').props.pointerEvents).toBe('none');
    expect(screen.getByTestId('expanded-home-scroll').props.scrollEnabled).toBe(false);

    // Compact phones retain the full Figma content height. Landscape/multiwindow
    // layouts leave room below the header and scroll cards above the pinned tabs.
    expect(getMapHomeSheetVisibleHeight(874, 62)).toBe(386);
    expect(getMapHomeSheetVisibleHeight(568, 62)).toBe(386);
    const compactVisibleHeight = getMapHomeSheetVisibleHeight(320, 62);
    expect(compactVisibleHeight).toBe(234);
    await view.rerender(
      <MapBottomSheet
        {...commonProps}
        height={320}
        mediumTranslateY={320 - compactVisibleHeight}
        sheetChromeBottom={new Animated.Value(320 - compactVisibleHeight)}
        sheetTranslateY={new Animated.Value(320 - compactVisibleHeight)}
        snapPoint="medium"
      />,
    );
    expect(screen.getByTestId('expanded-home-scroll').props.scrollEnabled).toBe(true);
    expect(screen.getByTestId('map-sheet-content')).toHaveStyle({ height: 127 });
    expect(screen.getByTestId('map-sheet-content').props.onMoveShouldSetResponder).toBeUndefined();
    expect(screen.getByTestId('map-sheet-handle-target').props.onMoveShouldSetResponder)
      .toBe(onMoveShouldSetResponder);
    expect(screen.queryByTestId('expanded-home-only-content')).not.toBeOnTheScreen();
    const onRankedPlacePress = jest.fn();
    await view.rerender(
      <MapBottomSheet {...commonProps} onRankedPlacePress={onRankedPlacePress} snapPoint="medium" />,
    );
    await view.user.press(screen.getAllByRole('button', { name: '추천 장소 1, 테스트 주소 1' })[0]);
    expect(onRankedPlacePress).toHaveBeenCalledWith(rankedPlaces[0]);
  });

  test('장소 요청 실패를 빈 핫플 결과로 표시하지 않는다', async () => {
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'home' }}
        height={700}
        mediumTranslateY={300}
        onBackHome={jest.fn()}
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
        localFeed={rankedFeed([], 'error')}
        nationalFeed={rankedFeed([], 'ready')}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(300)}
        snapPoint="medium"
      />,
    );

    expect(screen.getByText('목록을 불러오지 못했어요')).toBeVisible();
    expect(screen.queryByText('표시할 핫플이 아직 없어요')).not.toBeOnTheScreen();
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
        localFeed={rankedFeed(rankedPlaces)}
        nationalFeed={rankedFeed(rankedPlaces)}
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="expanded"
      />,
    );

    ['전체', '팝업', '음악', '음식점', '패션', '뷰티', '전시', '카페', '문화재', '기타']
      .forEach((name) => expect(screen.getByRole('tab', { name })).toBeVisible());
    expect(screen.getByRole('tab', { name: '팝업', selected: true })).toHaveStyle({
      backgroundColor: '#FAEDF0',
      borderColor: '#FE5E84',
    });
    expect(screen.getByRole('tab', { name: '음악', selected: false })).toHaveStyle({
      backgroundColor: '#FFFFFF',
      borderColor: '#F2F2F3',
    });
  });

  const categoryFixture = (id: number, name: string, category: string): RankedPlaceViewModel => ({
    ...rankedPlaces[0],
    category,
    placeId: id,
    name,
  });

  const categoryProps = (categoryPlaces: RankedPlaceViewModel[], overrides: Partial<React.ComponentProps<typeof MapBottomSheet>> = {}) => ({
    activeFilters: [],
    bookmarkedPlaceIds: {},
    collapsedTranslateY: 600,
    content: { type: 'home' } as const,
    height: 700,
    mediumTranslateY: 300,
    onBackHome: jest.fn(),
    onDetailPress: jest.fn(),
    onFilterPress: jest.fn(),
    onGoNowPress: jest.fn(),
    onHandlePress: jest.fn(),
    onPlacePress: jest.fn(),
    onQueryChange: jest.fn(),
    onRetryPlaces: jest.fn(),
    onRetryRecommendations: jest.fn(),
    onSearchFocus: jest.fn(),
    onSubmitSearch: jest.fn(),
    onToggleBookmark: jest.fn(async () => undefined),
    panHandlers: {} as GestureResponderHandlers,
    localFeed: rankedFeed(categoryPlaces),
    nationalFeed: rankedFeed(categoryPlaces),
    places,
    recommendationPlaces: [],
    recommendationsState: 'ready' as const,
    selectedPlace: null,
    sheetChromeBottom: new Animated.Value(0),
    sheetTranslateY: new Animated.Value(0),
    snapPoint: 'expanded' as const,
    ...overrides,
  });

  test.each([
    ['local', '우리 지역 핫플'],
    ['national', '전국 트렌드'],
  ] as const)('%s 피드의 확장·축소 상태에서 빈 카페 결과를 음식점으로 대체하지 않는다', async (feed, feedLabel) => {
    const food = categoryFixture(101, '음식점만 있는 곳', 'FOOD');
    const props = categoryProps([food]);
    const view = await renderWithProviders(<MapBottomSheet {...props} />);

    if (feed === 'national') await view.user.press(screen.getByRole('tab', { name: feedLabel }));
    await view.user.press(screen.getByRole('tab', { name: '카페' }));

    expect(screen.queryByText('음식점만 있는 곳')).not.toBeOnTheScreen();
    expect(screen.getByRole('status', { name: '이 카테고리에 해당하는 장소가 없어요' })).toBeOnTheScreen();

    await view.rerender(<MapBottomSheet {...props} snapPoint="medium" />);
    expect(screen.queryByText('음식점만 있는 곳')).not.toBeOnTheScreen();
    expect(screen.getByRole('status', { name: '이 카테고리에 해당하는 장소가 없어요' })).toBeOnTheScreen();
  });

  test('선택 카테고리에는 해당 장소만 표시하고 전체를 선택하면 원본 목록을 복구한다', async () => {
    const food = categoryFixture(102, '전체에만 보일 음식점', 'RESTAURANT');
    const cafe = categoryFixture(103, '선택된 카페', 'CAFE');
    const view = await renderWithProviders(<MapBottomSheet {...categoryProps([food, cafe])} />);

    await view.user.press(screen.getByRole('tab', { name: '카페' }));
    expect(screen.getAllByText('선택된 카페').length).toBeGreaterThan(0);
    expect(screen.queryByText('전체에만 보일 음식점')).not.toBeOnTheScreen();

    await view.user.press(screen.getByRole('tab', { name: '전체' }));
    expect(screen.getAllByText('선택된 카페').length).toBeGreaterThan(0);
    expect(screen.getAllByText('전체에만 보일 음식점').length).toBeGreaterThan(0);
  });

  test('피드 전환 후에도 선택된 카테고리와 표시 데이터가 일치한다', async () => {
    const food = categoryFixture(104, '전국에 섞이면 안 되는 음식점', 'FOOD');
    const cafe = categoryFixture(105, '피드 전환 카페', 'CAFE');
    const nationalPopup = categoryFixture(106, '전국 팝업', 'POPUP');
    const view = await renderWithProviders(
      <MapBottomSheet
        {...categoryProps([food, cafe], { nationalFeed: rankedFeed([nationalPopup]) })}
      />,
    );

    await view.user.press(screen.getByRole('tab', { name: '카페' }));
    await view.user.press(screen.getByRole('tab', { name: '전국 트렌드' }));

    expect(screen.getByRole('tab', { name: '카페' }).props.accessibilityState)
      .toEqual({ selected: false });
    expect(screen.getByText('전국 카테고리 인기 장소')).toBeOnTheScreen();
    expect(screen.queryByText('카테고리별 user님 주변 인기 장소들')).not.toBeOnTheScreen();
    expect(screen.queryByText('피드 전환 카페')).not.toBeOnTheScreen();
    expect(screen.getAllByText('전국 팝업').length).toBeGreaterThan(0);
    expect(screen.queryByText('전국에 섞이면 안 되는 음식점')).not.toBeOnTheScreen();
  });

  test.each([
    ['loading', '주변 핫플을 찾는 중이에요'],
    ['error', '목록을 불러오지 못했어요'],
  ] as const)('%s 상태를 카테고리 빈 상태로 숨기지 않는다', async (placesState, message) => {
    const retry = jest.fn();
    const view = await renderWithProviders(
      <MapBottomSheet {...categoryProps([], { localFeed: rankedFeed([], placesState, retry) })} />,
    );

    expect(screen.getByText(message)).toBeVisible();
    expect(screen.queryByText('이 카테고리에 해당하는 장소가 없어요')).not.toBeOnTheScreen();
    if (placesState === 'error') {
      await view.user.press(screen.getByRole('button', { name: '다시 시도' }));
      expect(retry).toHaveBeenCalledTimes(1);
    }
  });

  test('지역 오류와 전국 오류·retry가 서로 덮어쓰지 않고 영어 문구도 독립적으로 표시된다', async () => {
    const localRetry = jest.fn();
    const nationalRetry = jest.fn();
    const view = await renderWithProviders(
      <MapBottomSheet
        {...categoryProps([], {
          localFeed: rankedFeed([], 'region-not-found', localRetry),
          nationalFeed: rankedFeed([], 'error', nationalRetry),
        })}
      />,
    );

    expect(screen.getByRole('status', { name: '현재 지역을 판정하지 못했어요' })).toBeVisible();
    await view.user.press(screen.getByRole('button', { name: '다시 시도' }));
    expect(localRetry).toHaveBeenCalledTimes(1);
    expect(nationalRetry).not.toHaveBeenCalled();

    await view.user.press(screen.getByRole('tab', { name: '전국 트렌드' }));
    expect(screen.getByRole('status', { name: '전국 트렌드를 불러오지 못했어요' })).toBeOnTheScreen();
    await view.user.press(screen.getByRole('button', { name: '다시 시도' }));
    expect(nationalRetry).toHaveBeenCalledTimes(1);

    await act(async () => view.i18n.changeLanguage('en'));
    expect(screen.getByRole('status', { name: 'Could not load nationwide trends' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
  });

  test('카테고리 빈 상태는 한국어·영어 문구와 status 접근성 정보를 제공한다', async () => {
    const food = categoryFixture(106, 'Food only', 'FOOD');
    const view = await renderWithProviders(<MapBottomSheet {...categoryProps([food])} />);

    await view.user.press(screen.getByRole('tab', { name: '카페' }));
    expect(screen.getByRole('status', { name: '이 카테고리에 해당하는 장소가 없어요' })).toBeVisible();

    await act(async () => view.i18n.changeLanguage('en'));
    expect(screen.getByRole('status', { name: 'No places found in this category.' })).toBeVisible();
  });
});
