import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  Text as NativeText,
  type TextProps,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import CallAsset from '../../../../assets/v2/icons/ion_call.svg';
import CameraAsset from '../../../../assets/v2/icons/place/Camera.svg';
import CleanAsset from '../../../../assets/v2/icons/place/Clean.svg';
import DeliciousAsset from '../../../../assets/v2/icons/place/Delicious.svg';
import DownAsset from '../../../../assets/v2/icons/place/Down.svg';
import GroupAsset from '../../../../assets/v2/icons/place/Group.svg';
import KindAsset from '../../../../assets/v2/icons/place/Kind.svg';
import ParkAsset from '../../../../assets/v2/icons/place/Park.svg';
import PinAsset from '../../../../assets/v2/icons/place/Pin.svg';
import TicketAsset from '../../../../assets/v2/icons/place/Tiket.svg';
import ArtAsset from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../assets/v2/icons/place/heritage.svg';
import HotPlaceAsset from '../../../../assets/v2/icons/place/hotplace.svg';
import MapAsset from '../../../../assets/v2/icons/place/maping_svg.svg';
import MusicAsset from '../../../../assets/v2/icons/place/music_svg.svg';
import PopupAsset from '../../../../assets/v2/icons/place/popup_svg.svg';
import RecommendationTitleAsset from '../../../../assets/v2/icons/place/Subtract.svg';
import {
  FadeSlideTransition,
  MOTION_DURATION,
  runTimingMotion,
  useReducedMotion,
} from '../../../shared/motion';
import { FavoriteIcon } from '../../../shared/components';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import type { PlaceOperatingSummaryText, ReservationCtaState } from '../../place-detail';
import GlassSurface from './GlassSurface';
import * as GlassStyles from '../styles/BottomSheetGlass.styles';
import { formatDistance as formatLocalizedDistance } from '../../../shared/i18n/formatters';
import { colors } from '../../../shared/theme/colors';
import { normalizePlaceCategory } from '../utils/placeCategory';
import PlacePhotoViewer from '../../place-detail/components/PlacePhotoViewer';
import { PlaceMenuSection } from '../../place-menus';
import MapSheetBottomNavigation from './MapSheetBottomNavigation';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'recommendations' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

export type MapPreviewFallbackContent = {
  amenities: Array<'english' | 'parking'>;
  coupons?: Array<{ period: string; title: string }>;
  englishName?: string;
  events?: Array<{ period: string; title: string }>;
  imageState?: 'empty' | 'error' | 'loading' | 'ready';
  imageUrls: string[];
  phone?: string;
  jibunAddress?: string;
  notice?: string;
  operatingSummary?: PlaceOperatingSummaryText;
  roadAddress?: string;
  summary?: string;
  reviewCount?: number;
  reservation?: ReservationCtaState;
  reviewState?: 'empty' | 'error' | 'loading' | 'ready';
  reviewHighlights?: Array<{ count: number; label: string }>;
  reviewParticipantCount?: number;
  reviews?: Array<{
    author: string;
    avatarUrl?: string;
    createdAt: string;
    hiddenTags?: string[];
    imageUrls?: string[];
    tags: string[];
    text: string;
  }>;
  statusDescription: string;
  statusEmphasis: string;
  verifiedEvidenceCount?: number;
};

export type DecisionPlace = {
  address: string;
  category: string;
  distance: string;
  distanceMeters?: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  recommendationRank?: number;
  recommendationReason?: string;
  recommendationSource?: string;
  tags: string[];
  verifiedAgo: string;
  verifiedMinutes?: number;
  wait: string;
  waitMinutes?: [number, number];
};

export function selectPlaceDetailAddress(
  placeAddress: string,
  fallbackContent?: Pick<MapPreviewFallbackContent, 'jibunAddress' | 'roadAddress'>,
): string {
  const candidates = [
    fallbackContent?.roadAddress,
    placeAddress,
    fallbackContent?.jibunAddress,
  ];

  return candidates.find((candidate) => candidate?.trim())?.trim() ?? '';
}

type MapBottomSheetProps = {
  activeFilters: VisitFilter[];
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds?: Record<string, boolean>;
  isBookmarkStateLoading?: boolean;
  collapsedTranslateY: number;
  content: BottomSheetContent;
  couponContent?: React.ReactNode;
  height: number;
  mediumTranslateY: number;
  onBackHome: () => void;
  onCreateReservation?: (place: DecisionPlace, imageUrl?: string) => void;
  onOpenRecommendations?: () => void;
  onDetailPress: (place: DecisionPlace) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  onStartVisitVerification?: (place: DecisionPlace) => void;
  onPlacePress: (place: DecisionPlace) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  previewFallbackContentByPlaceId?: Record<string, MapPreviewFallbackContent>;
  explorationImageUrlsByPlaceId?: Record<string, string>;
  recommendationContext?: string | null;
  recommendationLimitMessage?: string | null;
  recommendationPlaces: DecisionPlace[];
  recommendationsState: 'empty' | 'error' | 'loading' | 'ready';
  onRetryRecommendations: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onRetryReviews?: () => void;
  selectedPlace: DecisionPlace | null;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
  userName?: string;
};

type IconProps = {
  active?: boolean;
  size?: number;
};

type SheetCategory = 'art' | 'beauty' | 'cafe' | 'etc' | 'fashion' | 'food' | 'heritage' | 'music' | 'popup';

// Keep the Figma typography stable when an Android device uses a larger system font scale.
const Text = (props: TextProps) => <NativeText maxFontSizeMultiplier={1} {...props} />;

// Gap between the sheet chrome and the screen edges at rest; collapses to 0 when expanded.
const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;
const RECOMMENDATION_NAVIGATION_LOCK_MS = 500;
const CATEGORY_OPTIONS: Array<{ id: SheetCategory }> = [
  { id: 'popup' }, { id: 'music' }, { id: 'food' }, { id: 'fashion' }, { id: 'beauty' },
  { id: 'art' }, { id: 'cafe' }, { id: 'heritage' }, { id: 'etc' },
];

export const MapPinIcon = ({ active = false, size = 24 }: IconProps) => (
  <Svg height={size} viewBox="0 0 24 24" width={size}>
    <Path
      d="M12 22s7-6.1 7-13A7 7 0 0 0 5 9c0 6.9 7 13 7 13Z"
      fill={active ? '#FF245B' : 'none'}
      stroke={active ? '#FF245B' : '#383B43'}
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <Circle cx="12" cy="9" fill={active ? '#FFFFFF' : 'none'} r="2.4" stroke={active ? '#FFFFFF' : '#383B43'} strokeWidth="1.5" />
  </Svg>
);

const CardScrim = () => (
  <View pointerEvents="none" style={styles.cardScrim}>
    <Svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
      <Defs>
        <LinearGradient id="card-scrim" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.52" stopColor="#000000" stopOpacity="0.02" />
          <Stop offset="0.76" stopColor="#000000" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.82" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#card-scrim)" height="100" width="100" />
    </Svg>
  </View>
);

const RecommendationMetaIcon = () => (
  <Svg height={16} viewBox="0 0 18 18" width={16}>
    <Path d="M3 3.5h12v8H8l-3.5 3v-3H3z" fill="#E4E7EC" stroke="#777982" strokeLinejoin="round" />
    <Circle cx="6.5" cy="7.5" fill="#777982" r=".8" />
    <Circle cx="9" cy="7.5" fill="#777982" r=".8" />
    <Circle cx="11.5" cy="7.5" fill="#777982" r=".8" />
  </Svg>
);

const CategoryIcon = ({ active, category }: { active: boolean; category: SheetCategory }) => {
  const color = active ? '#FF1956' : '#5E5E66';

  switch (category) {
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
  feed,
  onChange,
}: {
  feed: 'local' | 'national';
  onChange: (feed: 'local' | 'national') => void;
}) => {
  const { t } = useTranslation();
  const [segmentWidth, setSegmentWidth] = useState(0);
  const indicatorProgress = useRef(new Animated.Value(feed === 'local' ? 0 : 1)).current;
  const reduceMotion = useReducedMotion();
  const indicatorWidth = Math.max(0, (segmentWidth - 6) / 2);

  useEffect(() => {
    const animation = runTimingMotion(indicatorProgress, feed === 'local' ? 0 : 1, {
      duration: MOTION_DURATION.transition,
      reduceMotion,
      useNativeDriver: true,
    });

    return () => animation?.stop();
  }, [feed, indicatorProgress, reduceMotion]);

  return (
    <View style={styles.segmentInset}>
      <View style={styles.segmentShadow}>
        <GlassSurface
          glassEffectStyle="regular"
          intensity={100}
          onLayout={(event) => setSegmentWidth(event.nativeEvent.layout.width)}
          style={styles.segmentOuter}
          testID="feed-segment-control"
          tintColor="rgba(228,228,230,0.48)"
        >
          <View pointerEvents="none" style={styles.segmentFrost} />
          {indicatorWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.segmentIndicator,
                {
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
              color={feed === 'local' ? '#FF1956' : '#767680'}
              height={20}
              width={16}
            />
            <Text style={[styles.segmentLabel, feed === 'local' && styles.segmentLabelActive]}>
              {t('map.sheet.localHotPlaces')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: feed === 'national' }}
            onPress={() => onChange('national')}
            style={styles.segment}
          >
            <MapAsset
              color={feed === 'national' ? '#FF1956' : '#767680'}
              height={20}
              width={18}
            />
            <Text style={[styles.segmentLabel, feed === 'national' && styles.segmentLabelActive]}>
              {t('map.sheet.nationwideTrends')}
            </Text>
          </Pressable>
        </GlassSurface>
      </View>
    </View>
  );
};

const BookmarkStar = ({
  selected,
  size = 28,
}: {
  selected: boolean;
  size?: number;
}) => <FavoriteIcon selected={selected} size={size} />;

const formatDistance = (place: DecisionPlace, language: string) => {
  if (place.distanceMeters !== undefined) {
    return formatLocalizedDistance(place.distanceMeters, language);
  }

  return place.distance;
};

const formatPreviewLocation = (place: DecisionPlace, language: string) => {
  const distance = formatDistance(place, language).trim();
  const address = place.address.trim();

  return [distance, address].filter(Boolean).join(' · ');
};

const PlaceArtwork = ({
  blurBottom = false,
  imageUrl,
  variant = 'trend',
}: {
  blurBottom?: boolean;
  imageUrl?: string;
  variant?: 'grid' | 'trend';
}) => {
  const { t } = useTranslation();
  const [hasImageError, setHasImageError] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setHasImageError(false);
    imageOpacity.stopAnimation();
    imageOpacity.setValue(0);

    return () => imageOpacity.stopAnimation();
  }, [imageOpacity, imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = t(hasImageError ? 'map.sheet.imageError' : 'map.sheet.imageMissing');

    return (
      <View
        accessibilityLabel={fallbackMessage}
        style={[styles.artwork, styles.artworkFallback, variant === 'grid' && styles.gridArtwork]}
      >
        <MapPinIcon active size={24} />
        <Text style={styles.artworkFallbackText}>{fallbackMessage}</Text>
      </View>
    );
  }

  const imageSource = { uri: imageUrl };
  const handleLoad = () => {
    runTimingMotion(imageOpacity, 1, {
      reduceMotion,
      useNativeDriver: true,
    });
  };

  return (
    <Animated.View
      style={[
        styles.artwork,
        variant === 'grid' && styles.gridArtwork,
        { opacity: imageOpacity },
      ]}
    >
      <Animated.Image
        onError={() => setHasImageError(true)}
        onLoad={handleLoad}
        resizeMode="cover"
        source={imageSource}
        style={styles.artworkImage}
        testID={blurBottom ? 'recommendation-featured-image' : undefined}
      />
      {blurBottom ? (
        <View pointerEvents="none" style={styles.artworkBlurClip}>
          <Image
            blurRadius={2}
            onError={() => setHasImageError(true)}
            resizeMode="cover"
            source={imageSource}
            style={styles.artworkBlurImage}
            testID="recommendation-featured-blur-image"
          />
        </View>
      ) : null}
    </Animated.View>
  );
};

const RecommendationCardPressable = ({
  accessibilityLabel,
  children,
  onPress,
  style,
  testID,
}: {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
  style: object;
  testID: string;
}) => {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const navigationLocked = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    scale.stopAnimation();
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
  }, [scale]);

  const animateScale = (toValue: number) => {
    runTimingMotion(scale, toValue, {
      duration: MOTION_DURATION.press,
      reduceMotion,
      useNativeDriver: true,
    });
  };

  const handlePress = () => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    onPress();
    unlockTimer.current = setTimeout(() => {
      navigationLocked.current = false;
      unlockTimer.current = null;
    }, RECOMMENDATION_NAVIGATION_LOCK_MS);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={handlePress}
        onPressIn={() => animateScale(0.985)}
        onPressOut={() => animateScale(1)}
        style={style}
        testID={testID}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const RecommendationBookmarkButton = ({
  bookmarked,
  onToggleBookmark,
  pending,
  size = 28,
  style,
}: {
  bookmarked: boolean;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  size?: number;
  style: object;
}) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const mutationLocked = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    scale.stopAnimation();
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, [scale]);

  const handlePress = async () => {
    if (pending || mutationLocked.current) return;
    mutationLocked.current = true;

    if (!reduceMotion) {
      runTimingMotion(scale, 0.88, {
        duration: MOTION_DURATION.press,
        reduceMotion: false,
        useNativeDriver: true,
      });
      feedbackTimer.current = setTimeout(() => {
        runTimingMotion(scale, 1, {
          duration: MOTION_DURATION.press,
          reduceMotion: false,
          useNativeDriver: true,
        });
        feedbackTimer.current = null;
      }, MOTION_DURATION.press);
    }

    try {
      await onToggleBookmark();
    } finally {
      mutationLocked.current = false;
    }
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
        accessibilityRole="button"
        accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
        disabled={pending}
        hitSlop={10}
        onPress={(event) => {
          event.stopPropagation();
          void handlePress();
        }}
        style={({ pressed }) => reduceMotion && pressed ? styles.bookmarkPressed : undefined}
      >
        <BookmarkStar selected={bookmarked} size={size} />
      </Pressable>
    </Animated.View>
  );
};

const PreviewArtwork = ({ imageUrl }: { imageUrl?: string }) => {
  const { t } = useTranslation();
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = t(hasImageError ? 'map.sheet.imageError' : 'map.sheet.imageMissing');

    return (
      <View accessibilityLabel={fallbackMessage} style={styles.previewArtworkFallback}>
        <MapPinIcon active size={28} />
        <Text style={styles.previewArtworkFallbackText}>{fallbackMessage}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={t('map.sheet.image')}
      onError={() => setHasImageError(true)}
      resizeMode="cover"
      source={{ uri: imageUrl }}
      style={styles.previewArtwork}
    />
  );
};

export const RecommendationFeaturedCard = ({
  bookmarked,
  designSize = 'default',
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
  recommendationLabel,
}: {
  bookmarked: boolean;
  designSize?: 'default' | 'reservation';
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  place: DecisionPlace;
  recommendationLabel?: string;
}) => {
  const { i18n, t } = useTranslation();
  return (
    <RecommendationCardPressable
      accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
      onPress={onPress}
      style={[styles.placeCard, designSize === 'reservation' && styles.reservationPlaceCard]}
      testID={`recommendation-card-${place.id}`}
    >
      <View style={[styles.placeCardArtwork, designSize === 'reservation' && styles.reservationPlaceCardArtwork]}>
        <PlaceArtwork blurBottom imageUrl={imageUrl} />
        <CardScrim />
        <RecommendationBookmarkButton
          bookmarked={bookmarked}
          onToggleBookmark={onToggleBookmark}
          pending={pending}
          style={styles.cardBookmarkStar}
        />
        <View style={styles.placeCardBody}>
          <Text ellipsizeMode="tail" numberOfLines={2} style={[styles.placeCardName, designSize === 'reservation' && styles.reservationPlaceCardName]}>
            {place.name || t('map.sheet.placeMissing')}
          </Text>
        </View>
      </View>
      {recommendationLabel ? (
        <View style={styles.recommendationMetaRow}>
          <RecommendationMetaIcon />
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.recommendationReason}>
            {recommendationLabel}
          </Text>
        </View>
      ) : null}
      <Text ellipsizeMode="tail" numberOfLines={1} style={[styles.placeCardDistance, designSize === 'reservation' && styles.reservationPlaceCardDistance]}>
        {t('map.sheet.distanceAway', { distance: formatDistance(place, i18n.language) })}
      </Text>
    </RecommendationCardPressable>
  );
};

const RecommendationGridCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  return (
    <RecommendationCardPressable
      accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
      onPress={onPress}
      style={styles.gridCard}
      testID={`recommendation-grid-card-${place.id}`}
    >
      <PlaceArtwork blurBottom imageUrl={imageUrl} variant="grid" />
      <CardScrim />
      <RecommendationBookmarkButton
        bookmarked={bookmarked}
        onToggleBookmark={onToggleBookmark}
        pending={pending}
        style={styles.gridBookmarkStar}
      />
      <View style={styles.gridCardBody}>
        <Text ellipsizeMode="tail" numberOfLines={2} style={styles.gridCardName}>
          {place.name || t('map.sheet.placeMissing')}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.gridCardDistance}>{place.address}</Text>
      </View>
    </RecommendationCardPressable>
  );
};

const PlaceTrendCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  return (
  <Pressable
    accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeTrendCard, pressed && styles.pressed]}
  >
    <PlaceArtwork blurBottom imageUrl={imageUrl} />
    <CardScrim />
    <Pressable
      accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, checked: bookmarked, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      <BookmarkStar selected={bookmarked} />
    </Pressable>
    <View style={styles.homeTrendCardBody}>
      <Text numberOfLines={1} style={styles.homeTrendCardName}>
        {place.name || t('map.sheet.placeMissing')}
      </Text>
      <Text numberOfLines={1} style={styles.homeTrendCardDistance}>
        {t('map.sheet.distanceAway', { distance: formatDistance(place, i18n.language) })}
      </Text>
    </View>
  </Pressable>
  );
};

const ExpandedPlaceCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  return (
  <Pressable
    accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeGridCard, pressed && styles.pressed]}
  >
    <PlaceArtwork blurBottom imageUrl={imageUrl} variant="grid" />
    <CardScrim />
    <Pressable
      accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, checked: bookmarked, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      <BookmarkStar selected={bookmarked} />
    </Pressable>
    <View style={styles.homeGridCardBody}>
      <Text numberOfLines={2} style={styles.homeGridCardName}>{place.name}</Text>
      <Text numberOfLines={1} style={styles.homeGridCardDistance}>{t('map.sheet.distanceAway', { distance: formatDistance(place, i18n.language) })}</Text>
    </View>
  </Pressable>
  );
};

const placeMatchesCategory = (place: DecisionPlace, category: SheetCategory) => {
  const value = place.category.trim().toLowerCase();
  const aliases: Record<SheetCategory, string[]> = {
    art: ['art', 'exhibit', 'exhibition', '전시'],
    beauty: ['beauty', '뷰티', '미용'],
    cafe: ['cafe', 'coffee', '카페', '커피'],
    etc: ['etc', 'other', '기타'],
    fashion: ['fashion', '패션'],
    food: ['dining', 'food', 'restaurant', '음식', '식당'],
    heritage: ['heritage', 'historic', 'ruin', '문화재', '유적'],
    music: ['music', '음악'],
    popup: ['pop-up', 'popup', '팝업'],
  };

  return aliases[category].some((alias) => value.includes(alias));
};

const ExpandedHomeContent = ({
  activeCategory,
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  feed,
  expandedInteractionsEnabled,
  expandedOnlyOpacity,
  imageUrlsByPlaceId,
  isBookmarkStateLoading,
  onCategoryChange,
  onFeedChange,
  onPlacePress,
  onToggleBookmark,
  places,
  state,
  userName,
}: {
  activeCategory: SheetCategory;
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  feed: 'local' | 'national';
  expandedInteractionsEnabled: boolean;
  expandedOnlyOpacity: Animated.AnimatedInterpolation<number>;
  imageUrlsByPlaceId: Record<string, string>;
  isBookmarkStateLoading: boolean;
  onCategoryChange: (category: SheetCategory) => void;
  onFeedChange: (feed: 'local' | 'national') => void;
  onPlacePress: (place: DecisionPlace) => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  places: DecisionPlace[];
  state?: 'empty' | 'error' | 'loading' | 'ready';
  userName: string;
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [hasRenderedExpandedContent, setHasRenderedExpandedContent] = useState(
    expandedInteractionsEnabled,
  );
  const categoryPlaces = places.filter((place) => placeMatchesCategory(place, activeCategory));
  const gridPlaces = categoryPlaces.length > 0 ? categoryPlaces : places;
  const shouldRenderExpandedContent = expandedInteractionsEnabled || hasRenderedExpandedContent;

  useEffect(() => {
    if (expandedInteractionsEnabled) setHasRenderedExpandedContent(true);
  }, [expandedInteractionsEnabled]);
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
      scrollEnabled={expandedInteractionsEnabled}
      showsVerticalScrollIndicator={false}
      style={styles.expandedScroll}
      testID="expanded-home-scroll"
    >
      <FeedSegment feed={feed} onChange={onFeedChange} />
      <FadeSlideTransition
        direction={feed === 'local' ? 0 : 1}
        stateKey={feed}
        style={styles.feedTransition}
        testID="feed-content-transition"
      >
        <ScrollView
          contentContainerStyle={styles.expandedFeaturedRow}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.rowScroll}
        >
          {places.length > 0 ? places.slice(0, 6).map((place) => (
            <PlaceTrendCard
              bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
              imageUrl={imageUrlsByPlaceId[String(place.id)]}
              key={`featured-${place.id}`}
              onPress={() => onPlacePress(place)}
              onToggleBookmark={() => void onToggleBookmark(
                place,
                !bookmarkedPlaceIds[String(place.id)],
              )}
              pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
              place={place}
            />
          )) : <EmptyCard state={state} variant="row" />}
        </ScrollView>

        {shouldRenderExpandedContent ? (
          <Animated.View
            pointerEvents={expandedInteractionsEnabled ? 'auto' : 'none'}
            style={{ opacity: expandedOnlyOpacity }}
            testID="expanded-home-only-content"
          >
            <Text style={styles.expandedTitle}>{t('map.sheet.categoryPopular', { userName })}</Text>

            <ScrollView
              contentContainerStyle={styles.categoryRow}
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
                    <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>
                      {t(`map.categories.${category.id}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.gridRow}>
              {gridPlaces.slice(0, 8).map((place) => (
                <ExpandedPlaceCard
                  bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                  imageUrl={imageUrlsByPlaceId[String(place.id)]}
                  key={`grid-${place.id}`}
                  onPress={() => onPlacePress(place)}
                  onToggleBookmark={() => void onToggleBookmark(
                    place,
                    !bookmarkedPlaceIds[String(place.id)],
                  )}
                  pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                  place={place}
                />
              ))}
            </View>
          </Animated.View>
        ) : null}
      </FadeSlideTransition>
    </ScrollView>
  );
};

const EmptyCard = ({
  state = 'loading',
  variant = 'list',
}: {
  state?: 'empty' | 'error' | 'loading' | 'ready';
  variant?: 'list' | 'row';
}) => {
  const { t } = useTranslation();
  const copyState = state === 'ready' ? 'empty' : state;

  return (
    <View style={[variant === 'row' ? styles.emptyCardRow : styles.placeCard, styles.emptyCard]}>
      <View style={styles.emptyCardIcon}><MapPinIcon active size={24} /></View>
      <Text style={styles.emptyCardTitle}>{t(`map.sheet.state.${copyState}Title`)}</Text>
      <Text style={styles.emptyCardBody}>{t(`map.sheet.state.${copyState}Body`)}</Text>
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
  return (
  <View
    accessibilityLiveRegion="polite"
    style={styles.recommendationState}
    testID={`recommendation-state-${state}`}
  >
    <Text style={styles.emptyCardTitle}>
      {t(`map.sheet.state.recommendation${state[0].toUpperCase()}${state.slice(1)}Title`)}
    </Text>
    <Text style={styles.emptyCardBody}>
      {t(`map.sheet.state.recommendation${state[0].toUpperCase()}${state.slice(1)}Body`)}
    </Text>
    {state === 'error' ? (
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>{t('common.error.retry')}</Text>
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

const RecommendationContent = ({
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
  state: 'empty' | 'error' | 'loading' | 'ready';
  userName: string;
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const featuredPlaces = places.slice(0, 3);
  const gridPlaces = places.slice(3);
  const gridRows = [
    gridPlaces.filter((_, index) => index % 2 === 0),
    gridPlaces.filter((_, index) => index % 2 === 1),
  ].filter((row) => row.length > 0);
  const recommendationLabel = (index: number) => t(
    index % 2 === 0
      ? 'map.recommendations.affinityLabel'
      : 'map.recommendations.hiddenLabel',
    { userName },
  );

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
      scrollEnabled={expandedInteractionsEnabled}
      showsVerticalScrollIndicator={false}
      testID="recommendation-content-scroll"
    >
      <View style={styles.recommendationHeader}>
        <View style={styles.recommendationTitleRow}>
          <RecommendationTitleAsset height={22} width={22} />
          <Text style={styles.recommendationTitle}>{t('map.sheet.recommendationTitle')}</Text>
        </View>
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.recommendationSubtitle}>
          {t('map.recommendations.subtitle', { userName })}
        </Text>
      </View>
      <RecommendationStateTransition state={state}>
        {state === 'ready' ? (
          <>
          <ScrollView
            contentContainerStyle={styles.recommendationCardRow}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {featuredPlaces.map((place, index) => (
              <RecommendationFeaturedCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                key={`recommendation-featured-${place.id}`}
                onPress={() => onPlacePress(place)}
                onToggleBookmark={() => onToggleBookmark(
                  place,
                  !bookmarkedPlaceIds[String(place.id)],
                )}
                pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                place={place}
                recommendationLabel={recommendationLabel(index)}
              />
            ))}
          </ScrollView>
          {gridPlaces.length > 0 ? (
            <Animated.View
              pointerEvents={expandedInteractionsEnabled ? 'auto' : 'none'}
              style={{ opacity: expandedOnlyOpacity }}
              testID="expanded-recommendation-only-content"
            >
              <Text style={styles.recommendationGridTitle}>
                {t('map.recommendations.verificationTitle')}
              </Text>
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
            </Animated.View>
          ) : null}
          </>
        ) : (
          <RecommendationState onRetry={onRetry} state={state} />
        )}
      </RecommendationStateTransition>
    </ScrollView>
  );
};

const ResultRow = ({
  onPress,
  place,
}: {
  onPress: () => void;
  place: DecisionPlace;
}) => {
  const { i18n } = useTranslation();
  return (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
    <View style={styles.resultThumbnail}><MapPinIcon active size={25} /></View>
    <View style={styles.resultTextBody}>
      <Text numberOfLines={1} style={styles.resultName}>{place.name}</Text>
      <Text numberOfLines={1} style={styles.resultAddress}>{place.address}</Text>
    </View>
    <Text style={styles.resultDistance}>{formatDistance(place, i18n.language)}</Text>
  </Pressable>
  );
};

const PreviewAmenity = ({ type }: { type: 'english' | 'parking' }) => {
  const { t } = useTranslation();
  return (
  <View style={styles.previewAmenityChip}>
    {type === 'english'
      ? <GroupAsset height={20} width={20} />
      : <ParkAsset height={20} width={20} />}
    <Text style={styles.previewAmenityText}>{t(type === 'english' ? 'map.detail.amenityEnglish' : 'map.detail.amenityParking')}</Text>
  </View>
  );
};

const ReviewHighlightIcon = ({ label }: { label: string }) => {
  if (label.includes('사진')) return <CameraAsset height={16} width={19} />;
  if (label.includes('깨끗')) return <CleanAsset height={16} width={16} />;
  if (label.includes('다국어')) return <GroupAsset height={16} width={16} />;
  if (label.includes('친절')) return <KindAsset height={16} width={15} />;
  return <DeliciousAsset height={16} width={16} />;
};

const InfoClockIcon = () => (
  <Svg height={16} viewBox="0 0 16 16" width={16}>
    <Circle cx={8} cy={8} fill="none" r={6.5} stroke="#7B7F88" strokeWidth={1.5} />
    <Path d="M8 4.5V8L10.5 9.5" fill="none" stroke="#7B7F88" strokeLinecap="round" strokeWidth={1.5} />
  </Svg>
);

const ReviewerAvatar = ({ name, url }: { name: string; url?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <View style={styles.detailReviewerAvatar}>
        <Text style={styles.detailReviewerInitial}>{name.slice(0, 1)}</Text>
      </View>
    );
  }

  return (
    <Image
      onError={() => setHasError(true)}
      resizeMode="cover"
      source={{ uri: url }}
      style={styles.detailReviewerAvatarImage}
    />
  );
};

const ReviewTags = ({ hiddenTags = [], tags }: { hiddenTags?: string[]; tags: string[] }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleTags = isExpanded ? [...tags, ...hiddenTags] : tags;

  return (
    <View style={styles.detailReviewTagRow}>
      {visibleTags.map((tag, index) => (
        <View key={`${tag}-${index}`} style={styles.detailReviewTag}>
          <ReviewHighlightIcon label={tag} />
          <Text style={styles.detailReviewTagText}>{tag}</Text>
        </View>
      ))}
      {hiddenTags.length > 0 ? (
        <Pressable
          accessibilityLabel={isExpanded
            ? t('map.detail.collapseTags')
            : t('map.detail.expandTags', { count: hiddenTags.length })}
          accessibilityRole="button"
          onPress={() => setIsExpanded((current) => !current)}
          style={({ pressed }) => [styles.detailReviewTag, pressed && styles.pressed]}
        >
          <Text style={styles.detailReviewTagText}>
            {isExpanded ? t('map.detail.collapseTags') : `+${hiddenTags.length}`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

type PreviewActionKind = 'arrival' | 'departure' | 'directions' | 'reservation' | 'share';

const PreviewActionIcon = ({ kind }: { kind: PreviewActionKind }) => {
  if (kind === 'share') {
    return (
      <Svg height={13} viewBox="0 0 16 16" width={13}>
        <Path d="M6 3H3.8A1.8 1.8 0 0 0 2 4.8v7.4A1.8 1.8 0 0 0 3.8 14h7.4a1.8 1.8 0 0 0 1.8-1.8V10M8 2h6v6M14 2 7.5 8.5" fill="none" stroke="#5A5D65" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  if (kind === 'reservation') {
    return (
      <Svg height={13} viewBox="0 0 16 16" width={13}>
        <Path d="M3 4.2A1.7 1.7 0 0 1 4.7 2.5h6.6A1.7 1.7 0 0 1 13 4.2v7.1a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 11.3V4.2Z" fill="none" stroke="#5A5D65" strokeWidth={1.4} />
        <Path d="m6 8 1.3 1.3L10.4 6" fill="none" stroke="#5A5D65" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  if (kind === 'directions') {
    return (
      <Svg height={14} viewBox="0 0 16 16" width={14}>
        <Path d="m2.2 2.7 11.6 4.7-5 1.2-1.4 4.7-5.2-10.6Z" fill="none" stroke="#5A5D65" strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  return null;
};

const PreviewActionChip = ({ active = false, disabled = false, kind, label, onPress }: { active?: boolean; disabled?: boolean; kind: PreviewActionKind; label: string; onPress?: () => void }) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityState={{ disabled, selected: active }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.previewActionChip,
      active && styles.previewActionChipActive,
      pressed && styles.pressed,
      disabled && { opacity: 0.45 },
    ]}
  >
    <PreviewActionIcon kind={kind} />
    <Text style={[styles.previewActionText, active && styles.previewActionTextActive]}>{label}</Text>
  </Pressable>
);

const formatPreviewCategory = (category: string) => {
  const normalized = normalizePlaceCategory(category);
  return normalized === 'game' ? 'popup' : normalized;
};

const PreviewContent = ({
  activeAction,
  bookmarked,
  fallbackContent,
  imageUrl,
  onBack,
  onDetail,
  onOpenImages,
  onReserve,
  onVerify,
  onRetryAvailability,
  onRetryMedia,
  onSelectAction,
  onToggleBookmark,
  pending,
  place,
}: {
  activeAction: PreviewActionKind;
  bookmarked: boolean;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onDetail: () => void;
  onOpenImages?: (imageUrls: string[], initialIndex: number) => void;
  onReserve: () => void;
  onVerify?: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onSelectAction: (action: PreviewActionKind) => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const imageUrls = fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl];
  const validImageUrls = imageUrls.filter((url): url is string => Boolean(url));
  const contentWidth = Math.min(windowWidth, 480) - 32;
  const imageHeight = Math.min(188, Math.max(158, Math.round(contentWidth * 0.47)));
  const primaryImageWidth = Math.min(252, Math.max(218, Math.round(contentWidth * 0.64)));
  const secondaryImageWidth = Math.min(184, Math.max(150, Math.round(contentWidth * 0.46)));
  const reservation = fallbackContent?.reservation ?? {
    kind: 'loading', disabled: true,
  };
  const reservationPress = reservation.kind === 'error' ? onRetryAvailability : onReserve;
  const selectAction = (action: PreviewActionKind, callback?: () => void) => {
    onSelectAction(action);
    callback?.();
  };
  const verificationSummary = typeof fallbackContent?.verifiedEvidenceCount === 'number'
    ? t('map.detail.verifiedCount', { count: fallbackContent.verifiedEvidenceCount })
    : fallbackContent?.statusDescription;

  return (
    <View style={styles.previewContent}>
      <View style={styles.previewHeader}>
        <Pressable
          accessibilityLabel={t('map.detail.preview', { name: place.name })}
          accessibilityRole="button"
          onPress={onDetail}
          style={styles.previewSummary}
        >
          <View style={styles.previewTitleRow}>
            <Text accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={1} style={styles.previewName}>{place.name}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.previewCategory}>{t(`map.categories.${formatPreviewCategory(place.category)}`)}</Text>
          </View>
          {fallbackContent && (verificationSummary || fallbackContent.statusEmphasis) ? (
            <View style={styles.previewStatusRow}>
              {verificationSummary ? (
                <Text numberOfLines={1} style={styles.previewStatus}>
                  {verificationSummary}
                </Text>
              ) : null}
              {fallbackContent.statusEmphasis ? (
                <Text style={styles.previewStatusEmphasis}>
                  {verificationSummary ? ' · ' : ''}
                  {fallbackContent.statusEmphasis}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Text accessibilityLabel={formatPreviewLocation(place, i18n.language)} ellipsizeMode="tail" numberOfLines={1} style={styles.previewAddress}>
            {formatPreviewLocation(place, i18n.language)}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
          disabled={pending}
          onPress={onToggleBookmark}
          style={({ pressed }) => [styles.previewBookmarkButton, pressed && styles.pressed]}
          testID="place-preview-bookmark"
        >
          <BookmarkStar selected={bookmarked} size={22} />
        </Pressable>
        <Pressable
          accessibilityLabel={t('map.card.dismiss')}
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.previewCloseButton, pressed && styles.pressed]}
          testID="place-preview-close"
        >
          <Text style={styles.previewCloseText}>×</Text>
        </Pressable>
      </View>
      {fallbackContent?.amenities.length ? (
        <View style={styles.previewAmenityRow}>
          {fallbackContent.amenities.map((amenity) => <PreviewAmenity key={amenity} type={amenity} />)}
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.previewActionRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip
          active={activeAction === 'departure'}
          kind="departure"
          label={t('map.card.actions.start')}
          onPress={() => selectAction('departure')}
        />
        <PreviewActionChip
          active={activeAction === 'arrival'}
          kind="arrival"
          label={t('map.card.actions.arrive')}
          onPress={() => selectAction('arrival', onVerify)}
        />
        <PreviewActionChip
          active={activeAction === 'share'}
          kind="share"
          label={t('map.card.actions.share')}
          onPress={() => selectAction('share')}
        />
        <PreviewActionChip
          active={activeAction === 'reservation'}
          disabled={reservation.disabled && reservation.kind !== 'error'}
          kind="reservation"
          label={t(reservation.kind === 'error' ? 'map.detail.reservation.retry' : 'map.card.actions.reserve')}
          onPress={() => selectAction('reservation', reservationPress)}
        />
        <PreviewActionChip
          active={activeAction === 'directions'}
          kind="directions"
          label={t('map.card.actions.directions')}
          onPress={() => selectAction('directions')}
        />
      </ScrollView>
      {fallbackContent?.imageState === 'error' ? (
        <Pressable accessibilityRole="button" onPress={onRetryMedia}>
          <Text style={styles.detailEmptyText}>{t('map.detail.imageError')}</Text>
        </Pressable>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.previewImageRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {imageUrls.map((url, index) => (
          <Pressable
            accessibilityLabel={t('map.detail.imageDetail', { count: index + 1, name: place.name })}
            accessibilityRole="button"
            key={`${url ?? 'missing'}-${index}`}
            onPress={() => {
              if (url && onOpenImages) {
                onOpenImages(validImageUrls, validImageUrls.indexOf(url));
                return;
              }
              onDetail();
            }}
            style={[
              styles.previewImagePanel,
              { height: imageHeight, width: index === 0 ? primaryImageWidth : secondaryImageWidth },
            ]}
          >
            <PreviewArtwork imageUrl={url} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

type PlaceDetailTab = 'info' | 'reviews';

const ExpandedPlaceContent = ({
  activeAction,
  activeTab,
  bookmarked,
  couponContent,
  fallbackContent,
  imageUrl,
  onBack,
  onOpenImages,
  onReserve,
  onVerify,
  onRetryAvailability,
  onRetryMedia,
  onRetryReviews,
  onSelectAction,
  onTabChange,
  onToggleBookmark,
  pending,
  place,
}: {
  activeAction: PreviewActionKind;
  activeTab: PlaceDetailTab;
  bookmarked: boolean;
  couponContent?: React.ReactNode;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onOpenImages?: (imageUrls: string[], initialIndex: number) => void;
  onReserve: () => void;
  onVerify?: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onRetryReviews?: () => void;
  onSelectAction: (action: PreviewActionKind) => void;
  onTabChange: (tab: PlaceDetailTab) => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const imageUrls = fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl];
  const validImageUrls = imageUrls.filter((url): url is string => Boolean(url));
  const reservation = fallbackContent?.reservation ?? {
    kind: 'loading', disabled: true,
  };
  const reservationPress = reservation.kind === 'error' ? onRetryAvailability : onReserve;
  const selectAction = (action: PreviewActionKind, callback?: () => void) => {
    onSelectAction(action);
    callback?.();
  };
  const reviewImageUrls = (fallbackContent?.reviews ?? [])
    .flatMap((review) => review.imageUrls ?? []);
  const detailAddress = selectPlaceDetailAddress(place.address, fallbackContent);
  const verificationSummary = typeof fallbackContent?.verifiedEvidenceCount === 'number'
    ? t('map.detail.verifiedCount', { count: fallbackContent.verifiedEvidenceCount })
    : fallbackContent?.statusDescription || fallbackContent?.englishName;

  return (
    <ScrollView
      contentContainerStyle={[styles.detailContent, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailTopBar}>
        <Pressable
          accessibilityLabel={t('map.detail.back')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.detailRoundButton}
        >
          <BackIcon width={44} height={44} />
        </Pressable>
        <Pressable
          accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
          disabled={pending}
          hitSlop={12}
          onPress={onToggleBookmark}
          style={styles.detailRoundButton}
        >
          <BookmarkStar selected={bookmarked} size={22} />
        </Pressable>
      </View>

      <View style={styles.detailHeading}>
        <View style={styles.detailTitleRow}>
          <Text accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={2} style={styles.detailTitle}>{place.name}</Text>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.detailCategory}>{t(`map.categories.${formatPreviewCategory(place.category)}`)}</Text>
        </View>
        {verificationSummary ? (
          <Text style={styles.detailVerified}>{verificationSummary}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.detailActionRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip
          active={activeAction === 'departure'}
          kind="departure"
          label={t('map.card.actions.start')}
          onPress={() => selectAction('departure')}
        />
        <PreviewActionChip
          active={activeAction === 'arrival'}
          kind="arrival"
          label={t('map.card.actions.arrive')}
          onPress={() => selectAction('arrival', onVerify)}
        />
        <PreviewActionChip
          active={activeAction === 'share'}
          kind="share"
          label={t('map.card.actions.share')}
          onPress={() => selectAction('share')}
        />
        <PreviewActionChip
          active={activeAction === 'reservation'}
          disabled={reservation.disabled && reservation.kind !== 'error'}
          kind="reservation"
          label={t(reservation.kind === 'error' ? 'map.detail.reservation.retry' : 'map.card.actions.reserve')}
          onPress={() => selectAction('reservation', reservationPress)}
        />
        <PreviewActionChip
          active={activeAction === 'directions'}
          kind="directions"
          label={t('map.card.actions.directions')}
          onPress={() => selectAction('directions')}
        />
      </ScrollView>
      {fallbackContent?.imageState === 'error' ? (
        <Pressable accessibilityRole="button" onPress={onRetryMedia}>
          <Text style={styles.detailEmptyText}>{t('map.detail.imageError')}</Text>
        </Pressable>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.detailPhotoRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {imageUrls.map((url, index) => (
          <Pressable
            accessibilityLabel={url
              ? t('map.detail.imageDetail', { count: index + 1, name: place.name })
              : undefined}
            accessibilityRole={url ? 'button' : undefined}
            key={`${url ?? 'missing'}-${index}`}
            onPress={url && onOpenImages
              ? () => onOpenImages(validImageUrls, validImageUrls.indexOf(url))
              : undefined}
            style={[styles.detailPhoto, index === 0 && styles.detailPhotoPrimary]}
          >
            <PreviewArtwork imageUrl={url} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.detailTabs}>
        {(['info', 'reviews'] as const).map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            key={tab}
            onPress={() => onTabChange(tab)}
            style={styles.detailTab}
          >
            <Text style={[styles.detailTabText, activeTab === tab && styles.detailTabTextActive]}>
              {t(tab === 'info' ? 'map.detail.info' : 'map.detail.reviews')}
            </Text>
            {activeTab === tab ? (
              <View style={styles.detailTabIndicator} testID="map-detail-active-tab-indicator" />
            ) : null}
          </Pressable>
        ))}
      </View>

      {activeTab === 'info' ? (
        <View>
          <View style={styles.detailInfoBlock}>
            <View style={styles.detailInfoRow}>
              <PinAsset height={16} width={14} />
              <Text style={styles.detailInfoText}>{detailAddress}</Text>
            </View>
            {fallbackContent ? (
              <>
                <View style={styles.detailInfoRow}>
                  <InfoClockIcon />
                  <Text numberOfLines={2} style={styles.detailInfoText}>
                    <Text style={[
                      styles.detailOperatingStatus,
                      fallbackContent.operatingSummary?.tone === 'positive'
                        ? styles.detailOperatingPositive
                        : fallbackContent.operatingSummary?.tone === 'warning'
                          ? styles.detailOperatingWarning
                          : styles.detailOperatingNeutral,
                    ]}>
                      {fallbackContent.operatingSummary?.statusText
                        ?? fallbackContent.statusEmphasis}
                    </Text>
                    {fallbackContent.operatingSummary?.detailText
                      ? ` · ${fallbackContent.operatingSummary.detailText}` : ''}
                  </Text>
                </View>
                {fallbackContent.phone ? (
                  <View style={styles.detailInfoRow}>
                    <CallAsset height={16} width={16} />
                    <Text style={styles.detailInfoText}>{fallbackContent.phone}</Text>
                  </View>
                ) : null}
              </>
            ) : null}
            {fallbackContent?.amenities.length ? (
              <View style={styles.detailAmenityRow}>
                {fallbackContent.amenities.map((amenity) => (
                  <PreviewAmenity key={amenity} type={amenity} />
                ))}
              </View>
            ) : null}
          </View>

          {fallbackContent?.notice ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('map.detail.notice')}</Text>
              <Text style={styles.detailInfoText}>{fallbackContent.notice}</Text>
            </View>
          ) : null}

          {fallbackContent?.summary ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('map.detail.description')}</Text>
              <Text style={styles.detailInfoText}>{fallbackContent.summary}</Text>
            </View>
          ) : null}

          {couponContent ?? (fallbackContent?.coupons?.length ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('map.detail.coupon')}</Text>
              {fallbackContent.coupons.map((coupon, index) => (
                <View key={`${coupon.title}-${index}`} style={styles.detailCouponRow}>
                  <View style={styles.detailCouponIcon}><TicketAsset height={24} width={24} /></View>
                  <View style={styles.detailCouponBody}>
                    <Text style={styles.detailCouponTitle}>{coupon.title}</Text>
                    <Text style={styles.detailCouponPeriod}>{coupon.period}</Text>
                  </View>
                  <DownAsset height={17} width={14} />
                </View>
              ))}
            </View>
          ) : null)}

          <PlaceMenuSection placeId={place.id} />

          {fallbackContent?.events?.length ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>{t('map.detail.events')}</Text>
              {fallbackContent.events.map((event, index) => (
                <View key={`${event.title}-${index}`} style={styles.detailCouponRow}>
                  <View style={styles.detailCouponBody}>
                    <Text style={styles.detailCouponTitle}>{event.title}</Text>
                    {event.period ? <Text style={styles.detailCouponPeriod}>{event.period}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

        </View>
      ) : (
        <View>
          {fallbackContent?.reviewHighlights?.length ? (
            <View style={styles.detailReviewSection}>
            <Text style={styles.detailReviewTitle}>
              {t('map.detail.reviewHighlights')}
              {fallbackContent?.reviewParticipantCount ? (
                <Text style={styles.detailReviewCount}> {t('map.detail.participantCount', { count: fallbackContent.reviewParticipantCount })}</Text>
              ) : null}
            </Text>
            {fallbackContent.reviewHighlights.map((highlight, index, items) => {
              const maxCount = Math.max(...items.map((item) => item.count), 1);
              const scoreRatio = Math.min(1, Math.max(0, highlight.count / maxCount));
              const fillOpacity = 0.16 + (scoreRatio * 0.62);
              return (
                <View key={highlight.label} style={styles.detailHighlightRow}>
                  <View
                    style={[
                      styles.detailHighlightFill,
                      {
                        backgroundColor: `rgba(255,36,91,${fillOpacity.toFixed(2)})`,
                        width: `${Math.max(24, scoreRatio * 100)}%`,
                      },
                    ]}
                  />
                  <View style={styles.detailHighlightLabelRow}>
                    <ReviewHighlightIcon label={highlight.label} />
                    <Text style={styles.detailHighlightLabel}>{highlight.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.detailHighlightCount,
                      scoreRatio >= 0.88 && styles.detailHighlightCountOnStrong,
                    ]}
                  >
                    {highlight.count}
                  </Text>
                </View>
              );
            })}
            </View>
          ) : null}

          {reviewImageUrls.length ? (
            <View style={styles.detailReviewSection}>
              <Text style={styles.detailSectionTitle}>{t('map.detail.photoReviews')}</Text>
              <ScrollView contentContainerStyle={styles.detailReviewPhotos} horizontal showsHorizontalScrollIndicator={false}>
              {reviewImageUrls.map((url, index) => (
                <Pressable
                  accessibilityLabel={t('map.detail.imageDetail', {
                    count: index + 1,
                    name: place.name,
                  })}
                  accessibilityRole="button"
                  key={`${url ?? 'missing'}-review-${index}`}
                  onPress={onOpenImages
                    ? () => onOpenImages(reviewImageUrls, index)
                    : undefined}
                  style={styles.detailReviewPhoto}
                >
                  <PreviewArtwork imageUrl={url} />
                </Pressable>
              ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.detailReviewSection}>
            <Text style={styles.detailSectionTitle}>{t('map.detail.reviewCount', { count: fallbackContent?.reviewCount ?? 0 })}</Text>
            {fallbackContent?.reviewState === 'error' ? (
              <Pressable accessibilityRole="button" onPress={onRetryReviews}>
                <Text style={styles.detailEmptyText}>{t('map.detail.reviewError')}</Text>
              </Pressable>
            ) : fallbackContent?.reviewState === 'loading' ? (
              <Text accessibilityLiveRegion="polite" style={styles.detailEmptyText}>{t('map.detail.reviewLoading')}</Text>
            ) : fallbackContent?.reviews?.length ? fallbackContent.reviews.map((review, index) => (
              <View key={`${review.author}-${review.createdAt}-${index}`} style={styles.detailReviewItem}>
                <View style={styles.detailReviewerRow}>
                  <ReviewerAvatar name={review.author} url={review.avatarUrl} />
                  <View style={styles.detailReviewBody}>
                    <Text style={styles.detailReviewerName}>{review.author}</Text>
                    <Text style={styles.detailReviewMeta}>{review.createdAt}</Text>
                  </View>
                </View>
                <Text style={styles.detailReviewText}>{review.text}</Text>
                {review.imageUrls?.length ? (
                  <View style={styles.detailReviewImageGrid}>
                    {review.imageUrls.map((url, photoIndex) => (
                      <Pressable
                        accessibilityLabel={t('map.detail.imageDetail', {
                          count: photoIndex + 1,
                          name: place.name,
                        })}
                        accessibilityRole="button"
                        key={`${url}-${photoIndex}`}
                        onPress={onOpenImages
                          ? () => onOpenImages(review.imageUrls ?? [], photoIndex)
                          : undefined}
                        style={styles.detailReviewImageCell}
                      >
                        <PreviewArtwork imageUrl={url} />
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <ReviewTags hiddenTags={review.hiddenTags} tags={review.tags} />
              </View>
            )) : (
                <Text style={styles.detailEmptyText}>{t('map.detail.reviewEmpty')}</Text>
              )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default function MapBottomSheet({
  bookmarkPendingPlaceIds = {},
  bookmarkedPlaceIds,
  collapsedTranslateY,
  content,
  couponContent,
  height,
  isBookmarkStateLoading = false,
  mediumTranslateY,
  onBackHome,
  onCreateReservation,
  onDetailPress,
  onHandlePress,
  onOpenLikedPlaces,
  onOpenRecommendations,
  onOpenSavedPlaces,
  onStartVisitVerification,
  onPlacePress,
  onRetryAvailability,
  onRetryMedia,
  onRetryRecommendations,
  onRetryReviews,
  onToggleBookmark,
  panHandlers,
  places,
  previewFallbackContentByPlaceId,
  explorationImageUrlsByPlaceId = {},
  recommendationPlaces,
  recommendationsState,
  selectedPlace,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
  userName,
}: MapBottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<'local' | 'national'>('local');
  const [activeCategory, setActiveCategory] = useState<SheetCategory>('popup');
  const [activePlaceDetailTab, setActivePlaceDetailTab] = useState<PlaceDetailTab>('info');
  const [activePreviewAction, setActivePreviewAction] = useState<PreviewActionKind>('departure');
  const [photoViewer, setPhotoViewer] = useState<{
    imageUrls: string[];
    initialIndex: number;
    placeName: string;
  } | null>(null);
  const reservationNavigationLock = useRef(false);
  const reservationUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setActivePlaceDetailTab('info');
    setActivePreviewAction('departure');
    setPhotoViewer(null);
    reservationNavigationLock.current = false;
    if (reservationUnlockTimer.current) clearTimeout(reservationUnlockTimer.current);
    reservationUnlockTimer.current = null;

    return () => {
      if (reservationUnlockTimer.current) clearTimeout(reservationUnlockTimer.current);
    };
  }, [selectedPlace?.id]);
  const query = content.type === 'search' || content.type === 'results' ? content.query.trim() : '';
  const isSearchMode = content.type === 'search' || content.type === 'results';
  const placesState = places.length > 0 ? 'ready' : 'empty';
  const shownPlaces = useMemo(
    () => (feed === 'local' ? places : [...places].reverse()),
    [feed, places],
  );
  const previewPlaces = useMemo(() => {
    const seenPlaceIds = new Set<number>();

    return [...places, ...recommendationPlaces].filter((place) => {
      if (seenPlaceIds.has(place.id)) return false;
      seenPlaceIds.add(place.id);
      return true;
    });
  }, [places, recommendationPlaces]);
  const { imageUrlsByPlaceId: previewImageUrlsByPlaceId } = usePlacePreviewImages(previewPlaces);
  const imageUrlsByPlaceId = useMemo(() => ({
    ...explorationImageUrlsByPlaceId,
    ...previewImageUrlsByPlaceId,
  }), [explorationImageUrlsByPlaceId, previewImageUrlsByPlaceId]);
  const isExpandedPlaceDetail = content.type === 'place-preview' && snapPoint === 'expanded';
  const handleCreateReservation = () => {
    if (!selectedPlace || !onCreateReservation || reservationNavigationLock.current) return;
    reservationNavigationLock.current = true;
    onCreateReservation(
      selectedPlace,
      previewFallbackContentByPlaceId?.[String(selectedPlace.id)]?.imageUrls[0]
        ?? imageUrlsByPlaceId[String(selectedPlace.id)],
    );
    reservationUnlockTimer.current = setTimeout(() => {
      reservationNavigationLock.current = false;
      reservationUnlockTimer.current = null;
    }, RECOMMENDATION_NAVIGATION_LOCK_MS);
  };
  const contentFadeStart = mediumTranslateY
    + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const contentOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, contentFadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
  const contentTranslateY = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, collapsedTranslateY],
    outputRange: [0, 22],
  });
  const expandedOnlyOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [Math.max(0, mediumTranslateY - 96), mediumTranslateY],
    outputRange: [1, 0],
  });
  // Expanded sheet goes full-bleed: resting gap and bottom corners collapse to 0.
  const chromeGapRange = [0, Math.max(mediumTranslateY, 1)];
  const chromeGap = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_RESTING_GAP],
  });
  const chromeBottomInset = Animated.add(sheetChromeBottom, chromeGap);
  const chromeBottomRadius = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_BOTTOM_RADIUS],
  });

  return (
    <GlassStyles.BottomSheetContainer
      style={{ height, transform: [{ translateY: sheetTranslateY }] }}
    >
      <GlassStyles.SheetChromeShadow
        pointerEvents="none"
        style={[
          {
            borderBottomLeftRadius: isExpandedPlaceDetail ? 0 : SHEET_BOTTOM_RADIUS,
            borderBottomRightRadius: isExpandedPlaceDetail ? 0 : SHEET_BOTTOM_RADIUS,
            borderTopLeftRadius: isExpandedPlaceDetail ? 0 : 34,
            borderTopRightRadius: isExpandedPlaceDetail ? 0 : 34,
            bottom: chromeBottomInset,
            left: chromeGap,
            right: chromeGap,
          },
        ]}
      >
        <GlassStyles.SheetChrome
          $borderColor="transparent"
          style={[
            {
              borderBottomLeftRadius: chromeBottomRadius,
              borderBottomRightRadius: chromeBottomRadius,
              borderTopLeftRadius: isExpandedPlaceDetail ? 0 : 34,
              borderTopRightRadius: isExpandedPlaceDetail ? 0 : 34,
            },
          ]}
        >
          <GlassStyles.SheetGlass
            cornerRadius={isExpandedPlaceDetail ? 0 : 34}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={0.10}
            rimColor="rgba(255,255,255,0.60)"
            tintColor="#FFFFFF"
            topRimOnly
          />
        </GlassStyles.SheetChrome>
      </GlassStyles.SheetChromeShadow>
      <GlassStyles.SheetInner $inset={SHEET_RESTING_GAP}>
      {!isExpandedPlaceDetail ? (
        <View
          {...panHandlers}
          style={styles.handleArea}
          testID="map-sheet-handle-target"
        >
          <Pressable
            accessibilityLabel={t('map.sheet.adjust')}
            accessibilityRole="adjustable"
            onPress={onHandlePress}
            style={styles.handleButton}
          >
            <View pointerEvents="none" style={styles.handle} />
          </Pressable>
        </View>
      ) : null}

      <Animated.View
        {...(snapPoint === 'expanded' ? {} : panHandlers)}
        pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
        style={[
          styles.sheetContent,
          { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
        ]}
        testID="map-sheet-content"
      >
      {content.type === 'place-preview' && selectedPlace ? (
        snapPoint === 'expanded' ? (
          <ExpandedPlaceContent
            activeAction={activePreviewAction}
            activeTab={activePlaceDetailTab}
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            couponContent={couponContent}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onOpenImages={(nextImageUrls, initialIndex) => setPhotoViewer({
              imageUrls: nextImageUrls,
              initialIndex,
              placeName: selectedPlace.name,
            })}
            onReserve={handleCreateReservation}
            onVerify={onStartVisitVerification
              ? () => onStartVisitVerification(selectedPlace)
              : undefined}
            onRetryAvailability={onRetryAvailability}
            onRetryMedia={onRetryMedia}
            onRetryReviews={onRetryReviews}
            onSelectAction={setActivePreviewAction}
            onTabChange={setActivePlaceDetailTab}
            onToggleBookmark={() => void onToggleBookmark(
              selectedPlace,
              !bookmarkedPlaceIds[String(selectedPlace.id)],
            )}
            pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(selectedPlace.id)])}
            place={selectedPlace}
          />
        ) : (
          <PreviewContent
            activeAction={activePreviewAction}
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onDetail={() => onDetailPress(selectedPlace)}
            onOpenImages={(nextImageUrls, initialIndex) => setPhotoViewer({
              imageUrls: nextImageUrls,
              initialIndex,
              placeName: selectedPlace.name,
            })}
            onReserve={handleCreateReservation}
            onVerify={onStartVisitVerification
              ? () => onStartVisitVerification(selectedPlace)
              : undefined}
            onRetryAvailability={onRetryAvailability}
            onRetryMedia={onRetryMedia}
            onSelectAction={setActivePreviewAction}
            onToggleBookmark={() => void onToggleBookmark(
              selectedPlace,
              !bookmarkedPlaceIds[String(selectedPlace.id)],
            )}
            pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(selectedPlace.id)])}
            place={selectedPlace}
          />
        )
      ) : isSearchMode ? (
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsTitleRow}>
            <Text style={styles.resultsTitle}>{query ? t('map.sheet.resultsFor', { query }) : t('map.sheet.aroundMe')}</Text>
            <Text style={styles.resultsCount}>{places.length}</Text>
          </View>
          {places.length > 0 ? places.map((place) => (
            <ResultRow key={place.id} onPress={() => onPlacePress(place)} place={place} />
          )) : <EmptyCard />}
        </ScrollView>
      ) : content.type === 'recommendations' ? (
        <RecommendationContent
          bookmarkedPlaceIds={bookmarkedPlaceIds}
          bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
          expandedInteractionsEnabled={snapPoint === 'expanded'}
          expandedOnlyOpacity={expandedOnlyOpacity}
          imageUrlsByPlaceId={imageUrlsByPlaceId}
          isBookmarkStateLoading={isBookmarkStateLoading}
          onPlacePress={onPlacePress}
          onRetry={onRetryRecommendations}
          onToggleBookmark={onToggleBookmark}
          places={recommendationPlaces}
          state={recommendationsState}
          userName={userName?.trim() || 'user'}
        />
      ) : (
        <ExpandedHomeContent
          activeCategory={activeCategory}
          bookmarkedPlaceIds={bookmarkedPlaceIds}
          bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
          expandedInteractionsEnabled={snapPoint === 'expanded'}
          expandedOnlyOpacity={expandedOnlyOpacity}
          feed={feed}
          imageUrlsByPlaceId={imageUrlsByPlaceId}
          isBookmarkStateLoading={isBookmarkStateLoading}
          onCategoryChange={setActiveCategory}
          onFeedChange={setFeed}
          onPlacePress={onPlacePress}
          onToggleBookmark={onToggleBookmark}
          places={shownPlaces}
          state={placesState}
          userName={userName?.trim() || 'user'}
        />
      )}
      </Animated.View>
      </GlassStyles.SheetInner>

      {content.type !== 'place-preview' ? (
        <MapSheetBottomNavigation
          activeTab={content.type === 'recommendations' ? 'recommendations' : 'map'}
          onOpenFavorites={onOpenLikedPlaces}
          onOpenMap={onBackHome}
          onOpenRecommendations={onOpenRecommendations}
          onOpenReservations={onOpenSavedPlaces}
          sheetTranslateY={sheetTranslateY}
        />
      ) : null}
      <PlacePhotoViewer
        imageUrls={photoViewer?.imageUrls ?? []}
        initialIndex={photoViewer?.initialIndex ?? 0}
        onClose={() => setPhotoViewer(null)}
        placeName={photoViewer?.placeName ?? ''}
        visible={photoViewer !== null}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const absoluteFill = { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 };
const styles: Record<string, object> = {
  artwork: {
    backgroundColor: '#E4E4E6',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  artworkImage: {
    height: '100%',
    width: '100%',
  },
  artworkBlurClip: {
    bottom: 0,
    height: '40%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  artworkBlurImage: {
    bottom: 0,
    height: '250%',
    left: 0,
    position: 'absolute',
    width: '100%',
  },
  artworkFallback: { alignItems: 'center', justifyContent: 'center' },
  artworkFallbackText: { color: '#FF245B', fontSize: 10, fontWeight: '700', marginTop: 5 },
  detailActionRow: { columnGap: 8, paddingBottom: 12, paddingHorizontal: 16 },
  detailAmenityRow: { columnGap: 10, flexDirection: 'row', paddingTop: 16 },
  detailBackText: { color: '#555860', fontSize: 34, fontWeight: '300', lineHeight: 36, marginTop: -4 },
  detailCategory: { color: '#63666E', flexShrink: 0, fontSize: 13, fontWeight: '600', includeFontPadding: false, lineHeight: 18, marginLeft: 4, paddingTop: 4 },
  detailContent: { backgroundColor: '#FFFFFF', paddingBottom: 48 },
  detailCouponBody: { flex: 1 },
  detailCouponIcon: {
    alignItems: 'center',
    backgroundColor: '#FFD9E4',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  detailCouponIconText: { color: '#FF245B', fontSize: 18, fontWeight: '900' },
  detailCouponPeriod: { color: '#8B8E96', fontSize: 10, marginTop: 2 },
  detailCouponRow: {
    alignItems: 'center',
    backgroundColor: '#F7F7F8',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    minHeight: 58,
    paddingHorizontal: 10,
  },
  detailCouponTitle: { color: '#2F3137', fontSize: 12, fontWeight: '700' },
  detailEmptyText: { color: '#8A8D95', fontSize: 12, paddingVertical: 24, textAlign: 'center' },
  detailHeading: { paddingBottom: 12, paddingHorizontal: 16 },
  detailHighlightCount: { color: '#FF245B', fontSize: 11, fontWeight: '700', position: 'absolute', right: 14 },
  detailHighlightCountOnStrong: { color: '#FFFFFF' },
  detailHighlightFill: {
    backgroundColor: '#FFDDE6',
    borderBottomLeftRadius: 9,
    borderTopLeftRadius: 9,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  detailHighlightLabel: { color: '#3B3E45', fontSize: 12, fontWeight: '700' },
  detailHighlightLabelRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingLeft: 14 },
  detailHighlightRow: {
    backgroundColor: '#F7F7F8',
    borderRadius: 9,
    height: 39,
    justifyContent: 'center',
    marginTop: 9,
    overflow: 'hidden',
  },
  detailInfoBlock: { padding: 16 },
  detailInfoRow: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 31 },
  detailInfoText: { color: '#5F636C', flex: 1, fontSize: 14, lineHeight: 21 },
  detailMenuBody: { flex: 1 },
  detailMenuDescription: { color: '#858891', fontSize: 11, marginTop: 4 },
  detailMenuImage: { borderRadius: 10, height: 64, overflow: 'hidden', width: 72 },
  detailMenuName: { color: '#303238', fontSize: 13, fontWeight: '800' },
  detailMenuPrice: { color: '#303238', fontSize: 12, fontWeight: '800', marginTop: 7 },
  detailMenuRow: {
    alignItems: 'center',
    borderBottomColor: '#ECEDEF',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 105,
    paddingVertical: 12,
  },
  detailOperatingNeutral: { color: '#5F636C' },
  detailOperatingPositive: { color: '#168A43' },
  detailOperatingStatus: { fontWeight: '800' },
  detailOperatingWarning: { color: '#A15C00' },
  detailPhoto: { borderRadius: 16, height: 180, overflow: 'hidden', width: 180 },
  detailPhotoPrimary: { width: 242 },
  detailPhotoRow: { columnGap: 10, paddingBottom: 12, paddingHorizontal: 16 },
  detailReviewBody: { flex: 1 },
  detailReviewCount: { color: '#797C84', fontSize: 11, fontWeight: '500' },
  detailReviewItem: {
    borderBottomColor: '#ECEDEF',
    borderBottomWidth: 1,
    paddingVertical: 13,
  },
  detailReviewImageCell: { aspectRatio: 1.15, flex: 1, overflow: 'hidden' },
  detailReviewImageGrid: {
    borderRadius: 12,
    flexDirection: 'row',
    gap: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  detailReviewMeta: { color: '#9A9CA3', fontSize: 9, marginTop: 2 },
  detailReviewPhoto: { borderRadius: 10, height: 124, overflow: 'hidden', width: 124 },
  detailReviewPhotos: { columnGap: 10, paddingTop: 12 },
  detailReviewSection: { borderBottomColor: '#ECEDEF', borderBottomWidth: 1, padding: 16 },
  detailReviewTag: {
    alignItems: 'center',
    backgroundColor: '#F1F2F4',
    borderRadius: 9,
    flexDirection: 'row',
    gap: 4,
    minHeight: 27,
    paddingHorizontal: 9,
  },
  detailReviewTagRow: {
    columnGap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
    rowGap: 6,
  },
  detailReviewTagText: { color: '#555A63', fontSize: 11, fontWeight: '600' },
  detailReviewText: { color: '#30333A', fontSize: 14, lineHeight: 21, marginTop: 10 },
  detailReviewTitle: { color: '#2C2E34', fontSize: 15, fontWeight: '900' },
  detailReviewerAvatar: {
    alignItems: 'center',
    backgroundColor: '#E5E5E7',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  detailReviewerAvatarImage: { borderRadius: 22, height: 44, width: 44 },
  detailReviewerInitial: { color: '#6F727A', fontSize: 13, fontWeight: '800' },
  detailReviewerName: { color: '#202228', fontSize: 15, fontWeight: '700' },
  detailReviewerRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  detailRoundButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    elevation: 2,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#11151B',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 42,
  },
  detailSection: { padding: 16 },
  detailSectionTitle: { color: '#303238', fontSize: 14, fontWeight: '900' },
  detailTab: {
    alignItems: 'center',
    flex: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  detailTabIndicator: {
    backgroundColor: '#FF245B',
    bottom: -1,
    height: 2,
    position: 'absolute',
    width: 40,
  },
  detailTabText: { color: '#6D7078', fontSize: 13, fontWeight: '700' },
  detailTabTextActive: { color: '#FF245B' },
  detailTabs: { borderBottomColor: '#ECEDEF', borderBottomWidth: 1, flexDirection: 'row' },
  detailTitle: { color: '#17191D', flexShrink: 1, fontSize: 22, fontWeight: '900', includeFontPadding: false, lineHeight: 28, minWidth: 0 },
  detailTitleRow: { alignItems: 'flex-start', flexDirection: 'row', minWidth: 0 },
  detailTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  detailVerified: { color: '#777A82', fontSize: 11, marginTop: 4 },
  cardRow: {
    gap: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rowScroll: {
    flexGrow: 0,
  },
  cardScrim: {
    ...absoluteFill,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyCardBody: { color: '#81838C', fontSize: 11, marginTop: 4, textAlign: 'center' },
  emptyCardRow: {
    backgroundColor: '#F6F6F7',
    borderRadius: 16,
    height: 199,
    width: 242,
  },
  emptyCardIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0F4',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
    width: 44,
  },
  emptyCardTitle: { color: '#30323A', fontSize: 14, fontWeight: '800' },
  expandedContent: { paddingBottom: 116 },
  expandedFeaturedRow: {
    gap: 16,
    paddingBottom: 18,
    paddingHorizontal: 8,
    paddingTop: 18,
  },
  expandedScroll: { flex: 1 },
  expandedTitle: {
    color: '#363840',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 27,
    paddingHorizontal: 8,
  },
  expandedTitleAccent: { color: '#FF1956' },
  bookmarkPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: '#FF1956',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    right: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    top: 10,
    zIndex: 3,
  },
  bookmarkPillActive: { backgroundColor: '#FF1956' },
  bookmarkPillText: { color: '#FF1956', fontSize: 12, fontWeight: '900' },
  bookmarkPillTextActive: { color: '#FFFFFF' },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.backgroundNeutral,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  categoryChipActive: {
    backgroundColor: colors.selectedSurface,
    borderColor: colors.selectedBorder,
  },
  categoryChipLabel: { color: colors.textAlternative, fontSize: 14, fontWeight: '700' },
  categoryChipLabelActive: { color: colors.primary },
  categoryRow: {
    gap: 9,
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 14,
  },
  gridArtwork: { height: '100%' },
  gridCard: {
    backgroundColor: '#161616',
    borderRadius: 13,
    height: 172,
    overflow: 'hidden',
    shadowColor: '#12161D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    width: 228,
  },
  gridCardBody: {
    bottom: 0,
    left: 0,
    paddingBottom: 9,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  gridCardDistance: { color: 'rgba(255,255,255,0.9)', flexShrink: 1, fontSize: 9, marginTop: 1, maxWidth: '100%', paddingRight: 24 },
  gridCardName: { color: '#FFFFFF', flexShrink: 1, fontSize: 13, fontWeight: '800', lineHeight: 16, maxWidth: '100%', paddingRight: 24 },
  gridBookmarkStar: { bottom: 7, padding: 4, position: 'absolute', right: 7, zIndex: 3 },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 8,
  },
  homeGridCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    height: 196,
    maxWidth: '48%',
    overflow: 'hidden',
  },
  homeGridCardBody: { bottom: 0, left: 0, paddingBottom: 12, paddingHorizontal: 14, position: 'absolute', right: 0 },
  homeGridCardDistance: { color: 'rgba(255,255,255,0.92)', fontSize: 11, marginTop: 2, paddingRight: 29 },
  homeGridCardName: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', lineHeight: 19, paddingRight: 31 },
  homeBookmarkStar: { bottom: 9, padding: 4, position: 'absolute', right: 10, zIndex: 3 },
  homeTrendCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    height: 199,
    overflow: 'hidden',
    width: 242,
  },
  homeTrendCardBody: { bottom: 0, left: 0, paddingBottom: 13, paddingHorizontal: 14, position: 'absolute', right: 0 },
  homeTrendCardDistance: { color: 'rgba(255,255,255,0.92)', fontSize: 12, marginTop: 2 },
  homeTrendCardName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', paddingRight: 35 },
  handle: { backgroundColor: 'rgba(80,83,91,0.32)', borderRadius: 3, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 20, justifyContent: 'center', zIndex: 4 },
  handleButton: { alignItems: 'center', height: 20, justifyContent: 'center', width: 160 },
  placeCard: {
    backgroundColor: 'transparent',
    height: 206,
    minHeight: 206,
    overflow: 'hidden',
    width: 156,
  },
  placeCardArtwork: {
    backgroundColor: '#161616',
    borderRadius: 13,
    height: 156,
    overflow: 'hidden',
    shadowColor: '#12161D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  placeCardBody: {
    bottom: 0,
    left: 0,
    paddingBottom: 9,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  placeCardDistance: { color: '#7E8088', flexShrink: 1, fontSize: 11, marginTop: 1, maxWidth: '100%' },
  placeCardName: { color: '#FFFFFF', flexShrink: 1, fontSize: 13, fontWeight: '800', lineHeight: 16, maxWidth: '100%', paddingRight: 25 },
  cardBookmarkStar: { bottom: 5, padding: 4, position: 'absolute', right: 5, zIndex: 3 },
  bookmarkPressed: { opacity: 0.64 },
  recommendationContent: { paddingBottom: 108 },
  recommendationCardRow: { gap: 12, paddingBottom: 10, paddingHorizontal: 8, paddingTop: 12 },
  recommendationContext: { color: '#FF1956', fontSize: 10, fontWeight: '700', marginTop: 4 },
  recommendationGridRows: { gap: 12 },
  recommendationGridScroll: { gap: 12, paddingHorizontal: 8 },
  recommendationGridTitle: { color: '#202127', fontSize: 20, fontWeight: '900', marginBottom: 15, marginTop: 2, paddingHorizontal: 8 },
  recommendationHeader: { paddingHorizontal: 8, paddingTop: 5 },
  recommendationReason: { color: '#35363C', flex: 1, flexShrink: 1, fontSize: 11, fontWeight: '600', minWidth: 0 },
  reservationPlaceCard: { height: 214, minHeight: 214, width: 164 },
  reservationPlaceCardArtwork: { borderRadius: 16, height: 164 },
  reservationPlaceCardDistance: { fontSize: 14, marginTop: 1 },
  reservationPlaceCardName: { fontSize: 16, lineHeight: 21, paddingRight: 30 },
  recommendationMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 5, maxWidth: '100%' },
  recommendationState: { alignItems: 'center', minHeight: 160, justifyContent: 'center', paddingHorizontal: 24 },
  recommendationSubtitle: { color: '#73757D', fontSize: 12, marginTop: 5 },
  recommendationTitle: { color: '#202127', fontSize: 20, fontWeight: '900' },
  recommendationTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 16, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8 },
  retryButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  previewActionChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(231,232,236,0.90)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 36,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 12,
  },
  previewActionChipActive: { backgroundColor: '#FFF0F4', borderColor: '#FF5B82' },
  previewActionRow: { columnGap: 7, paddingBottom: 12, paddingHorizontal: 1 },
  previewActionText: { color: '#595C64', fontSize: 12, fontWeight: '700' },
  previewActionTextActive: { color: '#FF245B' },
  previewAddress: { color: '#5D6068', flexShrink: 1, fontSize: 13, fontWeight: '600', includeFontPadding: false, lineHeight: 18, marginTop: 4, minWidth: 0 },
  previewAmenityChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(234,235,238,0.90)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 32,
    paddingHorizontal: 11,
  },
  previewAmenityIcon: {
    alignItems: 'center',
    backgroundColor: '#2398EF',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  previewAmenityIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  previewAmenityRow: { columnGap: 7, flexDirection: 'row', paddingBottom: 10 },
  previewAmenityText: { color: '#5A5D65', fontSize: 12, fontWeight: '600' },
  previewArtwork: { height: '100%', width: '100%' },
  previewArtworkFallback: {
    alignItems: 'center',
    backgroundColor: '#FFF0F4',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  previewArtworkFallbackText: { color: '#FF245B', fontSize: 10, fontWeight: '700', marginTop: 5 },
  previewBookmarkButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    marginRight: 4,
    marginTop: 9,
    width: 44,
  },
  previewCategory: { color: '#575A62', flexShrink: 0, fontSize: 13, fontWeight: '700', includeFontPadding: false, lineHeight: 19, marginLeft: 6 },
  previewCloseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    marginTop: 9,
    width: 44,
  },
  previewCloseText: { color: '#5E616A', fontSize: 25, fontWeight: '300', lineHeight: 29 },
  previewContent: { paddingHorizontal: 16 },
  previewHeader: { alignItems: 'flex-start', flexDirection: 'row', minHeight: 102 },
  previewImagePanel: {
    backgroundColor: '#FFF0F4',
    borderRadius: 17,
    height: 174,
    overflow: 'hidden',
    width: 180,
  },
  previewImageRow: { columnGap: 12, paddingBottom: 110, paddingRight: 16 },
  previewName: { color: '#1B1D22', flexShrink: 1, fontSize: 21, fontWeight: '900', includeFontPadding: false, lineHeight: 27, minWidth: 0 },
  previewParkingIcon: { borderRadius: 5 },
  previewStatus: { color: '#61646C', flexShrink: 1, fontSize: 13, fontWeight: '600' },
  previewStatusEmphasis: { color: '#1CB957', fontWeight: '800' },
  previewStatusRow: { alignItems: 'center', flexDirection: 'row', marginTop: 6 },
  previewSummary: { flex: 1, minWidth: 0, paddingTop: 11 },
  previewTitleRow: { alignItems: 'center', flexDirection: 'row', minWidth: 0, paddingRight: 4 },
  resultAddress: { color: '#7A7D85', fontSize: 11, marginTop: 3 },
  resultDistance: { color: '#686B73', fontSize: 11, fontWeight: '700' },
  resultName: { color: '#272930', fontSize: 14, fontWeight: '800' },
  resultRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 72,
  },
  resultTextBody: { flex: 1 },
  resultThumbnail: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,240,244,0.86)',
    borderRadius: 13,
    height: 64,
    justifyContent: 'center',
    width: 48,
  },
  resultsContent: { paddingBottom: 105, paddingHorizontal: 17 },
  resultsCount: { color: '#FF245B', fontSize: 13, fontWeight: '900' },
  resultsTitle: { color: '#24262C', flex: 1, fontSize: 18, fontWeight: '900' },
  resultsTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingBottom: 8, paddingTop: 6 },
  segment: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentFrost: {
    ...absoluteFill,
    backgroundColor: 'rgba(228,228,230,0.42)',
  },
  segmentLabel: {
    color: '#767680',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  segmentLabelActive: { color: '#FF1956', fontWeight: '700' },
  segmentInset: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  segmentIndicator: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderRadius: 22,
    bottom: 3,
    left: 3,
    position: 'absolute',
    top: 3,
  },
  feedTransition: { width: '100%' },
  segmentOuter: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(228,228,230,0.48)',
    borderColor: 'rgba(255,255,255,0.52)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    overflow: 'hidden',
    padding: 3,
    width: '100%',
  },
  segmentShadow: {
    alignSelf: 'center',
    borderRadius: 24,
    maxWidth: 370,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    width: '100%',
  },
  sheetContent: { flex: 1 },
};
