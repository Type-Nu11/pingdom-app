import { SheetMotionView, clampSheetValue, useExpandedSheetOpacity, useSheetMotion, useSheetMotionStyle } from '../hooks/useSheetMotionStyle';
import { useMapSheetScrollToTop } from '../hooks/useMapSheetScrollToTop';
import Skeleton from '../../../../../shared/components/Skeleton';
import { UnavailableStateIcon } from '../../../../../shared/components';
import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, GestureResponderHandlers, PanResponder, Platform, Pressable, ScrollView, View } from 'react-native';
import { useMapTutorial } from '../../tutorial/context';
import ArtAsset from '../../../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../../../assets/v2/icons/place/heritage.svg';
import HotPlaceAsset from '../../../../../../assets/v2/icons/place/hotplace.svg';
import MapAsset from '../../../../../../assets/v2/icons/place/maping_svg.svg';
import MapNavigationIcon from './MapNavigationIcon';
import MusicAsset from '../../../../../../assets/v2/icons/place/music_svg.svg';
import PopupAsset from '../../../../../../assets/v2/icons/place/popup_svg.svg';
import RecommendationTitleAsset from '../../../../../../assets/v2/icons/place/Subtract.svg';
import {
  FadeSlideTransition,
  MOTION_DURATION,
  runTimingMotion,
  useReducedMotion,
} from '../../../../../shared/motion';
import { useMapFeedSwipe } from '../hooks/useMapFeedSwipe';
import GlassSurface from '../../presentation/components/GlassSurface';
import { lightColors } from '../../../../../shared/theme/colors';
import { useTheme } from 'styled-components/native';
import {
  selectMapHomeCategoryResult,
  type MapHomeCategory,
  type MapHomeDisplayState,
} from '../../../search/model/mapHomeCategory';
import type { RankedPlaceFeedStatus, RankedPlaceViewModel } from '../../../home-feeds';
import { ExpandedPlaceCard, PlaceTrendCard, RecommendationFeaturedCard, RecommendationGridCard } from './MapFeedPlaceCards';
import type { DecisionPlace } from './mapSheetTypes';
import { useMapSheetStyles } from '../styles/MapBottomSheet.styles';

type SheetCategory = MapHomeCategory;

const CATEGORY_OPTIONS: Array<{ id: SheetCategory }> = [
  { id: 'all' },
  { id: 'popup' }, { id: 'music' }, { id: 'food' }, { id: 'fashion' }, { id: 'beauty' },
  { id: 'art' }, { id: 'cafe' }, { id: 'heritage' }, { id: 'etc' },
];

const CategoryIcon = ({ active, category }: { active: boolean; category: SheetCategory }) => {
  const themedColors = useTheme().colors ?? lightColors;
  const color = active ? themedColors.primary : themedColors.textSecondary;

  switch (category) {
    case 'all':
      return <MapNavigationIcon selected={active} color={color} size={18} testID="map-category-all" />;
    case 'popup':
      return <PopupAsset color={color} height={19} width={20} />;
    case 'music':
      return <MusicAsset color={color} height={18} width={21} />;
    case 'food':
      return <FoodAsset color={color} height={18} width={15} />;
    case 'fashion':
      return <FashionAsset color={color} height={18} width={24} />;
    case 'art':
      return <ArtAsset color={color} height={18} width={18} />;
    case 'beauty':
      return <BeautyAsset color={color} height={18} width={12} />;
    case 'cafe':
      return <CafeAsset color={color} height={18} width={19} />;
    case 'heritage':
      return <HeritageAsset color={color} height={18} width={21} />;
    case 'etc':
      return <EtcAsset color={color} height={18} width={18} />;
  }
};

const FeedSegment = ({
  expanded = false,
  sheetPanHandlers,
  feed,
  onChange,
  onTouchStart,
}: {
  expanded?: boolean;
  sheetPanHandlers: GestureResponderHandlers;
  feed: 'local' | 'national';
  onChange: (feed: 'local' | 'national') => void;
  onTouchStart: () => void;
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMapSheetStyles();
  const motion = useSheetMotion();
  const expandedOffset = motion?.expandedTranslateY ?? 0;
  const segmentInsetStyle = useSheetMotionStyle((position, medium) => {
    'worklet';
    return { paddingHorizontal: clampSheetValue(position, [expandedOffset, Math.max(expandedOffset + 1, medium)], [0, 8]) };
  }, expanded ? {} : styles.segmentInset);
  const segmentFillStyle = useSheetMotionStyle((position, medium) => {
    'worklet';
    return { opacity: clampSheetValue(position, [expandedOffset, Math.max(expandedOffset + 1, medium)], [1, 0]) };
  }, { opacity: expanded ? 1 : 0 });
  const [segmentWidth, setSegmentWidth] = useState(0);
  const indicatorProgress = useRef(new Animated.Value(feed === 'local' ? 0 : 1)).current;
  const reduceMotion = useReducedMotion();
  const indicatorWidth = Math.max(0, (segmentWidth - 8) / 2);
  const trackRef = useRef<View>(null);
  const trackLeft = useRef<number | null>(null);
  const dragging = useRef(false);
  const dragPosition = useRef(0);
  const current = useRef({ feed, onChange, segmentWidth });
  current.current = { feed, onChange, segmentWidth };
  const selectAtFinger = (pageX: number) => {
    if (trackLeft.current === null || current.current.segmentWidth <= 8) return;
    const width = current.current.segmentWidth;
    const x = pageX - trackLeft.current;
    // The thumb follows the finger; content changes as soon as it crosses halves.
    indicatorProgress.stopAnimation();
    indicatorProgress.setValue(Math.max(0, Math.min(1, (x - width / 4) / (width / 2))));
    const next = x < width / 2 ? 'local' : 'national';
    if (next !== current.current.feed) {
      current.current.feed = next;
      current.current.onChange(next);
    }
  };
  const horizontalDrag = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponderCapture: () => {
      trackLeft.current = null;
      trackRef.current?.measureInWindow((x) => {
        trackLeft.current = x;
        if (dragging.current) selectAtFinger(dragPosition.current);
      });
      return false;
    },
    onMoveShouldSetPanResponderCapture: (_, gesture) => (
      Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2
    ),
    onPanResponderGrant: (_, gesture) => {
      dragging.current = true;
      dragPosition.current = gesture.moveX;
      selectAtFinger(gesture.moveX);
    },
    onPanResponderMove: (_, gesture) => {
      dragPosition.current = gesture.moveX;
      selectAtFinger(gesture.moveX);
    },
    onPanResponderRelease: () => {
      dragging.current = false;
      runTimingMotion(indicatorProgress, current.current.feed === 'local' ? 0 : 1, {
        duration: MOTION_DURATION.transition, reduceMotion, useNativeDriver: true,
      });
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: () => {
      dragging.current = false;
      indicatorProgress.setValue(current.current.feed === 'local' ? 0 : 1);
    },
  // Mutable selection and layout are read through refs during an active touch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [indicatorProgress, reduceMotion]);

  useEffect(() => {
    if (dragging.current) return;
    const animation = runTimingMotion(indicatorProgress, feed === 'local' ? 0 : 1, {
      duration: MOTION_DURATION.transition,
      reduceMotion,
      useNativeDriver: true,
    });

    return () => animation?.stop();
  }, [feed, indicatorProgress, reduceMotion]);

  const segmentContent = (
    <>
      {indicatorWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segmentIndicator,
            !expanded && Platform.OS === 'ios' && styles.segmentIndicatorRaised,
            {
              backgroundColor: expanded ? colors.background
                : Platform.OS === 'ios' ? colors.surfaceElevated : colors.glassFillRaised,
              transform: [{
                translateX: indicatorProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, indicatorWidth],
                }),
              }],
              width: indicatorWidth,
            },
          ]}
          testID="feed-segment-indicator"
        />
      ) : null}
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: feed === 'local' }}
        onPress={() => onChange('local')}
        style={styles.segment}
      >
        <HotPlaceAsset
          color={feed === 'local' ? colors.primary : colors.labelAssistive}
          height={20}
          width={16}
        />
        <AppText adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.segmentLabel, feed === 'local' && styles.segmentLabelActive]}>
          {t('map.sheet.localHotPlaces')}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: feed === 'national' }}
        onPress={() => onChange('national')}
        style={styles.segment}
      >
        <MapAsset
          color={feed === 'national' ? colors.primary : colors.labelAssistive}
          height={20}
          width={18}
        />
        <AppText adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.segmentLabel, feed === 'national' && styles.segmentLabelActive]}>
          {t('map.sheet.nationwideTrends')}
        </AppText>
      </Pressable>
    </>
  );

  // Retain the same track and measured children throughout a drag. Switching
  // GlassSurface/View after settling resets layout and visibly widens the tabs.
  if (motion) return (
    <SheetMotionView {...sheetPanHandlers} onTouchStart={onTouchStart}
      style={segmentInsetStyle} testID="feed-segment-inset">
      <View {...horizontalDrag.panHandlers} ref={trackRef} collapsable={false}
        style={styles.segmentFrame} testID="feed-segment-drag-track">
        <GlassSurface glassEffectStyle="regular" intensity={56}
          onLayout={event => setSegmentWidth(event.nativeEvent.layout.width)}
          style={styles.segmentOuter} testID="feed-segment-control" tintColor={colors.glassFillSubtle}>
          <SheetMotionView pointerEvents="none" testID="feed-segment-expanded-fill"
            style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
              backgroundColor: colors.fillAlternative }, segmentFillStyle]} />
          {segmentContent}
        </GlassSurface>
      </View>
    </SheetMotionView>
  );

  // Figma Component 2: the floating sheet (4525:25520) uses a Glass/FillSubtle track with a
  // Glass/FillRaised thumb (opaque on iOS for legibility); the -Up frame (4683:7488) a flat Fill/Alternative track with a
  // Background/Normal thumb and no shadow, spanning the full-width sheet minus 8px.
  return (
    <View {...sheetPanHandlers} onTouchStart={onTouchStart} style={expanded ? undefined : styles.segmentInset} testID="feed-segment-inset">
      <View {...horizontalDrag.panHandlers} ref={trackRef} collapsable={false}
        style={expanded ? styles.segmentFrame : styles.segmentShadow} testID="feed-segment-drag-track">
        {expanded ? (
          <View
            onLayout={(event) => setSegmentWidth(event.nativeEvent.layout.width)}
            style={[styles.segmentOuter, { backgroundColor: colors.fillAlternative }]}
            testID="feed-segment-control"
          >
            {segmentContent}
          </View>
        ) : (
          <GlassSurface
            glassEffectStyle="regular"
            intensity={56}
            onLayout={(event) => setSegmentWidth(event.nativeEvent.layout.width)}
            style={styles.segmentOuter}
            testID="feed-segment-control"
            tintColor={colors.glassFillSubtle}
          >
            {segmentContent}
          </GlassSurface>
        )}
      </View>
    </View>
  );
};

export const ExpandedHomeContent = ({
  activeCategory,
  bookmarkPendingPlaceIds,
  feed,
  sheetPanHandlers,
  expandedInteractionsEnabled,
  expandedOnlyOpacity,
  onCategoryChange,
  onFeedChange,
  onPlacePress,
  onRetry,
  onToggleBookmark,
  places,
  restingScrollEnabled = false,
  state,
  title,
  userName,
}: {
  activeCategory: SheetCategory;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  feed: 'local' | 'national';
  sheetPanHandlers: GestureResponderHandlers;
  expandedInteractionsEnabled: boolean;
  expandedOnlyOpacity: Animated.AnimatedInterpolation<number>;
  onCategoryChange: (category: SheetCategory) => void;
  onFeedChange: (feed: 'local' | 'national') => void;
  onPlacePress: (place: RankedPlaceViewModel) => void;
  onRetry: () => void;
  onToggleBookmark: (place: RankedPlaceViewModel, nextBookmarked: boolean) => Promise<void>;
  places: RankedPlaceViewModel[];
  restingScrollEnabled?: boolean;
  state?: RankedPlaceFeedStatus;
  title?: string;
  userName: string;
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const scrollRef = useRef<ScrollView>(null);
  useMapSheetScrollToTop(() => scrollRef.current?.scrollTo({ animated: true, y: 0 }));
  const { panHandlers: feedPanHandlers, blockHorizontalSwipe } = useMapFeedSwipe(feed, onFeedChange);
  const expandedContentStyle = useExpandedSheetOpacity(expandedOnlyOpacity);
  const motion = useSheetMotion();
  const [hasRenderedExpandedContent, setHasRenderedExpandedContent] = useState(
    expandedInteractionsEnabled,
  );
  const categoryResult = selectMapHomeCategoryResult(
    places,
    activeCategory,
    state ?? (places.length > 0 ? 'ready' : 'empty'),
  );
  const displayedPlaces = categoryResult.places;
  // The bounded eight-card grid must exist before the sheet reveals it.
  const shouldRenderExpandedContent = Boolean(motion) || expandedInteractionsEnabled || hasRenderedExpandedContent;

  useEffect(() => {
    if (expandedInteractionsEnabled) setHasRenderedExpandedContent(true);
  }, [expandedInteractionsEnabled]);
  useEffect(() => {
    if (!expandedInteractionsEnabled) {
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
    }
  }, [expandedInteractionsEnabled]);

  return (
    <View {...feedPanHandlers} style={styles.expandedScroll} testID="map-feed-swipe">
    {/* Keep the sheet grip outside the native vertical scroll responder. */}
    <FeedSegment sheetPanHandlers={sheetPanHandlers} expanded={expandedInteractionsEnabled} feed={feed} onChange={onFeedChange} onTouchStart={blockHorizontalSwipe} />
    <ScrollView
      contentContainerStyle={styles.expandedContent}
      nestedScrollEnabled
      ref={scrollRef}
      scrollEnabled={expandedInteractionsEnabled || restingScrollEnabled}
      showsVerticalScrollIndicator={false}
      style={styles.expandedScroll}
      testID="expanded-home-scroll"
    >
      <FadeSlideTransition
        direction={feed === 'local' ? 0 : 1}
        stateKey={feed}
        style={styles.feedTransition}
        testID="feed-content-transition"
      >
        {categoryResult.state !== 'ready' ? (
          <View style={styles.feedStateContainer}>
            <EmptyCard feed={feed} onRetry={onRetry} state={categoryResult.state} variant="row" />
          </View>
        ) : <ScrollView
          contentContainerStyle={styles.expandedFeaturedRow}
          onTouchStart={blockHorizontalSwipe}
          testID="map-feed-featured-scroll"
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.rowScroll}
        >
          {categoryResult.state === 'ready' ? displayedPlaces.slice(0, 6).map((place) => (
            <PlaceTrendCard
              bookmarked={place.bookmarked}
              imageUrl={place.imageUrl}
              key={`featured-${place.placeId}`}
              onPress={() => onPlacePress(place)}
              onToggleBookmark={() => void onToggleBookmark(
                place,
                !place.bookmarked,
              )}
              pending={Boolean(bookmarkPendingPlaceIds[String(place.placeId)])}
              place={place}
            />
          )) : null}
        </ScrollView>}

        {shouldRenderExpandedContent && !restingScrollEnabled ? (
          <SheetMotionView
            pointerEvents={expandedInteractionsEnabled ? 'auto' : 'none'}
            style={expandedContentStyle}
            testID="expanded-home-only-content"
          >
            <AppText style={styles.expandedTitle}>
              {feed === 'local' && title
                ? t('map.sheet.categoryPopularRegion', { regionName: title })
                : t(feed === 'local' ? 'map.sheet.categoryPopular' : 'map.sheet.categoryPopularNational', { userName })}
            </AppText>

            <ScrollView
              contentContainerStyle={styles.categoryRow}
              onTouchStart={blockHorizontalSwipe}
              testID="map-feed-category-scroll"
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
            >
              {CATEGORY_OPTIONS.map((category) => {
                const active = category.id === activeCategory;

                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    key={category.id}
                    onPress={() => onCategoryChange(category.id)}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                  >
                    <CategoryIcon active={active} category={category.id} />
                    <AppText maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>
                      {t(`map.categories.${category.id}`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View
              style={styles.gridRow}
              testID="map-expanded-place-grid"
            >
              {Array.from({ length: Math.ceil(Math.min(displayedPlaces.length, 8) / 2) }, (_, rowIndex) => {
                const row = displayedPlaces.slice(rowIndex * 2, rowIndex * 2 + 2);
                return <View key={row[0].placeId} style={styles.homeGridRow} testID={`map-expanded-grid-row-${rowIndex}`}>
                  {row.map(place => <ExpandedPlaceCard
                    bookmarked={place.bookmarked}
                    imageUrl={place.imageUrl}
                    key={`grid-${place.placeId}`}
                    onPress={() => onPlacePress(place)}
                    onToggleBookmark={() => void onToggleBookmark(place, !place.bookmarked)}
                    pending={Boolean(bookmarkPendingPlaceIds[String(place.placeId)])}
                    place={place}
                  />)}
                  {row.length === 1 ? <View style={styles.homeGridPlaceholder} /> : null}
                </View>;
              })}
            </View>
          </SheetMotionView>
        ) : null}
      </FadeSlideTransition>
    </ScrollView>
    </View>
  );
};

export const EmptyCard = ({
  feed = 'local',
  onRetry,
  state = 'loading',
  variant = 'list',
}: {
  feed?: 'local' | 'national';
  onRetry?: () => void;
  state?: MapHomeDisplayState;
  variant?: 'list' | 'row';
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const { suppressLocationStatus } = useMapTutorial();
  if (suppressLocationStatus && ['location-denied', 'location-pending', 'invalid-location'].includes(state)) return null;
  const copyState = state === 'ready' ? 'empty' : state;
  const isCategoryEmpty = copyState === 'category-empty';
  const nationalCopy = feed === 'national' && ['empty', 'error', 'loading'].includes(copyState);
  const nationalState = `${copyState[0]?.toUpperCase() ?? ''}${copyState.slice(1)}`;
  const titleKey = isCategoryEmpty
    ? 'map.sheet.state.categoryEmptyTitle'
    : nationalCopy ? `map.sheet.state.national${nationalState}Title` : `map.sheet.state.${copyState}Title`;
  const bodyKey = isCategoryEmpty
    ? null
    : nationalCopy ? `map.sheet.state.national${nationalState}Body` : `map.sheet.state.${copyState}Body`;
  const accessibilityLabel = t(titleKey);
  if (copyState === 'loading') return <Skeleton variant="list" count={variant === 'row' ? 1 : 3}
    accessibilityLabel={accessibilityLabel} testID="map-home-feed-state-loading" style={{ width: '100%', padding: 16 }} />;
  const retryable = ![
    'category-empty',
    'disabled',
    'empty',
    'loading',
    'location-denied',
    'location-pending',
  ].includes(copyState);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      role="status"
      style={[variant === 'row' ? styles.emptyCardRow : styles.placeCard, styles.emptyCard]}
      testID={`map-home-feed-state-${copyState}`}
    >
      <View style={styles.emptyCardIcon}><UnavailableStateIcon size={64} /></View>
      <AppText style={styles.emptyCardTitle}>{accessibilityLabel}</AppText>
      {bodyKey ? <AppText style={styles.emptyCardBody}>{t(bodyKey)}</AppText> : null}
      {retryable && onRetry ? (
        <Pressable
          accessibilityLabel={t('common.error.retry')}
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <AppText style={styles.retryButtonText}>{t('common.error.retry')}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const RecommendationState = ({
  onRetry,
  state,
}: {
  onRetry: () => void;
  state: 'empty' | 'error' | 'loading';
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  if (state === 'loading') return <Skeleton accessibilityLabel={t('map.sheet.state.recommendationLoadingTitle')}
    testID="recommendation-state-loading" style={{ padding: 16 }} />;
  return (
  <View
    accessibilityLiveRegion="polite"
    style={styles.recommendationState}
    testID={`recommendation-state-${state}`}
  >
    <UnavailableStateIcon size={64} />
    <AppText style={styles.emptyCardTitle}>
      {t(`map.sheet.state.recommendation${state[0].toUpperCase()}${state.slice(1)}Title`)}
    </AppText>
    <AppText style={styles.emptyCardBody}>
      {t(`map.sheet.state.recommendation${state[0].toUpperCase()}${state.slice(1)}Body`)}
    </AppText>
    {state === 'error' ? (
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <AppText style={styles.retryButtonText}>{t('common.error.retry')}</AppText>
      </Pressable>
    ) : null}
  </View>
  );
};

const RecommendationStateTransition = ({
  children,
  state,
}: {
  children: React.ReactNode;
  state: 'empty' | 'error' | 'loading' | 'ready';
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    opacity.setValue(0);
    runTimingMotion(opacity, 1, {
      reduceMotion,
      useNativeDriver: true,
    });

    return () => opacity.stopAnimation();
  }, [opacity, reduceMotion, state]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

export const RecommendationContent = ({
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  expandedInteractionsEnabled,
  expandedOnlyOpacity,
  imageUrlsByPlaceId,
  isBookmarkStateLoading,
  onPlacePress,
  onRetry,
  onToggleBookmark,
  places,
  restingScrollEnabled = false,
  state,
  userName,
}: {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  expandedInteractionsEnabled: boolean;
  expandedOnlyOpacity: Animated.AnimatedInterpolation<number>;
  imageUrlsByPlaceId: Record<string, string>;
  isBookmarkStateLoading: boolean;
  onPlacePress: (place: DecisionPlace) => void;
  onRetry: () => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  places: DecisionPlace[];
  restingScrollEnabled?: boolean;
  state: 'empty' | 'error' | 'loading' | 'ready';
  userName: string;
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const scrollRef = useRef<ScrollView>(null);
  useMapSheetScrollToTop(() => scrollRef.current?.scrollTo({ animated: true, y: 0 }));
  const featuredPlaces = places.slice(0, 3);
  const expandedContentStyle = useExpandedSheetOpacity(expandedOnlyOpacity);
  const gridPlaces = places.slice(3);
  const gridRows = [
    gridPlaces.filter((_, index) => index % 2 === 0),
    gridPlaces.filter((_, index) => index % 2 === 1),
  ].filter((row) => row.length > 0);
  useEffect(() => {
    if (!expandedInteractionsEnabled) {
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
    }
  }, [expandedInteractionsEnabled]);

  return (
    <ScrollView
      contentContainerStyle={styles.expandedContent}
      nestedScrollEnabled
      ref={scrollRef}
      scrollEnabled={expandedInteractionsEnabled || restingScrollEnabled}
      showsVerticalScrollIndicator={false}
      testID="recommendation-content-scroll"
    >
      <View style={styles.recommendationHeader} testID="recommendation-header">
        <View style={styles.recommendationTitleRow}>
          <RecommendationTitleAsset height={20} width={20} />
          <AppText style={styles.recommendationTitle}>{t('map.sheet.recommendationTitle')}</AppText>
        </View>
        <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.recommendationSubtitle}>
          {t('map.recommendations.subtitle', { userName })}
        </AppText>
      </View>
      <RecommendationStateTransition state={state}>
        {state === 'ready' ? (
          <>
          <ScrollView
            contentContainerStyle={[styles.recommendationCardRow, expandedInteractionsEnabled && styles.recommendationCardRowExpanded]}
            testID="recommendation-card-row"
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {featuredPlaces.map((place) => (
              <RecommendationFeaturedCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                designSize="recommendation"
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                key={`recommendation-featured-${place.id}`}
                onPress={() => onPlacePress(place)}
                onToggleBookmark={() => onToggleBookmark(
                  place,
                  !bookmarkedPlaceIds[String(place.id)],
                )}
                pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                place={place}
              />
            ))}
          </ScrollView>
          {gridPlaces.length > 0 && !restingScrollEnabled ? (
            <SheetMotionView
              pointerEvents={expandedInteractionsEnabled ? 'auto' : 'none'}
              style={expandedContentStyle}
              testID="expanded-recommendation-only-content"
            >
              <AppText style={styles.recommendationGridTitle}>
                {t('map.recommendations.verificationTitle')}
              </AppText>
              <View style={styles.recommendationGridRows}>
                {gridRows.map((row, rowIndex) => (
                  <ScrollView
                    contentContainerStyle={styles.recommendationGridScroll}
                    horizontal
                    key={`recommendation-grid-row-${rowIndex}`}
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    testID={`recommendation-grid-row-${rowIndex + 1}`}
                  >
                    {row.map((place) => (
                      <RecommendationGridCard
                        bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                        imageUrl={imageUrlsByPlaceId[String(place.id)]}
                        key={`recommendation-grid-${place.id}`}
                        onPress={() => onPlacePress(place)}
                        onToggleBookmark={() => onToggleBookmark(
                          place,
                          !bookmarkedPlaceIds[String(place.id)],
                        )}
                        pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                        place={place}
                      />
                    ))}
                  </ScrollView>
                ))}
              </View>
            </SheetMotionView>
          ) : null}
          </>
        ) : (
          <RecommendationState onRetry={onRetry} state={state} />
        )}
      </RecommendationStateTransition>
    </ScrollView>
  );
};
