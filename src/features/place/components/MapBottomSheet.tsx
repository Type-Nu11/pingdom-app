import React, { useEffect, useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  type TextProps,
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
import CheckInAsset from '../../../assets/v2/icons/place/checkin_svg.svg';
import CallAsset from '../../../assets/v2/icons/ion_call.svg';
import CameraAsset from '../../../assets/v2/icons/place/Camera.svg';
import CleanAsset from '../../../assets/v2/icons/place/Clean.svg';
import DeliciousAsset from '../../../assets/v2/icons/place/Delicious.svg';
import DownAsset from '../../../assets/v2/icons/place/Down.svg';
import GroupAsset from '../../../assets/v2/icons/place/Group.svg';
import KindAsset from '../../../assets/v2/icons/place/Kind.svg';
import ParkAsset from '../../../assets/v2/icons/place/Park.svg';
import PinAsset from '../../../assets/v2/icons/place/Pin.svg';
import TicketAsset from '../../../assets/v2/icons/place/Tiket.svg';
import ArtAsset from '../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../assets/v2/icons/place/heritage.svg';
import HotPlaceAsset from '../../../assets/v2/icons/place/hotplace.svg';
import MapAsset from '../../../assets/v2/icons/place/maping_svg.svg';
import MusicAsset from '../../../assets/v2/icons/place/music_svg.svg';
import PlaceRecommendAsset from '../../../assets/v2/icons/place/placerecommend.svg';
import PopupAsset from '../../../assets/v2/icons/place/popup_svg.svg';
import StarAsset from '../../../assets/v2/icons/place/star_svg.svg';
import RecommendationTitleAsset from '../../../assets/v2/icons/place/Subtract.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import GlassSurface from './GlassSurface';
import FrostedSurface from './FrostedSurface';
import * as GlassStyles from '../styles/BottomSheetGlass.styles';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'recommendations' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

export type MapPreviewFallbackContent = {
  amenities: Array<'english' | 'parking'>;
  businessHours?: string;
  coupons?: Array<{ period: string; title: string }>;
  imageUrls: string[];
  menuItems?: Array<{ description: string; name: string; price: string }>;
  phone?: string;
  reviewCount?: number;
  reviewHighlights?: Array<{ count: number; label: string }>;
  reviewParticipantCount?: number;
  reviews?: Array<{
    author: string;
    avatarUrl?: string;
    createdAt: string;
    hiddenTags?: string[];
    photoCount?: number;
    tags: string[];
    text: string;
  }>;
  statusDescription: string;
  statusEmphasis: string;
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

type MapBottomSheetProps = {
  activeFilters: VisitFilter[];
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds?: Record<string, boolean>;
  isBookmarkStateLoading?: boolean;
  collapsedTranslateY: number;
  content: BottomSheetContent;
  height: number;
  mediumTranslateY: number;
  onBackHome: () => void;
  onCouponPress: (place: DecisionPlace) => void;
  onCreateReservation?: (place: DecisionPlace, imageUrl?: string) => void;
  onOpenRecommendations?: () => void;
  onDetailPress: (place: DecisionPlace) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  previewFallbackContentByPlaceId?: Record<string, MapPreviewFallbackContent>;
  feed?: 'local' | 'national';
  onFeedChange?: (feed: 'local' | 'national') => void;
  rankingImageUrlsByPlaceId?: Record<string, string>;
  rankingPlaces?: DecisionPlace[];
  rankingState?: 'empty' | 'error' | 'loading' | 'ready';
  recommendationContext?: string | null;
  recommendationLimitMessage?: string | null;
  recommendationPlaces: DecisionPlace[];
  recommendationsState: 'empty' | 'error' | 'loading' | 'ready';
  onRetryRecommendations: () => void;
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
const CATEGORY_OPTIONS: Array<{ id: SheetCategory; label: string }> = [
  { id: 'popup', label: '팝업' },
  { id: 'music', label: '음악' },
  { id: 'food', label: '음식점' },
  { id: 'fashion', label: '패션' },
  { id: 'beauty', label: '뷰티' },
  { id: 'art', label: '전시' },
  { id: 'cafe', label: '카페' },
  { id: 'heritage', label: '문화재' },
  { id: 'etc', label: '기타' },
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
          <Stop offset="0.48" stopColor="#000000" stopOpacity="0.04" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.88" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#card-scrim)" height="100" width="100" />
    </Svg>
  </View>
);

const RecommendationMetaIcon = ({ label }: { label: string }) => {
  if (label.includes('영어') || label.includes('다국어')) {
    return <GroupAsset height={16} width={16} />;
  }
  if (label.includes('주차')) {
    return (
      <View style={styles.recommendationParkingIcon}>
        <Text style={styles.recommendationParkingText}>P</Text>
      </View>
    );
  }
  return (
    <Svg height={16} viewBox="0 0 18 18" width={16}>
      <Path d="M3 3.5h12v8H8l-3.5 3v-3H3z" fill="#E4E7EC" stroke="#777982" strokeLinejoin="round" />
      <Circle cx="6.5" cy="7.5" fill="#777982" r=".8" />
      <Circle cx="9" cy="7.5" fill="#777982" r=".8" />
      <Circle cx="11.5" cy="7.5" fill="#777982" r=".8" />
    </Svg>
  );
};

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
}) => (
  <View style={styles.segmentInset}>
    <View style={styles.segmentShadow}>
      <GlassSurface
        glassEffectStyle="regular"
        intensity={100}
        style={styles.segmentOuter}
        tintColor="rgba(228,228,230,0.48)"
      >
        <View pointerEvents="none" style={styles.segmentFrost} />
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: feed === 'local' }}
          onPress={() => onChange('local')}
          style={[styles.segment, feed === 'local' && styles.segmentActive]}
        >
          <HotPlaceAsset
            color={feed === 'local' ? '#FF1956' : '#767680'}
            height={20}
            width={16}
          />
          <Text style={[styles.segmentLabel, feed === 'local' && styles.segmentLabelActive]}>
            우리 지역 핫플
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: feed === 'national' }}
          onPress={() => onChange('national')}
          style={[styles.segment, feed === 'national' && styles.segmentActive]}
        >
          <MapAsset
            color={feed === 'national' ? '#FF1956' : '#767680'}
            height={20}
            width={18}
          />
          <Text style={[styles.segmentLabel, feed === 'national' && styles.segmentLabelActive]}>
            전국 트렌드
          </Text>
        </Pressable>
      </GlassSurface>
    </View>
  </View>
);

const HOME_BOOKMARK_STAR_PATH = 'M1.18994 9.91674C0.824483 9.57878 1.023 8.9678 1.51731 8.90919L8.52148 8.07842C8.72295 8.05453 8.89794 7.92802 8.98291 7.7438L11.9372 1.33905C12.1457 0.887041 12.7883 0.886954 12.9967 1.33896L15.951 7.74367C16.036 7.92789 16.2098 8.05474 16.4113 8.07863L23.4159 8.90919C23.9102 8.9678 24.1081 9.57896 23.7427 9.91692L18.5649 14.7061C18.4159 14.8438 18.3496 15.0488 18.3892 15.2478L19.7633 22.1658C19.8603 22.654 19.3407 23.0323 18.9064 22.7892L12.7518 19.3432C12.5748 19.2441 12.3597 19.2446 12.1827 19.3437L6.0275 22.7883C5.59314 23.0314 5.07259 22.654 5.1696 22.1658L6.54399 15.2482C6.58352 15.0493 6.51738 14.8438 6.36843 14.706L1.18994 9.91674Z';

const BookmarkStar = ({
  selected,
  size = 28,
  strokeColor = '#FFFFFF',
}: {
  selected: boolean;
  size?: number;
  strokeColor?: string;
}) => (
  <Svg
    fill="none"
    height={size}
    viewBox="0 0 25 24"
    width={Math.round((size * 25) / 24)}
  >
    <Path
      d={HOME_BOOKMARK_STAR_PATH}
      fill={selected ? '#FF1956' : 'none'}
      stroke={selected ? '#FF1956' : strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </Svg>
);

const formatDistance = (place: DecisionPlace) => {
  if (place.distanceMeters !== undefined) {
    return place.distanceMeters >= 1000
      ? `${(place.distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(place.distanceMeters)}m`;
  }

  return place.distance;
};

const PlaceArtwork = ({
  imageUrl,
  variant = 'trend',
}: {
  imageUrl?: string;
  variant?: 'grid' | 'trend';
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = hasImageError ? '이미지를 불러오지 못했어요' : '이미지 없음';

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

  return (
    <Image
      onError={() => setHasImageError(true)}
      resizeMode="cover"
      source={{ uri: imageUrl }}
      style={[styles.artwork, variant === 'grid' && styles.gridArtwork]}
    />
  );
};

const PreviewArtwork = ({ imageUrl }: { imageUrl?: string }) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = hasImageError ? '이미지를 불러오지 못했어요' : '이미지 없음';

    return (
      <View accessibilityLabel={fallbackMessage} style={styles.previewArtworkFallback}>
        <MapPinIcon active size={28} />
        <Text style={styles.previewArtworkFallbackText}>{fallbackMessage}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel="장소 이미지"
      onError={() => setHasImageError(true)}
      resizeMode="cover"
      source={{ uri: imageUrl }}
      style={styles.previewArtwork}
    />
  );
};

export const RecommendationFeaturedCard = ({
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
}) => (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeCard, pressed && styles.pressed]}
    >
      <View style={styles.placeCardArtwork}>
        <PlaceArtwork imageUrl={imageUrl} />
        <CardScrim />
        <Pressable
          accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onToggleBookmark();
          }}
          style={styles.cardBookmarkStar}
        >
          {pending ? <Text style={styles.bookmarkPending}>…</Text> : (
            <BookmarkStar selected={bookmarked} size={28} />
          )}
        </Pressable>
        <View style={styles.placeCardBody}>
          <Text numberOfLines={2} style={styles.placeCardName}>
            {place.name || '장소명 없음'}
          </Text>
        </View>
      </View>
      {place.recommendationReason ? (
        <View style={styles.recommendationMetaRow}>
          <RecommendationMetaIcon label={place.recommendationReason} />
          <Text numberOfLines={1} style={styles.recommendationReason}>
            {place.recommendationReason}
          </Text>
        </View>
      ) : place.recommendationRank !== undefined || place.recommendationSource ? (
        <Text numberOfLines={1} style={styles.recommendationExplanation}>
          {[
            place.recommendationRank !== undefined ? `추천 순위 ${place.recommendationRank}` : null,
            place.recommendationSource ?? null,
          ].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      <Text numberOfLines={1} style={styles.placeCardDistance}>
        여기서 {formatDistance(place)}
      </Text>
    </Pressable>
);

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
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.gridCard, pressed && styles.pressed]}
    >
      <PlaceArtwork imageUrl={imageUrl} variant="grid" />
      <CardScrim />
      <Pressable
        accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
        accessibilityRole="button"
        accessibilityState={{ busy: pending, disabled: pending }}
        disabled={pending}
        hitSlop={10}
        onPress={(event) => {
          event.stopPropagation();
          onToggleBookmark();
        }}
        style={styles.gridBookmarkStar}
      >
        {pending ? <Text style={styles.bookmarkPending}>…</Text> : (
          <BookmarkStar selected={bookmarked} size={28} />
        )}
      </Pressable>
      <View style={styles.gridCardBody}>
        <Text numberOfLines={2} style={styles.gridCardName}>{place.name}</Text>
        <Text numberOfLines={1} style={styles.gridCardDistance}>{place.address}</Text>
        {place.recommendationReason ? (
          <Text numberOfLines={1} style={styles.gridRecommendationReason}>
            {place.recommendationReason}
          </Text>
        ) : null}
        {place.recommendationRank !== undefined || place.recommendationSource ? (
          <Text numberOfLines={1} style={styles.gridRecommendationExplanation}>
            {[
              place.recommendationRank !== undefined ? `추천 순위 ${place.recommendationRank}` : null,
              place.recommendationSource ?? null,
            ].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>
    </Pressable>
);

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
}) => (
  <Pressable
    accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeTrendCard, pressed && styles.pressed]}
  >
    <PlaceArtwork imageUrl={imageUrl} />
    <CardScrim />
    <Pressable
      accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      {pending ? <Text style={styles.homeBookmarkPending}>…</Text> : (
        <BookmarkStar selected={bookmarked} />
      )}
    </Pressable>
    <View style={styles.homeTrendCardBody}>
      <Text numberOfLines={1} style={styles.homeTrendCardName}>
        {place.name || '장소명 없음'}
      </Text>
      <Text numberOfLines={1} style={styles.homeTrendCardDistance}>
        여기서 {formatDistance(place)}
      </Text>
    </View>
  </Pressable>
);

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
}) => (
  <Pressable
    accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeGridCard, pressed && styles.pressed]}
  >
    <PlaceArtwork imageUrl={imageUrl} variant="grid" />
    <CardScrim />
    <Pressable
      accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      {pending ? <Text style={styles.homeBookmarkPending}>…</Text> : (
        <BookmarkStar selected={bookmarked} />
      )}
    </Pressable>
    <View style={styles.homeGridCardBody}>
      <Text numberOfLines={2} style={styles.homeGridCardName}>{place.name}</Text>
      <Text numberOfLines={1} style={styles.homeGridCardDistance}>여기서 {formatDistance(place)}</Text>
    </View>
  </Pressable>
);

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
  const categoryPlaces = places.filter((place) => placeMatchesCategory(place, activeCategory));
  const gridPlaces = categoryPlaces.length > 0 ? categoryPlaces : places;

  return (
    <ScrollView
      contentContainerStyle={styles.expandedContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.expandedScroll}
    >
      <FeedSegment feed={feed} onChange={onFeedChange} />
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

      <Text style={styles.expandedTitle}>
        카테고리별 <Text style={styles.expandedTitleAccent}>{userName}님</Text> 주변 인기 장소들
      </Text>

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
                {category.label}
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
    </ScrollView>
  );
};

const EMPTY_CARD_COPY: Record<'empty' | 'error' | 'loading', { body: string; title: string }> = {
  empty: { body: '지도를 움직여 다른 지역도 둘러보세요.', title: '표시할 핫플이 아직 없어요' },
  error: { body: '잠시 후 다시 시도해 주세요.', title: '목록을 불러오지 못했어요' },
  loading: { body: '지도를 움직여 다른 지역도 둘러보세요.', title: '주변 핫플을 찾는 중이에요' },
};

const EmptyCard = ({
  state = 'loading',
  variant = 'list',
}: {
  state?: 'empty' | 'error' | 'loading' | 'ready';
  variant?: 'list' | 'row';
}) => {
  const copy = EMPTY_CARD_COPY[state === 'ready' ? 'empty' : state];

  return (
    <View style={[variant === 'row' ? styles.emptyCardRow : styles.placeCard, styles.emptyCard]}>
      <View style={styles.emptyCardIcon}><MapPinIcon active size={24} /></View>
      <Text style={styles.emptyCardTitle}>{copy.title}</Text>
      <Text style={styles.emptyCardBody}>{copy.body}</Text>
    </View>
  );
};

const RecommendationState = ({
  onRetry,
  state,
}: {
  onRetry: () => void;
  state: 'empty' | 'error' | 'loading';
}) => (
  <View accessibilityLiveRegion="polite" style={styles.recommendationState}>
    <Text style={styles.emptyCardTitle}>
      {state === 'loading'
        ? '나만을 위한 추천 장소를 불러오고 있어요'
        : state === 'error'
          ? '추천 장소를 불러오지 못했어요'
          : '현재 조건에 맞는 추천 장소가 없어요'}
    </Text>
    <Text style={styles.emptyCardBody}>
      {state === 'empty'
        ? '위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요.'
        : state === 'error'
          ? '잠시 후 다시 시도해 주세요.'
          : '현재 위치와 여행 맥락을 확인하고 있어요.'}
    </Text>
    {state === 'error' ? (
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </Pressable>
    ) : null}
  </View>
);

const RecommendationContent = ({
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  context,
  imageUrlsByPlaceId,
  isBookmarkStateLoading,
  isExpanded,
  limitMessage,
  onPlacePress,
  onRetry,
  onToggleBookmark,
  places,
  state,
  userName,
}: {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  context?: string | null;
  imageUrlsByPlaceId: Record<string, string>;
  isBookmarkStateLoading: boolean;
  isExpanded: boolean;
  limitMessage?: string | null;
  onPlacePress: (place: DecisionPlace) => void;
  onRetry: () => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  places: DecisionPlace[];
  state: 'empty' | 'error' | 'loading' | 'ready';
  userName: string;
}) => {
  const featuredPlaces = places.slice(0, 3);
  const gridPlaces = places.slice(3);
  const gridRows = [
    gridPlaces.filter((_, index) => index % 2 === 0),
    gridPlaces.filter((_, index) => index % 2 === 1),
  ].filter((row) => row.length > 0);

  return (
    <ScrollView
      contentContainerStyle={isExpanded ? styles.expandedContent : styles.recommendationContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.recommendationHeader}>
        <View style={styles.recommendationTitleRow}>
          <RecommendationTitleAsset height={22} width={22} />
          <Text style={styles.recommendationTitle}>나만을 위한 추천 장소</Text>
        </View>
        <Text numberOfLines={1} style={styles.recommendationSubtitle}>
          핑덤이 {userName}님이 좋아할만한 장소를 추천해드려요!
        </Text>
        {isExpanded && context ? <Text style={styles.recommendationContext}>{context}</Text> : null}
        {isExpanded && limitMessage ? (
          <Text style={styles.recommendationLimit}>{limitMessage}</Text>
        ) : null}
      </View>
      {state === 'ready' ? (
        <>
          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {featuredPlaces.map((place) => (
              <RecommendationFeaturedCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                key={`recommendation-featured-${place.id}`}
                onPress={() => onPlacePress(place)}
                onToggleBookmark={() => void onToggleBookmark(
                  place,
                  !bookmarkedPlaceIds[String(place.id)],
                )}
                pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                place={place}
              />
            ))}
          </ScrollView>
          {isExpanded && gridPlaces.length > 0 ? (
            <>
              <Text style={styles.recommendationGridTitle}>오늘 검증하고 쿠폰 받자!</Text>
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
                        onToggleBookmark={() => void onToggleBookmark(
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
            </>
          ) : null}
        </>
      ) : (
        <RecommendationState onRetry={onRetry} state={state} />
      )}
    </ScrollView>
  );
};

const ResultRow = ({
  onPress,
  place,
}: {
  onPress: () => void;
  place: DecisionPlace;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
    <View style={styles.resultThumbnail}><MapPinIcon active size={25} /></View>
    <View style={styles.resultTextBody}>
      <Text numberOfLines={1} style={styles.resultName}>{place.name}</Text>
      <Text numberOfLines={1} style={styles.resultAddress}>{place.address}</Text>
    </View>
    <Text style={styles.resultDistance}>{formatDistance(place)}</Text>
  </Pressable>
);

const PreviewAmenity = ({ type }: { type: 'english' | 'parking' }) => (
  <View style={styles.previewAmenityChip}>
    {type === 'english'
      ? <GroupAsset height={20} width={20} />
      : <ParkAsset height={20} width={20} />}
    <Text style={styles.previewAmenityText}>{type === 'english' ? '영어응대 가능' : '주차가능'}</Text>
  </View>
);

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
            ? '추가 태그 접기'
            : `숨겨진 태그 ${hiddenTags.length}개 펼치기`}
          accessibilityRole="button"
          onPress={() => setIsExpanded((current) => !current)}
          style={({ pressed }) => [styles.detailReviewTag, pressed && styles.pressed]}
        >
          <Text style={styles.detailReviewTagText}>
            {isExpanded ? '접기' : `+${hiddenTags.length}`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const PreviewActionChip = ({ active = false, label, onPress }: { active?: boolean; label: string; onPress?: () => void }) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole={onPress ? 'button' : undefined}
    onPress={onPress}
    style={[styles.previewActionChip, active && styles.previewActionChipActive]}
  >
    <Text style={[styles.previewActionText, active && styles.previewActionTextActive]}>{label}</Text>
  </Pressable>
);

const PreviewContent = ({
  bookmarked,
  fallbackContent,
  imageUrl,
  onBack,
  onDetail,
  onReserve,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onDetail: () => void;
  onReserve: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const imageUrls = fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl];

  return (
    <View style={styles.previewContent}>
      <View style={styles.previewHeader}>
        <Pressable
          accessibilityLabel={`${place.name} 상세 보기`}
          accessibilityRole="button"
          onPress={onDetail}
          style={styles.previewSummary}
        >
          <View style={styles.previewTitleRow}>
            <Text numberOfLines={1} style={styles.previewName}>{place.name}</Text>
            <Text numberOfLines={1} style={styles.previewCategory}>{place.category}</Text>
          </View>
          {fallbackContent ? (
            <Text numberOfLines={1} style={styles.previewStatus}>
              {fallbackContent.statusDescription}
              <Text style={styles.previewStatusEmphasis}> · {fallbackContent.statusEmphasis}</Text>
            </Text>
          ) : null}
          <Text numberOfLines={1} style={styles.previewAddress}>
            {formatDistance(place)} · {place.address}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          hitSlop={10}
          onPress={onToggleBookmark}
          style={styles.previewBookmarkButton}
        >
          <BookmarkStar selected={bookmarked} size={22} strokeColor="#FF245B" />
        </Pressable>
        <Pressable
          accessibilityLabel="장소 미리보기 닫기"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.previewCloseButton}
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
        <PreviewActionChip active label="출발" />
        <PreviewActionChip label="도착" />
        <PreviewActionChip label="공유" />
        <PreviewActionChip label="예약" onPress={onReserve} />
        <PreviewActionChip label="길찾기" />
      </ScrollView>
      <ScrollView
        contentContainerStyle={styles.previewImageRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {imageUrls.map((url, index) => (
          <Pressable
            accessibilityLabel={`${place.name} 사진 ${index + 1} 상세 보기`}
            accessibilityRole="button"
            key={`${url ?? 'missing'}-${index}`}
            onPress={onDetail}
            style={[styles.previewImagePanel, index === 0 && styles.previewImagePanelPrimary]}
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
  activeTab,
  bookmarked,
  fallbackContent,
  imageUrl,
  onBack,
  onReserve,
  onTabChange,
  onToggleBookmark,
  pending,
  place,
}: {
  activeTab: PlaceDetailTab;
  bookmarked: boolean;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onReserve: () => void;
  onTabChange: (tab: PlaceDetailTab) => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const imageUrls = fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl];

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailTopBar}>
        <Pressable
          accessibilityLabel="지도로 돌아가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.detailRoundButton}
        >
          <Text style={styles.detailBackText}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={bookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
          accessibilityRole="button"
          disabled={pending}
          hitSlop={12}
          onPress={onToggleBookmark}
          style={styles.detailRoundButton}
        >
          <BookmarkStar selected={bookmarked} size={22} strokeColor="#FF245B" />
        </Pressable>
      </View>

      <View style={styles.detailHeading}>
        <View style={styles.detailTitleRow}>
          <Text style={styles.detailTitle}>{place.name}</Text>
          <Text style={styles.detailCategory}>{place.category}</Text>
        </View>
        {fallbackContent ? (
          <Text style={styles.detailVerified}>{fallbackContent.statusDescription}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.detailActionRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip active label="출발" />
        <PreviewActionChip label="도착" />
        <PreviewActionChip label="공유" />
        <PreviewActionChip label="예약" onPress={onReserve} />
        <PreviewActionChip label="길찾기" />
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.detailPhotoRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {imageUrls.map((url, index) => (
          <View
            key={`${url ?? 'missing'}-${index}`}
            style={[styles.detailPhoto, index === 0 && styles.detailPhotoPrimary]}
          >
            <PreviewArtwork imageUrl={url} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.detailTabs}>
        {(['info', 'reviews'] as const).map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[styles.detailTab, activeTab === tab && styles.detailTabActive]}
          >
            <Text style={[styles.detailTabText, activeTab === tab && styles.detailTabTextActive]}>
              {tab === 'info' ? '정보' : '리뷰'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'info' ? (
        <View>
          <View style={styles.detailInfoBlock}>
            <View style={styles.detailInfoRow}>
              <PinAsset height={16} width={14} />
              <Text style={styles.detailInfoText}>{place.address}</Text>
            </View>
            {fallbackContent ? (
              <>
                <View style={styles.detailInfoRow}>
                  <InfoClockIcon />
                  <Text style={styles.detailInfoText}>
                    <Text style={styles.detailOpenText}>{fallbackContent.statusEmphasis}</Text>
                    {fallbackContent.businessHours ? ` · ${fallbackContent.businessHours}` : ''}
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

          {fallbackContent?.coupons?.length ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>쿠폰</Text>
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
          ) : null}

          {fallbackContent?.menuItems?.length ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>메뉴</Text>
              {fallbackContent.menuItems.map((menu, index) => (
                <View key={`${menu.name}-${index}`} style={styles.detailMenuRow}>
                  <View style={styles.detailMenuBody}>
                    <Text style={styles.detailMenuName}>{menu.name}</Text>
                    <Text style={styles.detailMenuDescription}>{menu.description}</Text>
                    <Text style={styles.detailMenuPrice}>{menu.price}</Text>
                  </View>
                  <View style={styles.detailMenuImage}>
                    <PreviewArtwork imageUrl={imageUrls[index % imageUrls.length]} />
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          <View style={styles.detailReviewSection}>
            <Text style={styles.detailReviewTitle}>
              이런 점을 좋아해요!
              {fallbackContent?.reviewParticipantCount ? (
                <Text style={styles.detailReviewCount}> {fallbackContent.reviewParticipantCount}명 참여</Text>
              ) : null}
            </Text>
            {(fallbackContent?.reviewHighlights ?? []).map((highlight, index, items) => {
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

          <View style={styles.detailReviewSection}>
            <Text style={styles.detailSectionTitle}>사진 리뷰</Text>
            <ScrollView contentContainerStyle={styles.detailReviewPhotos} horizontal showsHorizontalScrollIndicator={false}>
              {imageUrls.concat(imageUrls).map((url, index) => (
                <View key={`${url ?? 'missing'}-review-${index}`} style={styles.detailReviewPhoto}>
                  <PreviewArtwork imageUrl={url} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.detailReviewSection}>
            <Text style={styles.detailSectionTitle}>리뷰 {fallbackContent?.reviewCount ?? 0}</Text>
            {fallbackContent?.reviews?.length ? fallbackContent.reviews.map((review, index) => (
              <View key={`${review.author}-${review.createdAt}-${index}`} style={styles.detailReviewItem}>
                <View style={styles.detailReviewerRow}>
                  <ReviewerAvatar name={review.author} url={review.avatarUrl} />
                  <View style={styles.detailReviewBody}>
                    <Text style={styles.detailReviewerName}>{review.author}</Text>
                    <Text style={styles.detailReviewMeta}>{review.createdAt}</Text>
                  </View>
                </View>
                <Text style={styles.detailReviewText}>{review.text}</Text>
                {review.photoCount ? (
                  <View style={styles.detailReviewImageGrid}>
                    {Array.from({ length: review.photoCount }, (_, photoIndex) => (
                      <View key={photoIndex} style={styles.detailReviewImageCell}>
                        <PreviewArtwork imageUrl={imageUrls[photoIndex % imageUrls.length]} />
                      </View>
                    ))}
                  </View>
                ) : null}
                <ReviewTags hiddenTags={review.hiddenTags} tags={review.tags} />
              </View>
            )) : (
                <Text style={styles.detailEmptyText}>등록된 리뷰 정보가 없어요.</Text>
              )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const NavItem = ({
  active = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={styles.navItem}
  >
    <View style={[styles.navItemSurface, active && styles.navItemActive]}>
      <View style={styles.navIcon}>{icon}</View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </View>
  </Pressable>
);

const BottomNavigation = ({
  bottomInset,
  onOpenMap,
  onOpenLikedPlaces,
  onOpenRecommendations,
  onOpenSavedPlaces,
  recommendationsActive,
  sheetTranslateY,
}: {
  bottomInset: number;
  onOpenMap?: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenRecommendations?: () => void;
  onOpenSavedPlaces?: () => void;
  recommendationsActive: boolean;
  sheetTranslateY: Animated.Value;
}) => (
  <Animated.View
    style={[
      styles.navigationRow,
      {
        bottom: Math.max(24, bottomInset + 10),
        transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
      },
    ]}
  >
    <View style={styles.navigationShadow}>
      <FrostedSurface
        cornerRadius={32}
        glassEffectStyle="regular"
        highlightOpacity={0}
        rimColor="rgba(0,0,0,0.06)"
        style={styles.navigationBar}
        tintColor="#FFFFFF"
      >
        <NavItem
          active={!recommendationsActive}
          icon={<MapAsset color={recommendationsActive ? '#56575E' : '#FF1956'} height={22} width={19} />}
          label="지도"
          onPress={recommendationsActive ? onOpenMap : undefined}
        />
        <NavItem
          icon={<StarAsset color="#3B3B40" height={21} width={22} />}
          label="즐겨찾기"
          onPress={onOpenLikedPlaces}
        />
        <NavItem
          icon={<CheckInAsset height={22} width={21} />}
          label="예약"
          onPress={onOpenSavedPlaces}
        />
      </FrostedSurface>
    </View>
    <Pressable
      accessibilityLabel="장소추천"
      accessibilityRole="button"
      accessibilityState={{ selected: recommendationsActive }}
      onPress={onOpenRecommendations}
      style={({ pressed }) => [
        styles.sendButton,
        pressed && styles.pressed,
      ]}
    >
      <FrostedSurface
        cornerRadius={32}
        glassEffectStyle="regular"
        highlightOpacity={0}
        pointerEvents="none"
        rimColor="rgba(0,0,0,0.06)"
        style={styles.sendIconSurface}
        tintColor="#FFFFFF"
      >
        <PlaceRecommendAsset
          color={recommendationsActive ? '#FF1755' : '#3B3B40'}
          height={23}
          width={23}
        />
      </FrostedSurface>
    </Pressable>
  </Animated.View>
);

export default function MapBottomSheet({
  bookmarkPendingPlaceIds = {},
  bookmarkedPlaceIds,
  collapsedTranslateY,
  content,
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
  onPlacePress,
  onRetryRecommendations,
  onToggleBookmark,
  panHandlers,
  places,
  previewFallbackContentByPlaceId,
  recommendationContext,
  recommendationLimitMessage,
  recommendationPlaces,
  recommendationsState,
  selectedPlace,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
  userName,
  feed: controlledFeed,
  onFeedChange,
  rankingImageUrlsByPlaceId,
  rankingPlaces,
  rankingState,
}: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [uncontrolledFeed, setUncontrolledFeed] = useState<'local' | 'national'>('local');
  const feed = controlledFeed ?? uncontrolledFeed;
  const setFeed = (next: 'local' | 'national') => {
    setUncontrolledFeed(next);
    onFeedChange?.(next);
  };
  const [activeCategory, setActiveCategory] = useState<SheetCategory>('popup');
  const [activePlaceDetailTab, setActivePlaceDetailTab] = useState<PlaceDetailTab>('info');
  useEffect(() => {
    setActivePlaceDetailTab('info');
  }, [selectedPlace?.id]);
  const query = content.type === 'search' || content.type === 'results' ? content.query.trim() : '';
  const isSearchMode = content.type === 'search' || content.type === 'results';
  // 서버 랭킹이 붙어 있으면 그대로 쓰고, 없을 때만 기존 목록으로 대체한다.
  const fallbackPlaces = feed === 'local' ? places : [...places].reverse();
  const hasRankingPlaces = Boolean(rankingPlaces?.length);
  const shownPlaces = hasRankingPlaces ? rankingPlaces! : fallbackPlaces;
  const shownPlacesState = hasRankingPlaces || fallbackPlaces.length > 0
    ? 'ready'
    : rankingState;
  const previewPlaces = [...places, ...recommendationPlaces, ...(rankingPlaces ?? [])]
    .filter((place, index, items) => items.findIndex((item) => item.id === place.id) === index);
  const { imageUrlsByPlaceId: previewImageUrlsByPlaceId } = usePlacePreviewImages(previewPlaces);
  const imageUrlsByPlaceId = {
    ...previewImageUrlsByPlaceId,
    ...(rankingImageUrlsByPlaceId ?? {}),
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
            },
          ]}
        >
          <GlassStyles.SheetGlass
            cornerRadius={34}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={0.10}
            rimColor="rgba(255,255,255,0.60)"
            tintColor="rgba(255,255,255,0.92)"
            topRimOnly
          />
        </GlassStyles.SheetChrome>
      </GlassStyles.SheetChromeShadow>
      <GlassStyles.SheetInner $inset={SHEET_RESTING_GAP}>
      <View style={styles.handleArea} {...panHandlers}>
        <Pressable
          accessibilityLabel="추천 패널 크기 조절"
          accessibilityRole="adjustable"
          onPress={onHandlePress}
          style={styles.handleButton}
        >
          <View style={styles.handle} />
        </Pressable>
      </View>

      <Animated.View
        pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
        style={[
          styles.sheetContent,
          { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
        ]}
      >
      {content.type === 'place-preview' && selectedPlace ? (
        snapPoint === 'expanded' ? (
          <ExpandedPlaceContent
            activeTab={activePlaceDetailTab}
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onReserve={() => onCreateReservation?.(
              selectedPlace,
              previewFallbackContentByPlaceId?.[String(selectedPlace.id)]?.imageUrls[0]
                ?? imageUrlsByPlaceId[String(selectedPlace.id)],
            )}
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
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onDetail={() => onDetailPress(selectedPlace)}
            onReserve={() => onCreateReservation?.(
              selectedPlace,
              previewFallbackContentByPlaceId?.[String(selectedPlace.id)]?.imageUrls[0]
                ?? imageUrlsByPlaceId[String(selectedPlace.id)],
            )}
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
            <Text style={styles.resultsTitle}>{query ? `“${query}” 검색 결과` : '내 주변 장소'}</Text>
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
          context={recommendationContext}
          imageUrlsByPlaceId={imageUrlsByPlaceId}
          isExpanded={snapPoint === 'expanded'}
          isBookmarkStateLoading={isBookmarkStateLoading}
          limitMessage={recommendationLimitMessage}
          onPlacePress={onPlacePress}
          onRetry={onRetryRecommendations}
          onToggleBookmark={onToggleBookmark}
          places={recommendationPlaces}
          state={recommendationsState}
          userName={userName?.trim() || 'user'}
        />
      ) : snapPoint === 'expanded' ? (
        <ExpandedHomeContent
          activeCategory={activeCategory}
          bookmarkedPlaceIds={bookmarkedPlaceIds}
          bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
          feed={feed}
          imageUrlsByPlaceId={imageUrlsByPlaceId}
          isBookmarkStateLoading={isBookmarkStateLoading}
          onCategoryChange={setActiveCategory}
          onFeedChange={setFeed}
          onPlacePress={onPlacePress}
          onToggleBookmark={onToggleBookmark}
          places={shownPlaces}
          state={shownPlacesState}
          userName={userName?.trim() || 'user'}
        />
      ) : (
        <>
          <FeedSegment feed={feed} onChange={setFeed} />
          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rowScroll}
          >
            {shownPlaces.length > 0 ? shownPlaces.slice(0, 6).map((place) => (
              <PlaceTrendCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                key={place.id}
                onPress={() => onPlacePress(place)}
                onToggleBookmark={() => void onToggleBookmark(
                  place,
                  !bookmarkedPlaceIds[String(place.id)],
                )}
                pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                place={place}
              />
            )) : <EmptyCard state={shownPlacesState} variant="row" />}
          </ScrollView>
        </>
      )}
      </Animated.View>
      </GlassStyles.SheetInner>

      {content.type !== 'place-preview' ? (
        <BottomNavigation
          bottomInset={insets.bottom}
          onOpenMap={onBackHome}
          onOpenLikedPlaces={onOpenLikedPlaces}
          onOpenRecommendations={onOpenRecommendations}
          onOpenSavedPlaces={onOpenSavedPlaces}
          recommendationsActive={content.type === 'recommendations'}
          sheetTranslateY={sheetTranslateY}
        />
      ) : null}
    </GlassStyles.BottomSheetContainer>
  );
}

const styles = StyleSheet.create({
  artwork: {
    backgroundColor: '#E4E4E6',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  artworkFallback: { alignItems: 'center', justifyContent: 'center' },
  artworkFallbackText: { color: '#FF245B', fontSize: 10, fontWeight: '700', marginTop: 5 },
  detailActionRow: { columnGap: 8, paddingBottom: 12, paddingHorizontal: 16 },
  detailAmenityRow: { columnGap: 10, flexDirection: 'row', paddingTop: 16 },
  detailBackText: { color: '#555860', fontSize: 34, fontWeight: '300', lineHeight: 36, marginTop: -4 },
  detailCategory: { color: '#63666E', fontSize: 13, fontWeight: '600', marginLeft: 4, paddingTop: 5 },
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
  detailInfoBlock: { borderBottomColor: '#ECEDEF', borderBottomWidth: 1, padding: 16 },
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
  detailOpenText: { color: '#23B95B', fontWeight: '800' },
  detailPhoto: { borderRadius: 11, height: 129, overflow: 'hidden', width: 118 },
  detailPhotoPrimary: { width: 250 },
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
  detailSection: { borderBottomColor: '#ECEDEF', borderBottomWidth: 1, padding: 16 },
  detailSectionTitle: { color: '#303238', fontSize: 14, fontWeight: '900' },
  detailTab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  detailTabActive: { borderBottomColor: '#FF245B' },
  detailTabText: { color: '#6D7078', fontSize: 13, fontWeight: '700' },
  detailTabTextActive: { color: '#FF245B' },
  detailTabs: { borderBottomColor: '#ECEDEF', borderBottomWidth: 1, flexDirection: 'row' },
  detailTitle: { color: '#17191D', fontSize: 22, fontWeight: '900' },
  detailTitleRow: { alignItems: 'flex-start', flexDirection: 'row' },
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
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 15,
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: '#FF1956',
  },
  categoryChipLabel: { color: '#5E5E66', fontSize: 14, fontWeight: '700' },
  categoryChipLabelActive: { color: '#FF1956' },
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
    height: 184,
    overflow: 'hidden',
    shadowColor: '#12161D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    width: 244,
  },
  gridCardBody: {
    bottom: 0,
    left: 0,
    paddingBottom: 9,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  gridCardDistance: { color: 'rgba(255,255,255,0.9)', fontSize: 9, marginTop: 1, paddingRight: 24 },
  gridCardName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', lineHeight: 16, paddingRight: 24 },
  gridBookmarkStar: { bottom: 7, padding: 4, position: 'absolute', right: 7, zIndex: 3 },
  bookmarkPending: { color: '#FFFFFF', fontSize: 24, lineHeight: 28 },
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
  homeBookmarkPending: { color: '#FFFFFF', fontSize: 24, lineHeight: 35 },
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
  handle: { backgroundColor: 'rgba(80,83,91,0.26)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  navIcon: { alignItems: 'center', height: 24, justifyContent: 'center' },
  navItem: {
    alignItems: 'center',
    gap: 3,
    flex: 1,
    justifyContent: 'center',
  },
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 3, height: 54, justifyContent: 'center', width: 80 },
  navItemActive: {
    backgroundColor: '#F7F7F8',
  },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600', letterSpacing: -0.2 },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: {
    borderRadius: 32,
    flex: 1,
    flexDirection: 'row',
    gap: 0,
    height: 64,
    overflow: 'hidden',
    padding: 5,
  },
  navigationRow: {
    bottom: 12,
    flexDirection: 'row',
    gap: 12,
    left: 24,
    position: 'absolute',
    right: 24,
  },
  navigationShadow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    elevation: 4,
    flex: 1,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  placeCard: {
    backgroundColor: 'transparent',
    minHeight: 222,
    width: 172,
  },
  placeCardArtwork: {
    backgroundColor: '#161616',
    borderRadius: 13,
    height: 172,
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
  placeCardDistance: { color: '#7E8088', fontSize: 11, marginTop: 1 },
  placeCardName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', lineHeight: 16, paddingRight: 25 },
  cardBookmarkStar: { bottom: 5, padding: 4, position: 'absolute', right: 5, zIndex: 3 },
  recommendationContent: { paddingBottom: 108 },
  recommendationContext: { color: '#FF1956', fontSize: 10, fontWeight: '700', marginTop: 4 },
  recommendationGridRows: { gap: 12 },
  recommendationGridScroll: { gap: 12, paddingHorizontal: 16 },
  recommendationGridTitle: { color: '#202127', fontSize: 20, fontWeight: '900', marginBottom: 15, marginTop: 2, paddingHorizontal: 16 },
  recommendationHeader: { paddingHorizontal: 16, paddingTop: 5 },
  recommendationLimit: { color: '#777A83', fontSize: 10, marginTop: 3 },
  recommendationReason: { color: '#35363C', flexShrink: 1, fontSize: 11, fontWeight: '600' },
  recommendationMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginTop: 5 },
  recommendationParkingIcon: { alignItems: 'center', backgroundColor: '#2489F5', borderRadius: 4, height: 16, justifyContent: 'center', width: 16 },
  recommendationParkingText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', lineHeight: 14 },
  recommendationExplanation: { color: '#55575F', fontSize: 10, fontWeight: '600', marginTop: 7 },
  recommendationState: { alignItems: 'center', minHeight: 160, justifyContent: 'center', paddingHorizontal: 24 },
  recommendationSubtitle: { color: '#73757D', fontSize: 12, marginTop: 5 },
  recommendationTitle: { color: '#202127', fontSize: 20, fontWeight: '900' },
  recommendationTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  gridRecommendationReason: { color: '#FFB2C8', fontSize: 9, fontWeight: '700', marginTop: 3, paddingRight: 29 },
  gridRecommendationExplanation: { color: 'rgba(255,255,255,0.78)', fontSize: 8, marginTop: 2, paddingRight: 29 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 16, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8 },
  retryButtonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  previewActionChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(231,232,236,0.90)',
    borderRadius: 20,
    borderWidth: 1,
    height: 39,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 15,
  },
  previewActionChipActive: { borderColor: '#FF245B' },
  previewActionRow: { columnGap: 8, paddingBottom: 12, paddingHorizontal: 1 },
  previewActionText: { color: '#595C64', fontSize: 12, fontWeight: '700' },
  previewActionTextActive: { color: '#FF245B' },
  previewAddress: { color: '#5D6068', fontSize: 13, fontWeight: '600', marginTop: 4 },
  previewAmenityChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(234,235,238,0.90)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    paddingHorizontal: 13,
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
  previewAmenityRow: { columnGap: 8, flexDirection: 'row', paddingBottom: 11 },
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
    height: 36,
    justifyContent: 'center',
    marginRight: 4,
    marginTop: 13,
    width: 36,
  },
  previewCategory: { color: '#575A62', fontSize: 13, fontWeight: '700', marginLeft: 4, paddingTop: 4 },
  previewCloseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    height: 32,
    justifyContent: 'center',
    marginTop: 15,
    width: 32,
  },
  previewCloseText: { color: '#5E616A', fontSize: 25, fontWeight: '300', lineHeight: 29 },
  previewContent: { paddingHorizontal: 16 },
  previewHeader: { alignItems: 'flex-start', flexDirection: 'row', minHeight: 102 },
  previewImagePanel: {
    backgroundColor: '#FFF0F4',
    borderRadius: 17,
    height: 174,
    overflow: 'hidden',
    width: 120,
  },
  previewImagePanelPrimary: { width: 248 },
  previewImageRow: { columnGap: 12, paddingBottom: 110, paddingRight: 16 },
  previewName: { color: '#1B1D22', fontSize: 21, fontWeight: '900' },
  previewParkingIcon: { borderRadius: 5 },
  previewStatus: { color: '#61646C', fontSize: 13, fontWeight: '600', marginTop: 6 },
  previewStatusEmphasis: { color: '#1CB957', fontWeight: '800' },
  previewSummary: { flex: 1, paddingTop: 11 },
  previewTitleRow: { alignItems: 'flex-start', flexDirection: 'row', paddingRight: 4 },
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
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  segmentFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(228,228,230,0.42)',
  },
  segmentLabel: {
    color: '#767680',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  segmentLabelActive: { color: '#FF1956', fontWeight: '700' },
  segmentInset: { paddingHorizontal: 16 },
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
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    elevation: 4,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: 64,
  },
  sendIconSurface: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  sheetContent: { flex: 1 },
});
