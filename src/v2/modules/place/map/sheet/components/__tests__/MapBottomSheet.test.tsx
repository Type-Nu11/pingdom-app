import { SheetMotionProvider } from '../../hooks/useSheetMotionStyle';
import { useBottomSheet } from '../../hooks/useBottomSheet';
import { useSharedValue } from 'react-native-reanimated';
import { MapSheetScrollToTopProvider } from '../../hooks/useMapSheetScrollToTop';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
import React from 'react';
import { Animated, PanResponder, Platform, ScrollView, Text, type GestureResponderHandlers, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../../../../../shared/theme';
import type { ReviewReasonKey } from '../../../../../../shared/api/reviewReasons';
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
import type { ExternalMapPlace } from '../../../selection/model/externalPlace';
import { MapTutorialContext } from '../../../tutorial/context';

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
    expect(screen.getByText(name)).toHaveStyle({ fontSize: 16, fontFamily: 'PretendardStdVariable-Bold' });
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
    expect(screen.getByRole('button', { name: '추천 장소 1 사진 2 상세 보기' })).toHaveStyle({ width: 242, height: 182 });
    expect(screen.getByTestId('place-preview-content')).toHaveStyle({ rowGap: 14 });
    expect(within(screen.getByTestId('place-preview-photos-section')).getByTestId('place-preview-translation-attribution')).toBeOnTheScreen();
    expect(within(screen.getByTestId('place-name-translation')).queryByLabelText('Translated by Google')).toBeNull();
    await user.press(screen.getByRole('button', { name: '추천 장소 1 사진 2 상세 보기' }));
    expect(screen.getByTestId('place-photo-viewer')).toBeVisible();
    expect(screen.getByLabelText('추천 장소 1 사진 2장 중 2번째')).toBeVisible();

    await user.press(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByLabelText('추천 장소 1 사진 2장 중 1번째')).toBeVisible();

    await user.press(screen.getByRole('button', { name: '사진 닫기' }));
    expect(screen.queryByTestId('place-photo-viewer')).not.toBeOnTheScreen();
  });

  test.each(['LIGHT', 'DARK'] as const)('%s 상세는 빈 리뷰에서도 전체 화면을 불투명하게 채우고 쿠폰은 상세에서만 렌더링한다', async (appearancePreference) => {
    const colors = appearancePreference === 'DARK' ? darkColors : lightColors;
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
          amenities: ['english', 'parking'] as Array<'english' | 'parking'>, coupons: [{ period: '2026.09.01~2026.09.30', title: '관광객 쿠폰' }],
          imageUrls: [], statusDescription: '', statusEmphasis: '', verifiedEvidenceCount: 23,
        },
      },
      selectedPlace, sheetChromeBottom: new Animated.Value(0),
      sheetTranslateY: new Animated.Value(300),
    };
    const result = await renderWithProviders(
      <MapBottomSheet {...commonProps} snapPoint="medium" />,
      { appearancePreference },
    );

    expect(screen.queryByRole('button', { name: '쿠폰 받기' })).not.toBeOnTheScreen();
    expect(screen.queryByText('실서버 쿠폰 발급 영역')).not.toBeOnTheScreen();
    expect(screen.getByTestId('map-sheet-content-viewport')).toHaveStyle({ overflow: 'hidden', position: 'absolute', top: 0 });
    expect(screen.getByTestId('map-sheet-inner')).toHaveStyle({ paddingLeft: 0, paddingRight: 0 });
    expect(within(screen.getByTestId('map-sheet-content-viewport')).getByTestId('place-name-translation')).toBeOnTheScreen();
    expect(screen.getByTestId('map-sheet-chrome')).toBeOnTheScreen();
    expect(screen.getByTestId('place-preview-amenity-parking')).toHaveStyle({ height: 34, paddingHorizontal: 11, gap: 6 });
    expect(screen.getByText('주차가능')).toHaveStyle({ fontSize: 14, lineHeight: 18 });
    expect(screen.getByLabelText(selectedPlace.name)).toHaveStyle({ fontSize: 24, lineHeight: 31 });

    await result.rerender(<MapBottomSheet {...commonProps} snapPoint="expanded" />);
    expect(screen.getByText('실서버 쿠폰 발급 영역')).toBeVisible();
    expect(screen.queryByText('23명이 검증했어요!')).toBeNull();
    expect(screen.getByTestId('map-sheet-inner')).toHaveStyle({ width: '100%', paddingLeft: 0, paddingRight: 0 });
    expect(screen.getByLabelText(selectedPlace.name)).toHaveStyle({ fontSize: 24, lineHeight: 31 });
    expect(screen.getByRole('tab', { name: '정보' })).toHaveStyle({ height: 56 });
    expect(screen.getByTestId('map-detail-back')).toHaveStyle({ width: 44, height: 44 });
    expect(screen.getByTestId('map-detail-active-tab-indicator')).toHaveStyle({
      height: 2,
      width: 40,
    });
    await fireEvent.press(screen.getByRole('tab', { name: '리뷰' }));
    expect(screen.getByText('등록된 리뷰 정보가 없어요.')).toBeVisible();
    expect(screen.getByTestId('map-sheet-chrome')).toHaveStyle({ opacity: 0 });
    expect(screen.getByTestId('map-sheet-inner')).toHaveStyle({ backgroundColor: colors.background, flexGrow: 1 });
    expect(screen.getByTestId('map-expanded-place-scroll')).toHaveStyle({ backgroundColor: colors.background, flexGrow: 1 });
    expect(screen.getByTestId('map-expanded-place-scroll').props.contentContainerStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ flexGrow: 1, backgroundColor: colors.background })]),
    );
  });

  test.each(['ios', 'android'] as const)('%s 상세는 맨 위 아래 당김만 시트에 전달하고 뒤로가기 버튼은 눌린다', async (os) => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
    try {
      const onBackHome = jest.fn();
      const capture = jest.fn(() => true);
      const { user } = await renderWithProviders(<MapBottomSheet
        activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: places[0].id }}
        height={700} mediumTranslateY={300} onBackHome={onBackHome}
        onDetailPress={jest.fn()} onFilterPress={jest.fn()} onGoNowPress={jest.fn()}
        onHandlePress={jest.fn()} onPlacePress={jest.fn()} onQueryChange={jest.fn()}
        onRetryRecommendations={jest.fn()} onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{ onMoveShouldSetResponderCapture: capture }}
        places={places} recommendationPlaces={[]} recommendationsState="ready" selectedPlace={places[0]}
        sheetChromeBottom={new Animated.Value(0)} sheetTranslateY={new Animated.Value(0)} snapPoint="expanded"
      />);
      const drag = screen.getByTestId('map-expanded-place-drag');
      const scroll = screen.getByTestId('map-expanded-place-scroll');
      // Native overscroll must not retain the downward gesture before handoff.
      expect(scroll.props.bounces).toBe(false);
      expect(scroll.props.overScrollMode).toBe('never');
      const start = { nativeEvent: { pageX: 100, pageY: 150, touches: [{}] } };
      const down = { nativeEvent: { pageX: 102, pageY: 180, touches: [{}] } };
      expect(drag.props.onStartShouldSetResponderCapture(start)).toBe(false);
      expect(drag.props.onMoveShouldSetResponderCapture(down)).toBe(true);
      expect(capture).toHaveBeenCalledTimes(1);
      await fireEvent.scroll(scroll, { nativeEvent: { contentOffset: { x: 0, y: 200 } } });
      drag.props.onStartShouldSetResponderCapture(start);
      expect(drag.props.onMoveShouldSetResponderCapture(down)).toBe(false);
      expect(capture).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('map-detail-top-bar').props.onMoveShouldSetResponderCapture).toBeUndefined();
      expect(screen.getByTestId('place-detail-drag-heading').props.onMoveShouldSetResponderCapture).toBeUndefined();
      await user.press(screen.getByTestId('map-detail-back'));
      expect(onBackHome).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });

  test.each(['ios', 'android'] as const)('%s 상세 상단 빈 공간을 당기면 본문 스크롤 위치와 무관하게 미리보기로 축소한다', async (os) => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
    try {
      const onBackHome = jest.fn();
      const onToggleBookmark = jest.fn(async () => undefined);
      const Sheet = () => {
        const sheet = useBottomSheet({
          collapsedTranslateY: 600, mediumTranslateY: 300, initialSnapPoint: 'expanded',
        });
        return <MapBottomSheet
          activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
          content={{ type: 'place-preview', placeId: places[0].id }}
          height={700} mediumTranslateY={300} onBackHome={onBackHome}
          onDetailPress={jest.fn()} onFilterPress={jest.fn()} onGoNowPress={jest.fn()}
          onHandlePress={jest.fn()} onPlacePress={jest.fn()} onQueryChange={jest.fn()}
          onRetryRecommendations={jest.fn()} onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
          onToggleBookmark={onToggleBookmark} panHandlers={sheet.panHandlers}
          places={places} recommendationPlaces={[]} recommendationsState="ready" selectedPlace={places[0]}
          sheetChromeBottom={sheet.sheetChromeBottom} sheetTranslateY={sheet.sheetTranslateY}
          snapPoint={sheet.snapPoint}
        />;
      };
      const { user } = await renderWithProviders(<Sheet />);
      const scroll = screen.getByTestId('map-expanded-place-scroll');
      // The header stays reachable even when the place body has scrolled away.
      expect(within(scroll).queryByTestId('map-detail-top-bar')).toBeNull();
      await fireEvent.scroll(scroll, { nativeEvent: { contentOffset: { x: 0, y: 200 } } });
      const header = screen.getByTestId('map-detail-top-bar');
      await user.press(within(header).getAllByRole('button')[1]);
      expect(onToggleBookmark).toHaveBeenCalledWith(places[0], true);
      await user.press(screen.getByTestId('map-detail-back'));
      expect(onBackHome).toHaveBeenCalledTimes(1);
      onBackHome.mockClear();

      const drag = within(header).getByTestId('map-detail-header-drag');
      const event = (y: number, previousY: number, time: number) => ({
        nativeEvent: { pageX: 100, pageY: y, touches: [{}] },
        touchHistory: {
          numberActiveTouches: 1, indexOfSingleActiveTouch: 0, mostRecentTimeStamp: time,
          touchBank: [{
            touchActive: true, startPageX: 100, startPageY: 150, startTimeStamp: 1,
            currentPageX: 100, currentPageY: y, currentTimeStamp: time,
            previousPageX: 100, previousPageY: previousY, previousTimeStamp: time - 16,
          }],
        },
      });
      expect(drag.props.onStartShouldSetResponderCapture(event(150, 150, 1))).toBe(false);
      expect(drag.props.onMoveShouldSetResponderCapture(event(180, 150, 17))).toBe(true);
      await act(() => drag.props.onResponderGrant(event(180, 150, 17)));
      await act(() => drag.props.onResponderMove(event(280, 180, 33)));
      await act(() => drag.props.onResponderRelease(event(280, 280, 49)));
      expect(screen.queryByTestId('map-expanded-place-scroll')).not.toBeOnTheScreen();
      expect(screen.getByTestId('place-preview-content')).toBeOnTheScreen();
      expect(screen.getByLabelText(places[0].name)).toBeOnTheScreen();
      expect(onBackHome).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
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

  test.each([
    ['LIGHT', 'medium', '영업 중', 'positive', lightColors.statusSuccess],
    ['LIGHT', 'expanded', '영업 종료', 'negative', lightColors.statusError],
    ['DARK', 'medium', '영업 종료', 'negative', darkColors.statusError],
    ['DARK', 'expanded', '영업 중', 'positive', darkColors.statusSuccess],
  ] as const)('%s %s 시트의 영업 상태(%s)를 Status 토큰 색으로 표시한다', async (
    appearancePreference, snapPoint, statusText, tone, color,
  ) => {
    const selectedPlace = places[0];
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700} mediumTranslateY={300} onBackHome={jest.fn()}
        onCreateReservation={jest.fn()} onDetailPress={jest.fn()}
        onFilterPress={jest.fn()} onGoNowPress={jest.fn()} onHandlePress={jest.fn()}
        onPlacePress={jest.fn()} onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)} panHandlers={{} as GestureResponderHandlers}
        places={places} previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: statusText,
            verifiedEvidenceCount: 23,
            operatingSummary: {
              detailText: null, fullText: statusText, kind: tone === 'positive' ? 'open' : 'closed',
              statusText, tone, transitionDay: null, transitionTime: null,
            },
          },
        }}
        recommendationPlaces={[]} recommendationsState="ready" selectedPlace={selectedPlace}
        sheetChromeBottom={new Animated.Value(0)} sheetTranslateY={new Animated.Value(0)} snapPoint={snapPoint}
      />,
      { appearancePreference, language: 'ko' },
    );

    expect(screen.getAllByText(statusText).at(-1)).toHaveStyle({ color, fontFamily: 'PretendardStdVariable-Medium' });
  });

  test('정보 탭 리뷰 요약은 요약 태그를 보여주고 모두 보기를 누르면 이동 없이 전체 리뷰를 펼친다', async () => {
    const selectedPlace = places[0];
    const onDetailPress = jest.fn();
    const review = (n: number, reasons: ReviewReasonKey[]) => ({
      author: `작성자${n}`, createdAt: '2026-09-03', reasons, text: `리뷰 본문 ${n}`,
      isOwnReview: n === 1, reviewId: n,
    });
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700} mediumTranslateY={300} onBackHome={jest.fn()}
        onCreateReservation={jest.fn()} onDetailPress={onDetailPress}
        onFilterPress={jest.fn()} onGoNowPress={jest.fn()} onHandlePress={jest.fn()}
        onPlacePress={jest.fn()} onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)} panHandlers={{} as GestureResponderHandlers}
        places={places} previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '',
            reviewCount: 4, reviewState: 'ready',
            reviews: [
              review(1, ['delicious', 'photoSpot', 'kind', 'clean']),
              review(2, []),
              review(3, ['parking']),
              review(4, ['easyToFind', 'multilingual']),
            ],
          },
        }}
        recommendationPlaces={[]} recommendationsState="ready"
        selectedPlace={selectedPlace} sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)} snapPoint="expanded"
      />,
      { language: 'ko' },
    );
    expect(screen.getByText('리뷰 본문 1')).toBeVisible();
    expect(screen.getAllByTestId('owner-content-more')).toHaveLength(1);
    expect(screen.getByText('리뷰 본문 3')).toBeVisible();
    expect(screen.queryByText('리뷰 본문 4')).not.toBeOnTheScreen();
    expect(screen.getByText('맛있어요')).toBeVisible();
    expect(screen.getByText('+3')).toBeVisible();
    expect(screen.queryByText('사진 찍기 좋아요')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText('리뷰 모두 보기'));
    expect(screen.getByText('리뷰 본문 4')).toBeVisible();
    expect(screen.getByText('사진 찍기 좋아요')).toBeVisible();
    expect(screen.getByText('매장이 깨끗해요')).toBeVisible();
    expect(screen.queryByText('+3')).not.toBeOnTheScreen();
    expect(screen.getByText('리뷰 접기')).toBeVisible();
    expect(onDetailPress).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('리뷰 접기'));
    expect(screen.queryByText('리뷰 본문 4')).not.toBeOnTheScreen();
  });

  test('리뷰 탭은 추천 이유가 있는 리뷰에만 전체 태그를 보여주고 없는 리뷰에는 빈 영역을 만들지 않는다', async () => {
    const selectedPlace = places[0];
    const result = await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
        content={{ type: 'place-preview', placeId: selectedPlace.id }}
        height={700} mediumTranslateY={300} onBackHome={jest.fn()}
        onCreateReservation={jest.fn()} onDetailPress={jest.fn()}
        onFilterPress={jest.fn()} onGoNowPress={jest.fn()} onHandlePress={jest.fn()}
        onPlacePress={jest.fn()} onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)} panHandlers={{} as GestureResponderHandlers}
        places={places} previewFallbackContentByPlaceId={{
          [String(selectedPlace.id)]: {
            amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '',
            reviewCount: 3, reviewState: 'ready',
            reviews: [
              { author: '사용자', createdAt: '2026-09-03', reasons: ['delicious', 'photoSpot', 'kind', 'clean'], text: '태그 있는 리뷰' },
              { author: '사용자', createdAt: '2026-09-02', reasons: [], text: '태그 없는 리뷰' },
            ],
          },
        }}
        recommendationPlaces={[]} recommendationsState="ready"
        selectedPlace={selectedPlace} sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)} snapPoint="expanded"
      />,
      { language: 'ko' },
    );
    await fireEvent.press(screen.getByText('리뷰'));
    expect(screen.getByText('태그 있는 리뷰')).toBeVisible();
    expect(screen.getByText('맛있어요')).toBeVisible();
    expect(screen.getByText('사진 찍기 좋아요')).toBeVisible();
    expect(screen.getByText('친절해요')).toBeVisible();
    expect(screen.getByText('매장이 깨끗해요')).toBeVisible();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeOnTheScreen();
    expect(screen.getAllByTestId('review-feature-tags')).toHaveLength(1);
    expect(screen.getAllByText('사용자')[0]).toHaveStyle({ fontSize: 18 });
    expect(screen.getByText('태그 없는 리뷰')).toBeVisible();
    result.unmount();
  });

  test('추천 카드는 Figma Component 10처럼 164dp 사진 아래에 아이콘 없는 추천 이유와 거리를 둔다', async () => {
    await renderWithProviders(
      <RecommendationFeaturedCard
        bookmarked={false}
        designSize="recommendation"
        imageUrl="https://example.com/place.jpg"
        onPress={jest.fn()}
        onToggleBookmark={jest.fn()}
        pending={false}
        place={places[0]}
      />,
    );

    expect(screen.getByTestId('recommendation-card-1')).toHaveStyle({ height: 209, width: 164 });
    expect(screen.getByText('테스트 추천 이유')).toHaveStyle({
      color: lightColors.labelNeutral, fontSize: 16, lineHeight: 21,
    });
    expect(screen.getByText('여기서 1km')).toHaveStyle({ color: lightColors.textAlternative, fontSize: 14 });
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
    expect(screen.getByTestId('favorite-icon')).toHaveProp('color', lightColors.staticWhite);
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

    await result.user.press(screen.getByLabelText('도착'));
    expect(onStartVisitVerification).not.toHaveBeenCalled();

    const bookmark = screen.getByTestId('place-preview-bookmark');
    const close = screen.getByTestId('place-preview-close');
    expect(screen.getByTestId('map-sheet-handle-target').props.hitSlop).toBeUndefined();
    // Figma Component 18: 32px circles; hitSlop keeps the 44px touch target.
    expect(bookmark).toHaveStyle({ height: 32, width: 32 });
    expect(close).toHaveStyle({ height: 32, width: 32 });
    expect(bookmark.props.hitSlop).toBe(6);
    expect(close.props.hitSlop).toBe(6);
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

  test('경로 callback이 없으면 출발·도착을 비활성화하고 방문 인증을 호출하지 않는다', async () => {
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
    const arrival = screen.getByLabelText('도착');
    expect(screen.queryByRole('button', { name: '출발' })).not.toBeOnTheScreen();
    expect(departure.props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
      selected: false,
    });
    expect(arrival.props.accessibilityState.disabled).toBe(true);
    expect(departure).not.toHaveStyle({ backgroundColor: '#FFF0F4' });
    await user.press(arrival);
    expect(arrival.props.accessibilityState.selected).toBe(false);
    expect(departure.props.accessibilityState.selected).toBe(false);
    expect(onStartVisitVerification).not.toHaveBeenCalled();
  });

  describe('핑덤 미등록 외부 장소 카드', () => {
    const externalPlace: ExternalMapPlace = {
      address: '서울 성동구 연무장길 99',
      coordinate: { latitude: 37.5446, longitude: 127.0559 },
      name: '성수 외부 카페',
      provider: 'kakao',
      providerPlaceId: '1',
    };
    const externalPlaceSheet = (
      place: ExternalMapPlace,
      overrides: Partial<React.ComponentProps<typeof MapBottomSheet>> = {},
    ) => (
      <MapBottomSheet
        activeFilters={[]}
        bookmarkedPlaceIds={{}}
        collapsedTranslateY={600}
        content={{ type: 'external-place', place }}
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
        recommendationPlaces={[]}
        recommendationsState="ready"
        selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)}
        sheetTranslateY={new Animated.Value(0)}
        snapPoint="medium"
        {...overrides}
      />
    );
    const renderExternalPlace = (
      place: ExternalMapPlace,
      overrides?: Partial<React.ComponentProps<typeof MapBottomSheet>>,
    ) => renderWithProviders(externalPlaceSheet(place, overrides));

    test('이름·주소·출처·미등록 안내를 보여주고 예약·즐겨찾기·공유·상세 진입을 제공하지 않는다', async () => {
      const onCreateReservation = jest.fn();
      const onDetailPress = jest.fn();
      const onPlacePress = jest.fn();
      const onSharePlace = jest.fn();
      const onToggleBookmark = jest.fn(async () => undefined);
      const { user } = await renderExternalPlace(externalPlace, {
        onCreateReservation, onDetailPress, onPlacePress, onSharePlace, onToggleBookmark,
      });

      expect(screen.getByTestId('external-place-card')).toBeVisible();
      expect(screen.getByText('성수 외부 카페')).toBeVisible();
      expect(screen.getByText('서울 성동구 연무장길 99')).toBeVisible();
      expect(screen.getByText('핑덤 미등록 장소')).toBeVisible();
      expect(screen.getByText('출처: 카카오맵 검색')).toBeVisible();
      expect(screen.getByText('핑덤 예약 지원 여부가 확인되지 않은 장소예요.')).toBeVisible();
      expect(screen.queryByTestId('external-place-location-unavailable')).not.toBeOnTheScreen();
      expect(screen.queryByLabelText('예약')).not.toBeOnTheScreen();
      expect(screen.queryByLabelText('공유')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('place-preview-bookmark')).not.toBeOnTheScreen();
      // 핑덤 장소 ID 1과 공급자 ID가 같아도 등록 장소 미리보기로 바뀌지 않는다.
      expect(screen.queryByText(places[0].name)).not.toBeOnTheScreen();

      await user.press(screen.getByText('성수 외부 카페'));

      expect(onCreateReservation).not.toHaveBeenCalled();
      expect(onDetailPress).not.toHaveBeenCalled();
      expect(onPlacePress).not.toHaveBeenCalled();
      expect(onSharePlace).not.toHaveBeenCalled();
      expect(onToggleBookmark).not.toHaveBeenCalled();
    });

    test('출발·도착·길찾기를 외부 장소 경로 callback에 연결하고 닫기로 선택을 해제한다', async () => {
      const onBackHome = jest.fn();
      const onDirectionsPress = jest.fn();
      const onExternalDeparturePress = jest.fn();
      const onExternalDirectionsPress = jest.fn();
      const { user } = await renderExternalPlace(externalPlace, {
        onBackHome, onDirectionsPress, onExternalDeparturePress, onExternalDirectionsPress,
      });

      await user.press(screen.getByRole('button', { name: '출발' }));
      expect(onExternalDeparturePress).toHaveBeenCalledWith(externalPlace);
      expect(screen.getByLabelText('출발').props.accessibilityState.selected).toBe(true);

      await user.press(screen.getByRole('button', { name: '도착' }));
      await user.press(screen.getByRole('button', { name: '길찾기' }));
      expect(onExternalDirectionsPress).toHaveBeenCalledTimes(2);
      expect(onExternalDirectionsPress).toHaveBeenLastCalledWith(externalPlace);
      expect(onDirectionsPress).not.toHaveBeenCalled();

      await user.press(screen.getByTestId('external-place-close'));
      expect(onBackHome).toHaveBeenCalledTimes(1);
    });

    test('좌표가 없으면 안내를 보여주고 경로 액션을 비활성화한다', async () => {
      const onExternalDeparturePress = jest.fn();
      const onExternalDirectionsPress = jest.fn();
      const { user } = await renderExternalPlace(
        { ...externalPlace, address: '', coordinate: null },
        { onExternalDeparturePress, onExternalDirectionsPress },
      );

      expect(screen.getByTestId('external-place-location-unavailable')).toHaveTextContent(
        '위치 정보를 확인할 수 없어 지도 표시와 길찾기를 제공하지 않아요.',
      );
      for (const label of ['출발', '도착', '길찾기']) {
        expect(screen.getByLabelText(label).props.accessibilityState.disabled).toBe(true);
        await user.press(screen.getByLabelText(label));
      }
      expect(onExternalDeparturePress).not.toHaveBeenCalled();
      expect(onExternalDirectionsPress).not.toHaveBeenCalled();
    });

    test('다른 외부 장소로 바뀌면 이전 선택의 액션 상태와 정보가 남지 않는다', async () => {
      const onExternalDeparturePress = jest.fn();
      const view = await renderExternalPlace(externalPlace, { onExternalDeparturePress });

      await view.user.press(screen.getByRole('button', { name: '출발' }));
      expect(screen.getByLabelText('출발').props.accessibilityState.selected).toBe(true);

      const nextPlace: ExternalMapPlace = {
        ...externalPlace, address: '서울 마포구 양화로 1', name: '홍대 외부 서점', providerPlaceId: '2',
      };
      await view.rerender(externalPlaceSheet(nextPlace, { onExternalDeparturePress }));

      expect(screen.getByText('홍대 외부 서점')).toBeVisible();
      expect(screen.queryByText('성수 외부 카페')).not.toBeOnTheScreen();
      expect(screen.getByLabelText('출발').props.accessibilityState.selected).toBe(false);
    });

    test('영어 locale에서도 미등록 안내를 번역한다', async () => {
      const view = await renderExternalPlace({ ...externalPlace, coordinate: null });
      await act(async () => view.i18n.changeLanguage('en'));

      expect(screen.getByText('Not on PingDom')).toBeVisible();
      expect(screen.getByText('Source: Kakao Map search')).toBeVisible();
      expect(screen.getByText('PingDom reservation support has not been confirmed for this place.')).toBeVisible();
      expect(screen.getByTestId('external-place-location-unavailable')).toHaveTextContent(
        "We couldn't confirm this place's location, so the map pin and directions are unavailable.",
      );
    });
  });

  test('프리뷰와 확장 상세의 출발·도착·길찾기를 선택 장소의 경로 callback에 연결한다', async () => {
    const selectedPlace = places[0];
    const onSharePlace = jest.fn();
    const onDirectionsPress = jest.fn();
    const onDeparturePress = jest.fn();
    const onStartVisitVerification = jest.fn();
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'place-preview', placeId: selectedPlace.id } as const,
      height: 700, mediumTranslateY: 300, onBackHome: jest.fn(),
      onCreateReservation: jest.fn(), onDetailPress: jest.fn(),
      onDeparturePress, onStartVisitVerification, onDirectionsPress, onFilterPress: jest.fn(), onGoNowPress: jest.fn(),
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
    await view.user.press(screen.getByRole('button', { name: '출발' }));
    await view.user.press(screen.getByRole('button', { name: '도착' }));
    await view.user.press(screen.getByRole('button', { name: '길찾기' }));
    expect(onSharePlace).toHaveBeenLastCalledWith(selectedPlace);
    expect(onDirectionsPress).toHaveBeenLastCalledWith(selectedPlace);

    await view.rerender(
      <MapBottomSheet {...commonProps} sheetTranslateY={new Animated.Value(0)} snapPoint="expanded" />,
    );
    await view.user.press(screen.getByRole('button', { name: '공유' }));
    await view.user.press(screen.getByRole('button', { name: '출발' }));
    await view.user.press(screen.getByRole('button', { name: '도착' }));
    await view.user.press(screen.getByRole('button', { name: '길찾기' }));
    expect(onSharePlace).toHaveBeenCalledTimes(2);
    expect(onDirectionsPress).toHaveBeenCalledTimes(4);
    expect(onDeparturePress).toHaveBeenCalledTimes(2);
    expect(onDeparturePress).toHaveBeenLastCalledWith(selectedPlace);
    expect(onStartVisitVerification).not.toHaveBeenCalled();
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
        onDeparturePress={jest.fn()}
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
    expect(screen.getByLabelText('출발').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('도착').props.accessibilityState.disabled).toBe(true);
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

  test.each([
    ['medium', 8, 16],
    ['expanded', 8, 16],
  ] as const)('%s 추천 제목과 카드는 다른 패널처럼 화면 가장자리 24dp에 맞춘다', async (snapPoint, inset, cardPadding) => {
    const commonProps = {
      activeFilters: [], bookmarkedPlaceIds: {}, collapsedTranslateY: 600,
      content: { type: 'recommendations' } as const, expandedTranslateY: 130,
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
    await renderWithProviders(<MapBottomSheet {...commonProps} snapPoint={snapPoint} />);

    expect(screen.getByTestId('map-sheet-inner')).toHaveStyle({ paddingLeft: inset, paddingRight: inset });
    const title = screen.getByText('나만을 위한 추천 장소');
    expect(title).toHaveStyle({ color: lightColors.labelStrong, fontSize: 20, lineHeight: 26 });
    expect(screen.getByTestId('recommendation-header')).toHaveStyle({ paddingHorizontal: 16, paddingTop: 9 });
    const cardRowStyle = [screen.getByTestId('recommendation-card-row').props.contentContainerStyle].flat()
      .reduce((merged, item) => ({ ...merged, ...(item || {}) }), {});
    expect(cardRowStyle).toMatchObject({ gap: 16, paddingHorizontal: cardPadding });
    expect(screen.getByText(/좋아할만한 장소를 추천해드려요/)).toHaveStyle({
      color: lightColors.textSecondary, fontSize: 14, lineHeight: 18, marginTop: 4,
    });
  });

  test('지도 홈 피드는 펼쳐도 기존 콘텐츠 여백(8dp)을 유지한다', async () => {
    await renderWithProviders(
      <MapBottomSheet
        activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
        content={{ type: 'home' }} expandedTranslateY={130}
        height={700} localFeed={rankedFeed([])} mediumTranslateY={300} nationalFeed={rankedFeed([])}
        onBackHome={jest.fn()} onDetailPress={jest.fn()} onFilterPress={jest.fn()}
        onGoNowPress={jest.fn()} onHandlePress={jest.fn()} onPlacePress={jest.fn()}
        onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()}
        onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()}
        onToggleBookmark={jest.fn(async () => undefined)}
        panHandlers={{} as GestureResponderHandlers} places={places} recommendationPlaces={[]}
        recommendationsState="ready" selectedPlace={null}
        sheetChromeBottom={new Animated.Value(0)} sheetTranslateY={new Animated.Value(0)} snapPoint="expanded"
      />,
    );
    expect(screen.getByTestId('map-sheet-inner')).toHaveStyle({ paddingLeft: 8 });
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

    expect(screen.getByRole('progressbar', { name: '나만을 위한 추천 장소를 불러오고 있어요' })).toBeVisible();
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
      width: '100%',
      maxWidth: 78,
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
    // The iOS selected pill is opaque and outlined so its state stays visible over glass.
    expect(screen.getByTestId('feed-segment-indicator')).toHaveStyle({
      backgroundColor: lightColors.surfaceElevated,
      borderColor: lightColors.border,
      borderWidth: 1,
    });
    expect(screen.getByTestId('feed-segment-inset')).toHaveStyle({ paddingHorizontal: 8 });
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
    expect(screen.queryByTestId('map-feed-featured-scroll')).toBeNull();
    expect(screen.getByTestId('map-home-feed-state-empty')).toHaveStyle({ width: '100%' });
    await act(async () => {
      fireEvent(swipe, 'startShouldSetResponderCapture', event(100));
      fireEvent(swipe, 'responderRelease', event(220, 0));
    });
    expect(screen.getByRole('tab', { name: '전국 트렌드', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('전국 트렌드 장소')).toBeOnTheScreen();
    await act(async () => {
      fireEvent(swipe, 'startShouldSetResponderCapture', event(220));
      fireEvent(screen.getByTestId('map-feed-featured-scroll'), 'touchStart', event(220));
      fireEvent(swipe, 'responderRelease', event(100, 0));
    });
    expect(screen.getByRole('tab', { name: '전국 트렌드', selected: true })).toBeOnTheScreen();
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

    // Fixed pairs share the available width through flex instead of wrapping
    // independently rounded dp widths on devices such as the Galaxy Note20.
    expect(screen.getByTestId('map-expanded-place-grid')).toHaveStyle({ flexDirection: 'column', gap: 16, paddingHorizontal: 8 });
    expect(screen.getByTestId('map-expanded-grid-row-0')).toHaveStyle({ flexDirection: 'row', gap: 16 });
    const cards = screen.getAllByRole('button', { name: `${rankedPlaces[0].name}, ${rankedPlaces[0].address}` });
    expect(cards.at(-1)).toHaveStyle({ flex: 1, minWidth: 0, aspectRatio: 177 / 222 });

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

    function MotionSheet({ expanded }: { expanded: boolean }) {
      const position = useSharedValue(300);
      return <SheetMotionProvider value={{ position, mediumTranslateY: 300, height: 800, restingTranslateY: expanded ? 0 : 300 }}>
        <MapBottomSheet {...commonProps} snapPoint={expanded ? 'expanded' : 'medium'} />
      </SheetMotionProvider>;
    }
    await view.rerender(<MotionSheet expanded={false} />);
    // The grid is prepared behind the clip before the first raise, and the
    // segment track survives settling instead of being replaced and remeasured.
    expect(screen.getByTestId('expanded-home-only-content').props.pointerEvents).toBe('none');
    const track = screen.getByTestId('feed-segment-control');
    await view.rerender(<MotionSheet expanded />);
    expect(screen.getByTestId('feed-segment-control')).toBe(track);
    expect(screen.getByTestId('expanded-home-only-content').props.pointerEvents).toBe('auto');
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
    expect(screen.getByRole('tab', { name: '전체', selected: true })).toHaveStyle({
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

  test.each(['home', 'recommendations'] as const)('%s 더블 탭은 펼쳐진 시트 안의 스크롤도 처음으로 이동한다', async (type) => {
    const scroll = jest.spyOn(ScrollView.prototype, 'scrollTo');
    const props = categoryProps([], { content: { type } });
    const ui = (request: number) => <MapSheetScrollToTopProvider value={request}><MapBottomSheet {...props} /></MapSheetScrollToTopProvider>;
    const view = await renderWithProviders(ui(0));
    scroll.mockClear();
    await view.rerender(ui(1));
    expect(scroll).toHaveBeenCalledWith({ animated: true, y: 0 });
    scroll.mockRestore();
  });

  test.each(['medium', 'expanded'] as const)('%s 장소 사진 로딩 실패 타일은 제거하고 정상 사진만 뷰어에 전달한다', async snapPoint => {
    const place = places[0];
    await renderWithProviders(<MapBottomSheet {...categoryProps([], {
      content: { type: 'place-preview', placeId: place.id }, selectedPlace: place, snapPoint,
      previewFallbackContentByPlaceId: {
        [String(place.id)]: { amenities: [], statusDescription: '', statusEmphasis: '',
          imageUrls: ['https://example.com/good.jpg', 'https://example.com/broken.jpg'] },
      },
    })} />);
    const failed = screen.getAllByLabelText('장소 이미지').find(node => node.props.source?.uri === 'https://example.com/broken.jpg');
    expect(failed).toBeTruthy();
    await fireEvent(failed!, 'error');
    expect(screen.queryAllByLabelText('장소 이미지')).toHaveLength(1);
    expect(screen.queryByText('이미지를 불러오지 못했어요')).toBeNull();
    expect(screen.queryByRole('button', { name: `${place.name} 사진 2 상세 보기` })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: `${place.name} 사진 1 상세 보기` }));
    expect(screen.getByLabelText(`${place.name} 사진 1장 중 1번째`)).toBeVisible();
  });

  test.each(['medium', 'expanded'] as const)('%s counts unique review authors instead of reviews or evidence', async snapPoint => {
    const place = places[0];
    await renderWithProviders(<MapBottomSheet {...categoryProps([], {
      content: { type: 'place-preview', placeId: place.id }, selectedPlace: place, snapPoint,
      previewFallbackContentByPlaceId: {
        [String(place.id)]: { amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '',
          verifiedEvidenceCount: 23, reviewCount: 7, reviewParticipantCount: 1, reviewHighlightsComplete: true, reviewSampleSize: 7, reviewState: 'ready' },
      },
    })} />);
    expect(screen.getByText('1명이 검증했어요!')).toBeVisible();
    expect(screen.queryByText('7명이 검증했어요!')).toBeNull();
    expect(screen.queryByText('23명이 검증했어요!')).toBeNull();
  });

  test.each(['medium', 'expanded'] as const)('%s never treats review totals as unknown author counts', async snapPoint => {
    const place = places[0];
    await renderWithProviders(<MapBottomSheet {...categoryProps([], {
      content: { type: 'place-preview', placeId: place.id }, selectedPlace: place, snapPoint,
      previewFallbackContentByPlaceId: {
        [String(place.id)]: { amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '',
          reviewCount: 7, reviewState: 'ready' },
      },
    })} />);
    expect(screen.queryByText('7명이 검증했어요!')).toBeNull();
  });

  test('Android 전국 전체 카드는 중복 블러 비트맵 없이 표시 크기로 이미지를 디코딩한다', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const feedPlaces = Array.from({ length: 20 }, (_, index) => ({
      ...categoryFixture(200 + index, `트렌드 ${index}`, index % 2 ? 'FOOD' : 'POPUP'),
      imageUrl: `https://example.com/trend-${index}.jpg`,
    }));
    const view = await renderWithProviders(<MapBottomSheet {...categoryProps(feedPlaces)} />);
    await view.user.press(screen.getByRole('tab', { name: '전국 트렌드' }));
    await view.user.press(screen.getByRole('tab', { name: '전체' }));
    expect(screen.queryAllByTestId('recommendation-featured-blur-image')).toHaveLength(0);
    const images = screen.getAllByTestId('place-artwork-image');
    expect(images).toHaveLength(14);
    images.forEach(image => {
      expect(image.props.resizeMethod).toBe('resize');
      expect(image.props.fadeDuration).toBe(0);
    });
    expect(screen.getAllByText('트렌드 1').length).toBeGreaterThan(0);
  });

  test('production search errors are distinct from empty results and preserve rows on refresh failure', async () => {
    const retry = jest.fn().mockResolvedValue({});
    const base = categoryProps([], { content: { type: 'results', query: 'cafe' }, places: [], resultsError: new Error('secret'), onRetryResults: retry });
    const view = await renderWithProviders(<MapBottomSheet {...base} />);
    expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy();
    await view.user.press(screen.getByText('다시 시도'));
    expect(retry).toHaveBeenCalledTimes(1);
    await view.rerender(<MapBottomSheet {...base} places={places} />);
    expect(screen.getByText(places[0].name)).toBeTruthy();
    expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy();
  });

  test.each(['LIGHT', 'DARK'] as const)('%s 전체 카테고리는 지도 내비게이션과 같은 아이콘을 사용하고 별도 검은 원을 채우지 않는다', async (appearancePreference) => {
    const view = await renderWithProviders(<MapBottomSheet {...categoryProps([])} />, { appearancePreference });
    const all = () => screen.getByRole('tab', { name: '전체' });
    expect(all().props.accessibilityState).toEqual({ selected: true });
    await view.user.press(screen.getByRole('tab', { name: '팝업' }));
    // Unselected is the Figma map ring (maping_outline.svg), never a filled silhouette.
    expect(within(all()).getByTestId('map-category-all-outline')).toHaveProp('color',
      (appearancePreference === 'DARK' ? darkColors : lightColors).textSecondary);
    await view.user.press(all());
    expect(within(all()).queryByTestId('map-category-all-outline')).toBeNull();
    expect(within(all()).getByTestId('map-category-all-filled')).toHaveProp('color',
      (appearancePreference === 'DARK' ? darkColors : lightColors).primary);
  });

  test('cached place keeps its translation controls when an offline refresh fails', async () => {
    const place = places[0];
    await renderWithProviders(<MapBottomSheet {...categoryProps([], {
      content: { type: 'place-preview', placeId: place.id },
      selectedPlace: place,
      detailError: new Error('offline refresh failed'),
      onRetryDetail: jest.fn(),
    })} />);
    expect(screen.getByTestId('place-name-translation')).toBeTruthy();
    expect(screen.queryByText('데이터를 불러오지 못했습니다')).toBeNull();
    expect(screen.getByLabelText(place.name)).toBeTruthy();
  });

  test('deep-linked place failure shows recovery without falling into the home feed', async () => {
    const base = categoryProps([], { content: { type: 'place-preview', placeId: 77 }, selectedPlace: null, detailError: new Error('secret'), onRetryDetail: jest.fn() });
    await renderWithProviders(<MapBottomSheet {...base} />);
    expect(screen.getByText('데이터를 불러오지 못했습니다')).toBeTruthy();
    expect(screen.queryByText('secret')).toBeNull();
    expect(screen.getByText('다시 시도')).toBeTruthy();
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
    expect(screen.getByRole('tab', { name: '전체', selected: true })).toBeOnTheScreen();
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

    expect(placesState === 'loading' ? screen.getByRole('progressbar', { name: message }) : screen.getByText(message)).toBeVisible();
    expect(screen.queryByText('이 카테고리에 해당하는 장소가 없어요')).not.toBeOnTheScreen();
    if (placesState === 'error') {
      await view.user.press(screen.getByRole('button', { name: '다시 시도' }));
      expect(retry).toHaveBeenCalledTimes(1);
    }
  });

  test('튜토리얼 중 지역 권한 안내만 숨기고 전국 트렌드는 유지하며 종료 후 안내를 복원한다', async () => {
    const props = categoryProps([], {
      localFeed: rankedFeed([], 'location-denied'),
      nationalFeed: rankedFeed(rankedPlaces),
    });
    const tree = (suppressLocationStatus: boolean) => <MapTutorialContext.Provider value={{
      suppressLocationStatus, activeTarget: null, register: jest.fn(), refresh: jest.fn(),
    }}><MapBottomSheet {...props} /></MapTutorialContext.Provider>;
    const view = await renderWithProviders(tree(true));
    expect(screen.queryByTestId('map-home-feed-state-location-denied')).toBeNull();
    await view.user.press(screen.getByRole('tab', { name: '전국 트렌드' }));
    expect(screen.getAllByText(rankedPlaces[0].name).length).toBeGreaterThan(0);
    await view.rerender(tree(false));
    await view.user.press(screen.getByRole('tab', { name: '우리 지역 핫플' }));
    expect(screen.getByTestId('map-home-feed-state-location-denied')).toBeOnTheScreen();
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

function reviewHighlightsSheet(fallback: MapPreviewFallbackContent) {
  const selectedPlace = places[0];
  return <MapBottomSheet
    activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
    content={{ type: 'place-preview', placeId: selectedPlace.id }} height={700} mediumTranslateY={300}
    onBackHome={jest.fn()} onCreateReservation={jest.fn()} onDetailPress={jest.fn()}
    onFilterPress={jest.fn()} onGoNowPress={jest.fn()} onHandlePress={jest.fn()}
    onPlacePress={jest.fn()} onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()}
    onSearchFocus={jest.fn()} onSubmitSearch={jest.fn()} onToggleBookmark={jest.fn(async () => undefined)}
    panHandlers={{} as GestureResponderHandlers} places={places}
    previewFallbackContentByPlaceId={{ [String(selectedPlace.id)]: fallback }}
    recommendationPlaces={[]} recommendationsState="ready" selectedPlace={selectedPlace}
    sheetChromeBottom={new Animated.Value(0)} sheetTranslateY={new Animated.Value(0)} snapPoint="expanded" />;
}

test.each(['LIGHT', 'DARK'] as const)('%s 리뷰 탭은 추천 집계와 정확한 비율을 보여주며 부분 집계임을 알린다', async appearancePreference => {
  await renderWithProviders(reviewHighlightsSheet({
    amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '', reviewState: 'ready',
    reviewCount: 284, reviewSampleSize: 4, reviewParticipantCount: 3, reviewHighlightsComplete: false,
    reviewHighlights: [
      { reason: 'clean', label: '매장이 깨끗해요', count: 3 },
      { reason: 'parking', label: '주차하기 편해요', count: 1 },
    ],
  }), { appearancePreference });
  await fireEvent.press(screen.getByText('리뷰'));
  expect(screen.getByTestId('place-review-highlights')).toBeVisible();
  expect(screen.getByText(/이런 점을 좋아해요!/)).toBeVisible();
  expect(screen.getByText(/3명 참여/)).toBeVisible();
  expect(screen.queryByText(/284명 참여/)).toBeNull();
  expect(screen.getByText('불러온 리뷰 4개 기준 · 전체 집계 아님')).toBeVisible();
  expect(screen.getByRole('progressbar', { name: '매장이 깨끗해요' }).props.accessibilityValue).toEqual({ min: 0, max: 3, now: 3 });
  const smaller = screen.getByTestId('place-review-highlight-parking');
  expect(smaller.props.accessibilityValue).toEqual({ min: 0, max: 3, now: 1 });
  expect(screen.getByTestId('place-review-highlight-fill-clean')).toHaveStyle({ width: '100%' });
  expect(screen.getByTestId('place-review-highlight-fill-parking')).toHaveStyle({ width: `${(1 / 3) * 100}%` });
});

test('추천 태그가 없어도 섹션과 빈 상태를 표시하며 실패를 0으로 숨기지 않는다', async () => {
  const base: MapPreviewFallbackContent = { amenities: [], imageUrls: [], statusDescription: '', statusEmphasis: '', reviewState: 'ready', reviewHighlights: [] };
  const view = await renderWithProviders(reviewHighlightsSheet(base));
  await fireEvent.press(screen.getByText('리뷰'));
  expect(screen.getByText('아직 선택된 추천 태그가 없어요.')).toBeVisible();
  await view.rerender(reviewHighlightsSheet({ ...base, reviewState: 'error' }));
  expect(screen.getByText('추천 항목 집계를 불러오지 못했어요. 눌러서 다시 시도해 주세요.')).toBeVisible();
  expect(screen.queryByText('아직 선택된 추천 태그가 없어요.')).toBeNull();
});

test('장소 요약은 추천 태그 상위 두 개를 편의기능 위치에 표시하고 일부 리뷰 기준을 밝힌다', async () => {
  await renderWithProviders(reviewHighlightsSheet({
    amenities: ['english', 'parking'], imageUrls: [], statusDescription: '', statusEmphasis: '', reviewState: 'ready',
    topReviewReasons: ['clean', 'kind', 'photoSpot'], reviewSampleSize: 4, reviewHighlightsComplete: false,
  }));
  expect(screen.getByTestId('place-top-review-tags-clean')).toBeTruthy();
  expect(screen.getByTestId('place-top-review-tags-kind')).toBeTruthy();
  expect(screen.queryByTestId('place-top-review-tags-photoSpot')).toBeNull();
  expect(screen.queryByTestId('map-detail-amenity-english')).toBeNull();
  expect(screen.getByText('불러온 리뷰 4개 기준 · 전체 집계 아님')).toBeTruthy();
});

test.each(['medium', 'expanded'] as const)('%s 피드 전환 바는 세로 시트 드래그를 전달하면서 탭 전환을 유지한다', async snapPoint => {
  const create = jest.spyOn(PanResponder, 'create');
  const capture = jest.fn(() => true);
  const move = jest.fn();
  const view = await renderWithProviders(<MapBottomSheet
    activeFilters={[]} bookmarkedPlaceIds={{}} collapsedTranslateY={600}
    content={{ type: 'home' }} height={700} mediumTranslateY={300}
    onBackHome={jest.fn()} onDetailPress={jest.fn()} onFilterPress={jest.fn()}
    onGoNowPress={jest.fn()} onHandlePress={jest.fn()} onPlacePress={jest.fn()}
    onQueryChange={jest.fn()} onRetryRecommendations={jest.fn()} onSearchFocus={jest.fn()}
    onSubmitSearch={jest.fn()} onToggleBookmark={jest.fn(async () => undefined)}
    panHandlers={{ onMoveShouldSetResponderCapture: capture, onResponderMove: move }}
    places={places} recommendationPlaces={[]} recommendationsState="ready" selectedPlace={null}
    sheetChromeBottom={new Animated.Value(snapPoint === 'expanded' ? 0 : 300)}
    sheetTranslateY={new Animated.Value(snapPoint === 'expanded' ? 0 : 300)} snapPoint={snapPoint}
  />);
  const header = screen.getByTestId('feed-segment-inset');
  expect(within(screen.getByTestId('expanded-home-scroll')).queryByTestId('feed-segment-inset')).toBeNull();
  const event = { nativeEvent: { pageX: 100, pageY: 160, touches: [] } };
  await fireEvent(header, 'moveShouldSetResponderCapture', event);
  await fireEvent(header, 'responderMove', event);
  expect(capture).toHaveBeenCalledWith(event);
  expect(move).toHaveBeenCalledWith(event);
  await view.user.press(screen.getByRole('tab', { name: '전국 트렌드' }));
  expect(screen.getByRole('tab', { name: '전국 트렌드', selected: true })).toBeTruthy();
  expect(screen.getByTestId('expanded-home-scroll').props.onMoveShouldSetResponderCapture).toBeUndefined();
  const track = screen.getByTestId('feed-segment-drag-track');
  const feedSwipe = screen.getByTestId('map-feed-swipe');
  const heldTouch = { nativeEvent: { pageX: 300, pageY: 50, touches: [{}] } };
  await fireEvent(feedSwipe, 'startShouldSetResponderCapture', heldTouch);
  await fireEvent(header, 'touchStart', heldTouch);
  expect(feedSwipe.props.onMoveShouldSetResponderCapture({
    nativeEvent: { pageX: 120, pageY: 50, touches: [{}] },
  })).toBe(false);
  // The mocked native View owns the ref used to measure screen coordinates.
  const nativeTrack = track.unstable_fiber?.return?.stateNode as { measureInWindow: jest.Mock };
  nativeTrack.measureInWindow.mockImplementation(callback => callback(20, 0, 360, 48));
  await fireEvent(screen.getByTestId('feed-segment-control'), 'layout', {
    nativeEvent: { layout: { width: 360, height: 48, x: 0, y: 0 } },
  });
  const callbacks = create.mock.calls[0][0];
  const touch = {} as GestureResponderEvent;
  const gesture = (moveX: number) => ({ moveX, dx: moveX - 300, dy: 0 } as PanResponderGestureState);
  await act(() => callbacks.onStartShouldSetPanResponderCapture?.(touch, gesture(300)));
  expect(callbacks.onMoveShouldSetPanResponderCapture?.(touch, gesture(120))).toBe(true);
  await act(() => callbacks.onPanResponderGrant?.(touch, gesture(290)));
  await act(() => callbacks.onPanResponderMove?.(touch, gesture(120)));
  // No release: crossing halves must already switch the feed, in both directions.
  expect(screen.getByRole('tab', { name: '우리 지역 핫플', selected: true })).toBeTruthy();
  await act(() => callbacks.onPanResponderMove?.(touch, gesture(300)));
  expect(screen.getByRole('tab', { name: '전국 트렌드', selected: true })).toBeTruthy();
  await act(() => callbacks.onPanResponderRelease?.(touch, gesture(300)));
  create.mockRestore();
});
