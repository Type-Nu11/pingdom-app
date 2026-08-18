import React, { useEffect, useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import ArtAsset from '../../../assets/v2icon/art_svg.svg';
import FashionAsset from '../../../assets/v2icon/fashion_svg.svg';
import FoodAsset from '../../../assets/v2icon/food_svg.svg';
import HotPlaceAsset from '../../../assets/v2icon/hotplace.svg';
import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import MusicAsset from '../../../assets/v2icon/music_svg.svg';
import PlaceRecommendAsset from '../../../assets/v2icon/placerecommend.svg';
import PopupAsset from '../../../assets/v2icon/popup_svg.svg';
import StarAsset from '../../../assets/v2icon/star_svg.svg';
import RecommendationTitleAsset from '../../../assets/v2icon/Subtract.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import GlassSurface, { supportsNativeLiquidGlass } from './GlassSurface';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'recommendations' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

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

type SheetCategory = 'art' | 'fashion' | 'food' | 'music' | 'popup';

// Gap between the sheet chrome and the screen edges at rest; collapses to 0 when expanded.
const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;
const LIQUID_GLASS_AVAILABLE = supportsNativeLiquidGlass();

const CATEGORY_OPTIONS: Array<{ id: SheetCategory; label: string }> = [
  { id: 'popup', label: '팝업' },
  { id: 'music', label: '음악' },
  { id: 'food', label: '음식점' },
  { id: 'fashion', label: '패션' },
  { id: 'art', label: '전시' },
];

const MapPinIcon = ({ active = false, size = 24 }: IconProps) => (
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
  }
};

const FeedSegment = ({
  feed,
  onChange,
}: {
  feed: 'local' | 'national';
  onChange: (feed: 'local' | 'national') => void;
}) => (
  <View style={styles.segmentShadow}>
    <GlassSurface
      androidBlurEnabled={false}
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
);

const CARD_FALLBACKS = [
  '오아시스 팝업 스토어',
  '성수 스튜디오 마켓',
  '레이어드 커피 랩',
  '커먼 테이블 성수',
];

const HOME_BOOKMARK_STAR_PATH = 'M1.18994 9.91674C0.824483 9.57878 1.023 8.9678 1.51731 8.90919L8.52148 8.07842C8.72295 8.05453 8.89794 7.92802 8.98291 7.7438L11.9372 1.33905C12.1457 0.887041 12.7883 0.886954 12.9967 1.33896L15.951 7.74367C16.036 7.92789 16.2098 8.05474 16.4113 8.07863L23.4159 8.90919C23.9102 8.9678 24.1081 9.57896 23.7427 9.91692L18.5649 14.7061C18.4159 14.8438 18.3496 15.0488 18.3892 15.2478L19.7633 22.1658C19.8603 22.654 19.3407 23.0323 18.9064 22.7892L12.7518 19.3432C12.5748 19.2441 12.3597 19.2446 12.1827 19.3437L6.0275 22.7883C5.59314 23.0314 5.07259 22.654 5.1696 22.1658L6.54399 15.2482C6.58352 15.0493 6.51738 14.8438 6.36843 14.706L1.18994 9.91674Z';

const HomeBookmarkStar = ({ selected }: { selected: boolean }) => (
  <Svg fill="none" height={35} viewBox="0 0 25 24" width={36}>
    <Path
      d={HOME_BOOKMARK_STAR_PATH}
      fill={selected ? '#FF1956' : 'none'}
      stroke={selected ? '#FF1956' : '#FFFFFF'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </Svg>
);

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/520x280.png';

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

  const sourceUrl = imageUrl && !hasImageError ? imageUrl : PLACEHOLDER_IMAGE_URL;

  return (
    <Image
      onError={() => {
        if (sourceUrl !== PLACEHOLDER_IMAGE_URL) setHasImageError(true);
      }}
      resizeMode="cover"
      source={{ uri: sourceUrl }}
      style={[styles.artwork, variant === 'grid' && styles.gridArtwork]}
    />
  );
};

const RecommendationFeaturedCard = ({
  bookmarked,
  imageUrl,
  index,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  index: number;
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
          <Text style={styles.cardBookmarkStarText}>
            {pending ? '…' : bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
        <View style={styles.placeCardBody}>
          <Text numberOfLines={2} style={styles.placeCardName}>
            {place.name || CARD_FALLBACKS[index % CARD_FALLBACKS.length]}
          </Text>
        </View>
      </View>
      {place.recommendationReason ? (
        <Text numberOfLines={1} style={styles.recommendationReason}>
          {place.recommendationReason}
        </Text>
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
        <Text style={styles.gridBookmarkStarText}>
          {pending ? '…' : bookmarked ? '★' : '☆'}
        </Text>
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
  index,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  index: number;
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
        <HomeBookmarkStar selected={bookmarked} />
      )}
    </Pressable>
    <View style={styles.homeTrendCardBody}>
      <Text numberOfLines={1} style={styles.homeTrendCardName}>
        {place.name || CARD_FALLBACKS[index % CARD_FALLBACKS.length]}
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
        <HomeBookmarkStar selected={bookmarked} />
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
    fashion: ['fashion', '패션'],
    food: ['cafe', 'dining', 'food', 'restaurant', '음식', '카페'],
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
      >
        {places.length > 0 ? places.slice(0, 6).map((place, index) => (
          <PlaceTrendCard
            bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
            imageUrl={imageUrlsByPlaceId[String(place.id)]}
            index={index}
            key={`featured-${place.id}`}
            onPress={() => onPlacePress(place)}
            onToggleBookmark={() => void onToggleBookmark(
              place,
              !bookmarkedPlaceIds[String(place.id)],
            )}
            pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
            place={place}
          />
        )) : <EmptyCard />}
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

const EmptyCard = () => (
  <View style={[styles.placeCard, styles.emptyCard]}>
    <View style={styles.emptyCardIcon}><MapPinIcon active size={24} /></View>
    <Text style={styles.emptyCardTitle}>주변 핫플을 찾는 중이에요</Text>
    <Text style={styles.emptyCardBody}>지도를 움직여 다른 지역도 둘러보세요.</Text>
  </View>
);

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
        {context ? <Text style={styles.recommendationContext}>{context}</Text> : null}
        {limitMessage ? <Text style={styles.recommendationLimit}>{limitMessage}</Text> : null}
      </View>
      {state === 'ready' ? (
        <>
          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
          >
            {featuredPlaces.map((place, index) => (
              <RecommendationFeaturedCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                index={index}
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
              <ScrollView
                contentContainerStyle={styles.recommendationGridScroll}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.recommendationGrid}>
                  {gridPlaces.map((place) => (
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
                </View>
              </ScrollView>
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

const PreviewContent = ({
  bookmarked,
  imageUrl,
  onBack,
  onDetail,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onBack: () => void;
  onDetail: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => (
  <View style={styles.previewContent}>
    <Pressable onPress={onBack} style={styles.previewBack}>
      <Text style={styles.previewBackText}>‹  주변 핫플로 돌아가기</Text>
    </Pressable>
    <Pressable onPress={onDetail} style={({ pressed }) => [styles.previewPanel, pressed && styles.pressed]}>
      <PlaceArtwork imageUrl={imageUrl} />
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
        style={[styles.bookmarkPill, bookmarked && styles.bookmarkPillActive]}
      >
        <Text style={[styles.bookmarkPillText, bookmarked && styles.bookmarkPillTextActive]}>
          {pending ? '처리 중…' : bookmarked ? '★ 저장됨' : '☆ 저장'}
        </Text>
      </Pressable>
      <View style={styles.previewBody}>
        <Text style={styles.previewName}>{place.name}</Text>
        <Text numberOfLines={2} style={styles.previewAddress}>{place.address}</Text>
        <View style={styles.previewMeta}>
          <Text style={styles.previewDistance}>여기서 {formatDistance(place)}</Text>
          <Text style={styles.previewMore}>상세보기  ›</Text>
        </View>
      </View>
    </Pressable>
  </View>
);

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
    style={[styles.navItem, active && styles.navItemActive]}
  >
    <View style={styles.navIcon}>{icon}</View>
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
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
        bottom: Math.max(20, bottomInset + 8),
        transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
      },
    ]}
  >
    <View style={styles.navigationShadow}>
      {LIQUID_GLASS_AVAILABLE ? <GlassSurface
        glassEffectStyle="regular"
        intensity={96}
        style={styles.navigationBar}
        tintColor="rgba(238,238,242,0.42)"
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
      </GlassSurface> : <View style={[styles.navigationBar, styles.navigationBarSolid]}>
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
      </View>}
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
      {LIQUID_GLASS_AVAILABLE ? <GlassSurface
        glassEffectStyle="regular"
        intensity={96}
        pointerEvents="none"
        style={styles.sendIconSurface}
        tintColor="rgba(238,238,242,0.42)"
      >
        <PlaceRecommendAsset
          color={recommendationsActive ? '#FF1755' : '#3B3B40'}
          height={23}
          width={23}
        />
      </GlassSurface> : <View
        pointerEvents="none"
        style={[
          styles.sendIconSurface,
          styles.sendIconSurfaceSolid,
        ]}
      >
        <PlaceRecommendAsset
          color={recommendationsActive ? '#FF1755' : '#3B3B40'}
          height={23}
          width={23}
        />
      </View>}
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
  recommendationContext,
  recommendationLimitMessage,
  recommendationPlaces,
  recommendationsState,
  selectedPlace,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
  userName,
}: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<'local' | 'national'>('local');
  const [activeCategory, setActiveCategory] = useState<SheetCategory>('popup');
  const query = content.type === 'search' || content.type === 'results' ? content.query.trim() : '';
  const isSearchMode = content.type === 'search' || content.type === 'results';
  const shownPlaces = feed === 'local' ? places : [...places].reverse();
  const previewPlaces = [...places, ...recommendationPlaces]
    .filter((place, index, items) => items.findIndex((item) => item.id === place.id) === index);
  const { imageUrlsByPlaceId } = usePlacePreviewImages(previewPlaces);
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
    <Animated.View
      style={[styles.bottomSheet, { height, transform: [{ translateY: sheetTranslateY }] }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sheetChromeShadow,
          {
            bottom: chromeBottomInset,
            left: chromeGap,
            right: chromeGap,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.sheetChrome,
            {
              borderBottomLeftRadius: chromeBottomRadius,
              borderBottomRightRadius: chromeBottomRadius,
            },
          ]}
        >
          <GlassSurface
            glassEffectStyle="regular"
            intensity={100}
            style={styles.sheetGlass}
            tintColor="rgba(248,248,248,0.20)"
          />
          <View style={styles.sheetTint} />
        </Animated.View>
      </Animated.View>
      <View style={styles.sheetInner}>
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
        <PreviewContent
          bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
          imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
          onBack={onBackHome}
          onDetail={() => onDetailPress(selectedPlace)}
          onToggleBookmark={() => void onToggleBookmark(
            selectedPlace,
            !bookmarkedPlaceIds[String(selectedPlace.id)],
          )}
          pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(selectedPlace.id)])}
          place={selectedPlace}
        />
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
          userName={userName?.trim() || 'user'}
        />
      ) : (
        <>
          <FeedSegment feed={feed} onChange={setFeed} />
          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {shownPlaces.length > 0 ? shownPlaces.slice(0, 6).map((place, index) => (
              <PlaceTrendCard
                bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                index={index}
                key={place.id}
                onPress={() => onPlacePress(place)}
                onToggleBookmark={() => void onToggleBookmark(
                  place,
                  !bookmarkedPlaceIds[String(place.id)],
                )}
                pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
                place={place}
              />
            )) : <EmptyCard />}
          </ScrollView>
        </>
      )}
      </Animated.View>
      </View>

      <BottomNavigation
        bottomInset={insets.bottom}
        onOpenMap={onBackHome}
        onOpenLikedPlaces={onOpenLikedPlaces}
        onOpenRecommendations={onOpenRecommendations}
        onOpenSavedPlaces={onOpenSavedPlaces}
        recommendationsActive={content.type === 'recommendations'}
        sheetTranslateY={sheetTranslateY}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    backgroundColor: '#E4E4E6',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  bottomSheet: {
    bottom: 0,
    left: 0,
    overflow: 'visible',
    position: 'absolute',
    right: 0,
    zIndex: 50,
  },
  sheetChrome: {
    backgroundColor: 'rgba(248,248,248,0.64)',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 36,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  sheetChromeShadow: {
    backgroundColor: 'rgba(244,246,248,0.08)',
    borderRadius: 36,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    elevation: 22,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: '#10141A',
    shadowOffset: { width: 0, height: -7 },
    shadowOpacity: 0.17,
    shadowRadius: 24,
    top: 0,
  },
  cardRow: {
    gap: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  gridBookmarkStarText: { color: '#FF1755', fontSize: 28, lineHeight: 30 },
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
    borderRadius: 27,
    flex: 1,
    gap: 3,
    height: 54,
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600', letterSpacing: -0.2 },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: {
    backgroundColor: 'rgba(238,238,242,0.34)',
    borderColor: 'rgba(255,255,255,0.68)',
    borderRadius: 32,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 0,
    height: 64,
    overflow: 'hidden',
    padding: 5,
  },
  navigationBarSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  navigationRow: {
    bottom: 12,
    flexDirection: 'row',
    gap: 12,
    left: 24,
    position: 'absolute',
    right: 24,
  },
  navigationShadow: {
    backgroundColor: 'rgba(238,238,242,0.12)',
    borderRadius: 32,
    elevation: 2,
    flex: 1,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
  cardBookmarkStarText: { color: '#FF1755', fontSize: 28, lineHeight: 30 },
  recommendationContent: { paddingBottom: 108 },
  recommendationContext: { color: '#FF1956', fontSize: 10, fontWeight: '700', marginTop: 4 },
  recommendationGrid: { flexDirection: 'column', flexWrap: 'wrap', gap: 12, height: 380 },
  recommendationGridScroll: { paddingBottom: 12, paddingHorizontal: 16 },
  recommendationGridTitle: { color: '#202127', fontSize: 20, fontWeight: '900', marginBottom: 15, marginTop: 2, paddingHorizontal: 16 },
  recommendationHeader: { paddingHorizontal: 16, paddingTop: 5 },
  recommendationLimit: { color: '#777A83', fontSize: 10, marginTop: 3 },
  recommendationReason: { color: '#35363C', fontSize: 11, fontWeight: '600', marginTop: 7 },
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
  previewAddress: { color: '#747780', fontSize: 12, marginTop: 4 },
  previewBack: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  previewBackText: { color: '#5E616A', fontSize: 12, fontWeight: '700' },
  previewBody: { padding: 14 },
  previewContent: { paddingHorizontal: 16 },
  previewDistance: { color: '#6D7079', fontSize: 12 },
  previewMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  previewMore: { color: '#FF245B', fontSize: 12, fontWeight: '800' },
  previewName: { color: '#22242A', fontSize: 18, fontWeight: '900' },
  previewPanel: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    overflow: 'hidden',
  },
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
    backgroundColor: 'rgba(238,238,242,0.12)',
    borderRadius: 32,
    elevation: 2,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    width: 64,
  },
  sendIconSurface: {
    alignItems: 'center',
    backgroundColor: 'rgba(238,238,242,0.34)',
    borderColor: 'rgba(255,255,255,0.68)',
    borderRadius: 32,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  sendIconSurfaceSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  sheetGlass: {
    // Bottom corners are clipped by the animated sheetChrome, so the blur layer stays square there.
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  sheetContent: { flex: 1 },
  // Content keeps a constant inset so dragging never re-lays out the card lists.
  sheetInner: { flex: 1, paddingHorizontal: SHEET_RESTING_GAP },
  sheetTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,248,248,0.92)',
  },
});
