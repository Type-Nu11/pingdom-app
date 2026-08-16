import React, { useEffect, useMemo, useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArtAsset from '../../../assets/v2icon/art_svg.svg';
import BeautyAsset from '../../../assets/v2icon/beati_svg.svg';
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import FashionAsset from '../../../assets/v2icon/fashion_svg.svg';
import FoodAsset from '../../../assets/v2icon/food_svg.svg';
import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import MusicAsset from '../../../assets/v2icon/music_svg.svg';
import MyPlaceAsset from '../../../assets/v2icon/my_place.svg';
import PlaceRecommendAsset from '../../../assets/v2icon/placerecommend.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import type { DecisionPlace } from './MapBottomSheet';
import GlassSurface, { supportsNativeLiquidGlass } from './GlassSurface';

type FavoriteCategory = 'all' | 'music' | 'food' | 'fashion' | 'beauty' | 'art';

type FavoritePlacesBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  imageUrlsByPlaceId: Record<string, string[]>;
  hasNextPage: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isUnauthorized: boolean;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onLoadMore: () => void;
  onRemovePlace: (place: DecisionPlace) => void;
  onRetry: () => void;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  pendingPlaceIds?: Record<string, boolean>;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;
const LIQUID_GLASS_AVAILABLE = supportsNativeLiquidGlass();

const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: FavoriteCategory;
  label: string;
}> = [
  { id: 'all', label: '전체' },
  { Icon: MusicAsset, id: 'music', label: '음악' },
  { Icon: FoodAsset, id: 'food', label: '음식점' },
  { Icon: FashionAsset, id: 'fashion', label: '패션' },
  { Icon: BeautyAsset, id: 'beauty', label: '뷰티' },
  { Icon: ArtAsset, id: 'art', label: '전시' },
];

const categoryAliases: Record<Exclude<FavoriteCategory, 'all'>, string[]> = {
  art: ['art', 'exhibit', 'exhibition', '전시'],
  beauty: ['beauty', '뷰티'],
  fashion: ['fashion', '패션'],
  food: ['cafe', 'dining', 'food', 'restaurant', '음식', '카페'],
  music: ['music', '음악'],
};

const getCategoryLabel = (place: DecisionPlace) => {
  const category = place.category.toLowerCase();
  if (categoryAliases.music.some((alias) => category.includes(alias))) return '음악';
  if (categoryAliases.food.some((alias) => category.includes(alias))) return '음식점';
  if (categoryAliases.fashion.some((alias) => category.includes(alias))) return '패션';
  if (categoryAliases.beauty.some((alias) => category.includes(alias))) return '뷰티';
  if (categoryAliases.art.some((alias) => category.includes(alias))) return '전시';
  return place.category;
};

const matchesCategory = (place: DecisionPlace, category: FavoriteCategory) => {
  if (category === 'all') return true;
  const value = place.category.toLowerCase();
  return categoryAliases[category].some((alias) => value.includes(alias));
};

const formatDistance = (place: DecisionPlace) => {
  if (place.distanceMeters === undefined) return place.distance;
  return place.distanceMeters >= 1000
    ? `${(place.distanceMeters / 1000).toFixed(1)}km`
    : `${Math.round(place.distanceMeters)}m`;
};

const HeaderStar = () => <MyPlaceAsset height={42} width={42} />;

const ActiveNavStar = () => (
  <Svg height={21} viewBox="0 0 25 24" width={22}>
    <Path
      d="M1.19 9.917c-.366-.338-.167-.949.327-1.008l7.004-.83a.58.58 0 0 0 .462-.335l2.954-6.405c.209-.452.852-.452 1.06 0l2.954 6.405a.58.58 0 0 0 .46.335l7.005.83c.494.06.692.67.327 1.008l-5.178 4.789a.58.58 0 0 0-.176.542l1.374 6.918c.097.488-.423.866-.857.623l-6.154-3.446a.58.58 0 0 0-.57 0l-6.155 3.445c-.434.243-.955-.134-.858-.622l1.375-6.918a.58.58 0 0 0-.176-.542L1.19 9.917Z"
      fill="#FF245B"
    />
  </Svg>
);

const FavoriteImage = ({ uri }: { uri?: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [uri]);

  if (!uri || hasError) {
    return (
      <View style={[styles.placeImage, styles.imagePlaceholder]}>
        <MyPlaceAsset height={30} width={30} />
      </View>
    );
  }

  return (
    <Image
      onError={() => setHasError(true)}
      resizeMode="cover"
      source={{ uri }}
      style={styles.placeImage}
    />
  );
};

const FavoritePlaceRow = ({
  imageUrls,
  onPress,
  onRemove,
  pending,
  place,
}: {
  imageUrls: string[];
  onPress: () => void;
  onRemove: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const sources = imageUrls.slice(0, 2);

  return (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeRow, pressed && styles.pressed]}
    >
      <View style={styles.placeHeading}>
        <View style={styles.placeText}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeCategory}>{getCategoryLabel(place)}</Text>
          </View>
          <Text numberOfLines={1} style={styles.placeMeta}>
            {formatDistance(place)} · {place.address}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={`${place.name} 즐겨찾기 해제`}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          style={styles.moreButton}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </Pressable>
      </View>
      <View style={styles.imageRow}>
        <FavoriteImage uri={sources[0]} />
        <FavoriteImage uri={sources[1] ?? sources[0]} />
      </View>
    </Pressable>
  );
};

const BottomNavigation = ({
  bottomInset,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  sheetTranslateY,
}: {
  bottomInset: number;
  onOpenMap: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
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
        <Pressable accessibilityLabel="지도" accessibilityRole="button" onPress={onOpenMap} style={styles.navItem}>
          <MapAsset color="#3B3B40" height={22} width={19} />
          <Text style={styles.navLabel}>지도</Text>
        </Pressable>
        <View style={[styles.navItem, styles.navItemActive]}>
          <ActiveNavStar />
          <Text style={[styles.navLabel, styles.navLabelActive]}>즐겨찾기</Text>
        </View>
        <Pressable accessibilityLabel="예약" accessibilityRole="button" onPress={onOpenReservations} style={styles.navItem}>
          <CheckInAsset height={22} width={21} />
          <Text style={styles.navLabel}>예약</Text>
        </Pressable>
      </GlassSurface> : <View style={[styles.navigationBar, styles.navigationBarSolid]}>
        <Pressable accessibilityLabel="지도" accessibilityRole="button" onPress={onOpenMap} style={styles.navItem}>
          <MapAsset color="#3B3B40" height={22} width={19} />
          <Text style={styles.navLabel}>지도</Text>
        </Pressable>
        <View style={[styles.navItem, styles.navItemActive]}>
          <ActiveNavStar />
          <Text style={[styles.navLabel, styles.navLabelActive]}>즐겨찾기</Text>
        </View>
        <Pressable accessibilityLabel="예약" accessibilityRole="button" onPress={onOpenReservations} style={styles.navItem}>
          <CheckInAsset height={22} width={21} />
          <Text style={styles.navLabel}>예약</Text>
        </Pressable>
      </View>}
    </View>
    <Pressable
      accessibilityLabel="장소추천"
      accessibilityRole="button"
      onPress={onOpenRecommendations}
      style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
    >
      {LIQUID_GLASS_AVAILABLE ? <GlassSurface
        glassEffectStyle="regular"
        intensity={96}
        pointerEvents="none"
        style={styles.sendButtonGlass}
        tintColor="rgba(238,238,242,0.42)"
      >
        <PlaceRecommendAsset height={23} width={23} />
      </GlassSurface> : <View pointerEvents="none" style={[styles.sendButtonGlass, styles.sendButtonSolid]}>
        <PlaceRecommendAsset height={23} width={23} />
      </View>}
    </Pressable>
  </Animated.View>
);

export default function FavoritePlacesBottomSheet({
  collapsedTranslateY,
  hasNextPage,
  height,
  imageUrlsByPlaceId,
  isError,
  isFetchNextPageError,
  isFetchingNextPage,
  isLoading,
  isUnauthorized,
  mediumTranslateY,
  onHandlePress,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  onPlacePress,
  onLoadMore,
  onRemovePlace,
  onRetry,
  panHandlers,
  places,
  pendingPlaceIds = {},
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
}: FavoritePlacesBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<FavoriteCategory>('all');
  const filteredPlaces = useMemo(
    () => places.filter((place) => matchesCategory(place, activeCategory)),
    [activeCategory, places],
  );
  const contentFadeStart = mediumTranslateY
    + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const contentOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, contentFadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
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
    <Animated.View style={[styles.bottomSheet, { height, transform: [{ translateY: sheetTranslateY }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.sheetChromeShadow, { bottom: chromeBottomInset, left: chromeGap, right: chromeGap }]}
      >
        <Animated.View
          style={[
            styles.sheetChrome,
            { borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius },
          ]}
        >
          <GlassSurface
            glassEffectStyle="regular"
            intensity={100}
            style={StyleSheet.absoluteFill}
            tintColor="rgba(248,248,248,0.28)"
          />
          <View style={styles.sheetTint} />
        </Animated.View>
      </Animated.View>

      <View style={styles.sheetInner}>
        <View style={styles.handleArea} {...panHandlers}>
          <Pressable
            accessibilityLabel="즐겨찾기 패널 크기 조절"
            accessibilityRole="adjustable"
            onPress={onHandlePress}
            style={styles.handleButton}
          >
            <View style={styles.handle} />
          </Pressable>
        </View>
        <Animated.View
          pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
          style={[styles.content, { opacity: contentOpacity }]}
        >
          <View style={styles.titleRow}>
            <HeaderStar />
            <Text style={styles.title}>내 장소</Text>
          </View>
          <ScrollView
            contentContainerStyle={styles.categoryContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(({ Icon, id, label }) => {
              const active = activeCategory === id;
              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  key={`${id}-${label}`}
                  onPress={() => setActiveCategory(id)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  {Icon ? <Icon color={active ? '#FF245B' : '#616169'} height={18} width={21} /> : null}
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.listViewport,
              snapPoint === 'medium' && styles.listViewportMedium,
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.listContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >
              {filteredPlaces.length > 0 ? filteredPlaces.map((place) => (
                <FavoritePlaceRow
                  imageUrls={imageUrlsByPlaceId[String(place.id)] ?? []}
                  key={place.id}
                  onPress={() => onPlacePress(place)}
                  onRemove={() => onRemovePlace(place)}
                  pending={Boolean(pendingPlaceIds[String(place.id)])}
                  place={place}
                />
              )) : isLoading ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>저장한 장소를 불러오는 중이에요</Text>
                </View>
              ) : isUnauthorized ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>로그인이 만료됐어요</Text>
                  <Text style={styles.emptyBody}>다시 로그인한 뒤 저장한 장소를 확인해 주세요.</Text>
                </View>
              ) : isError ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>장소를 불러오지 못했어요</Text>
                  <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                    <Text style={styles.retryLabel}>다시 시도</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <HeaderStar />
                  <Text style={styles.emptyTitle}>저장한 장소가 없어요</Text>
                  <Text style={styles.emptyBody}>마음에 드는 장소의 별을 눌러 모아보세요.</Text>
                </View>
              )}
              {filteredPlaces.length > 0 && hasNextPage ? (
                <View style={styles.loadMoreState}>
                  {isFetchNextPageError ? (
                    <Text style={styles.loadMoreError}>다음 장소를 불러오지 못했어요</Text>
                  ) : null}
                  <Pressable
                    accessibilityLabel="저장한 장소 더 불러오기"
                    accessibilityRole="button"
                    accessibilityState={{ busy: isFetchingNextPage, disabled: isFetchingNextPage }}
                    disabled={isFetchingNextPage}
                    onPress={onLoadMore}
                    style={styles.loadMoreButton}
                  >
                    <Text style={styles.retryLabel}>
                      {isFetchingNextPage ? '불러오는 중…' : isFetchNextPageError ? '다시 시도' : '더 보기'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      <BottomNavigation
        bottomInset={insets.bottom}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: { bottom: 0, left: 0, overflow: 'visible', position: 'absolute', right: 0, zIndex: 50 },
  categoryChip: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 6, height: 36, justifyContent: 'center', paddingHorizontal: 13,
  },
  categoryChipActive: { backgroundColor: 'rgba(255,255,255,0.84)', borderColor: '#FF245B' },
  categoryContent: { gap: 8, paddingBottom: 12, paddingHorizontal: 6, paddingTop: 10 },
  categoryLabel: { color: '#616169', fontSize: 14, fontWeight: '700' },
  categoryLabelActive: { color: '#FF245B' },
  categoryScroll: { flexGrow: 0, height: 58 },
  content: { flex: 1 },
  emptyBody: { color: '#777982', fontSize: 13, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingTop: 42 },
  emptyTitle: { color: '#27292F', fontSize: 17, fontWeight: '800', marginTop: 12 },
  handle: { backgroundColor: 'rgba(80,83,91,0.31)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#E7E7EA', justifyContent: 'center' },
  imageRow: { borderRadius: 15, flexDirection: 'row', height: 120, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingBottom: 116, paddingHorizontal: 6 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 182, marginBottom: 0 },
  loadMoreButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#FF1956', borderRadius: 18, marginBottom: 18, paddingHorizontal: 20, paddingVertical: 9 },
  loadMoreError: { color: '#777982', fontSize: 13 },
  loadMoreState: { alignItems: 'center', gap: 8 },
  moreButton: { alignItems: 'center', height: 30, justifyContent: 'center', width: 24 },
  moreButtonText: { color: '#3B3B40', fontSize: 22, lineHeight: 24 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 5 },
  navItem: { alignItems: 'center', borderRadius: 27, flex: 1, gap: 3, height: 54, justifyContent: 'center' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.58)', borderColor: 'rgba(255,255,255,0.78)', borderWidth: 1 },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: { backgroundColor: 'rgba(238,238,242,0.34)', borderColor: 'rgba(255,255,255,0.68)', borderRadius: 32, borderWidth: 1, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 5 },
  navigationBarSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  navigationRow: { flexDirection: 'row', gap: 12, left: 6, position: 'absolute', right: 16 },
  navigationShadow: { backgroundColor: 'rgba(238,238,242,0.12)', borderRadius: 32, elevation: 2, flex: 1, shadowColor: '#11151B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  placeCategory: { color: '#64666E', fontSize: 12 },
  placeHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 9 },
  placeImage: { borderRightColor: 'rgba(255,255,255,0.9)', borderRightWidth: 1, flex: 1, height: '100%' },
  placeMeta: { color: '#696B73', fontSize: 13, marginTop: 3 },
  placeName: { color: '#282A30', flexShrink: 1, fontSize: 16, fontWeight: '800' },
  placeRow: { marginBottom: 14 },
  placeText: { flex: 1 },
  pressed: { opacity: 0.72 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sendButton: { alignItems: 'center', backgroundColor: 'rgba(238,238,242,0.12)', borderRadius: 32, elevation: 4, height: 64, justifyContent: 'center', shadowColor: '#11151B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, width: 64 },
  sendButtonGlass: { alignItems: 'center', backgroundColor: 'rgba(238,238,242,0.34)', borderColor: 'rgba(255,255,255,0.68)', borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  sendButtonSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  sheetChrome: { backgroundColor: 'rgba(248,248,248,0.68)', borderColor: 'rgba(255,255,255,0.88)', borderRadius: 36, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, borderWidth: 1, flex: 1, overflow: 'hidden' },
  sheetChromeShadow: { backgroundColor: 'rgba(244,246,248,0.08)', borderRadius: 36, elevation: 22, left: 0, position: 'absolute', right: 0, shadowColor: '#10141A', shadowOffset: { width: 0, height: -7 }, shadowOpacity: 0.17, shadowRadius: 24, top: 0 },
  sheetInner: { flex: 1, overflow: 'hidden' },
  sheetTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(250,250,251,0.92)' },
  title: { color: '#111217', fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 6 },
});
