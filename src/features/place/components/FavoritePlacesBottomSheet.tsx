import React, { useMemo, useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArtAsset from '../../../assets/v2icon/art_svg.svg';
import BeautyAsset from '../../../assets/v2icon/beati_svg.svg';
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import FashionAsset from '../../../assets/v2icon/fashion_svg.svg';
import FoodAsset from '../../../assets/v2icon/food_svg.svg';
import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import MusicAsset from '../../../assets/v2icon/music_svg.svg';
import MyPlaceAsset from '../../../assets/v2icon/my_place.svg';
import PlaceRecommendAsset from '../../../assets/v2icon/placerecommend_svg.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import type { DecisionPlace } from './MapBottomSheet';
import GlassSurface from './GlassSurface';

type FavoriteCategory = 'all' | 'music' | 'food' | 'fashion' | 'beauty' | 'art';

type FavoritePlacesBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  imageUrlsByPlaceId: Record<string, string[]>;
  mediumTranslateY: number;
  onCreatePlace?: () => void;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenReservations?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;
const FALLBACK_IMAGE_URL = 'https://placehold.co/700x360.png';

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

const MoreIcon = () => (
  <Svg height={22} viewBox="0 0 20 24" width={18}>
    <Circle cx="10" cy="5" fill="#35363D" r="1.5" />
    <Circle cx="10" cy="12" fill="#35363D" r="1.5" />
    <Circle cx="10" cy="19" fill="#35363D" r="1.5" />
  </Svg>
);

const FavoritePlaceRow = ({
  imageUrls,
  onPress,
  place,
}: {
  imageUrls: string[];
  onPress: () => void;
  place: DecisionPlace;
}) => {
  const sources = imageUrls.length > 0 ? imageUrls.slice(0, 2) : [FALLBACK_IMAGE_URL];
  if (sources.length === 1) sources.push(sources[0]);

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
          accessibilityLabel={`${place.name} 더보기`}
          hitSlop={8}
          onPress={(event) => event.stopPropagation()}
          style={styles.moreButton}
        >
          <MoreIcon />
        </Pressable>
      </View>
      <View style={styles.imageRow}>
        {sources.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            resizeMode="cover"
            source={{ uri }}
            style={styles.placeImage}
          />
        ))}
      </View>
    </Pressable>
  );
};

const BottomNavigation = ({
  bottomInset,
  onCreatePlace,
  onOpenMap,
  onOpenReservations,
  sheetTranslateY,
}: {
  bottomInset: number;
  onCreatePlace?: () => void;
  onOpenMap: () => void;
  onOpenReservations?: () => void;
  sheetTranslateY: Animated.Value;
}) => (
  <Animated.View
    style={[
      styles.navigationRow,
      {
        bottom: Math.max(12, bottomInset),
        transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
      },
    ]}
  >
    <View style={styles.navigationShadow}>
      <View style={styles.navigationBar}>
        <Pressable onPress={onOpenMap} style={styles.navItem}>
          <MapAsset color="#3B3B40" height={22} width={19} />
          <Text style={styles.navLabel}>지도</Text>
        </Pressable>
        <View style={[styles.navItem, styles.navItemActive]}>
          <ActiveNavStar />
          <Text style={[styles.navLabel, styles.navLabelActive]}>즐겨찾기</Text>
        </View>
        <Pressable onPress={onOpenReservations} style={styles.navItem}>
          <CheckInAsset height={22} width={21} />
          <Text style={styles.navLabel}>예약</Text>
        </Pressable>
      </View>
    </View>
    <Pressable
      accessibilityLabel="장소 등록"
      onPress={onCreatePlace}
      style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
    >
      <PlaceRecommendAsset height={23} width={23} />
    </Pressable>
  </Animated.View>
);

export default function FavoritePlacesBottomSheet({
  collapsedTranslateY,
  height,
  imageUrlsByPlaceId,
  mediumTranslateY,
  onCreatePlace,
  onHandlePress,
  onOpenMap,
  onOpenReservations,
  onPlacePress,
  panHandlers,
  places,
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
                place={place}
              />
            )) : (
              <View style={styles.emptyState}>
                <HeaderStar />
                <Text style={styles.emptyTitle}>저장한 장소가 없어요</Text>
                <Text style={styles.emptyBody}>마음에 드는 장소의 별을 눌러 모아보세요.</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>

      <BottomNavigation
        bottomInset={insets.bottom}
        onCreatePlace={onCreatePlace}
        onOpenMap={onOpenMap}
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
  categoryContent: { gap: 8, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 },
  categoryLabel: { color: '#616169', fontSize: 14, fontWeight: '700' },
  categoryLabelActive: { color: '#FF245B' },
  content: { flex: 1 },
  emptyBody: { color: '#777982', fontSize: 13, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingTop: 42 },
  emptyTitle: { color: '#27292F', fontSize: 17, fontWeight: '800', marginTop: 12 },
  handle: { backgroundColor: 'rgba(80,83,91,0.31)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  imageRow: { borderRadius: 15, flexDirection: 'row', height: 120, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingBottom: 116, paddingHorizontal: 16 },
  moreButton: { alignItems: 'center', height: 30, justifyContent: 'center', width: 24 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 5 },
  navItem: { alignItems: 'center', borderRadius: 27, flex: 1, gap: 3, height: 54, justifyContent: 'center' },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.94)' },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: { backgroundColor: '#EFEFF2', borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 5 },
  navigationRow: { flexDirection: 'row', gap: 12, left: 24, position: 'absolute', right: 24 },
  navigationShadow: { backgroundColor: '#EFEFF2', borderRadius: 32, elevation: 2, flex: 1, shadowColor: '#11151B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  placeCategory: { color: '#64666E', fontSize: 12 },
  placeHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 9 },
  placeImage: { borderRightColor: 'rgba(255,255,255,0.9)', borderRightWidth: 1, flex: 1, height: '100%' },
  placeMeta: { color: '#696B73', fontSize: 13, marginTop: 3 },
  placeName: { color: '#282A30', flexShrink: 1, fontSize: 16, fontWeight: '800' },
  placeRow: { marginBottom: 14 },
  placeText: { flex: 1 },
  pressed: { opacity: 0.72 },
  sendButton: { alignItems: 'center', backgroundColor: 'rgba(245,245,247,0.96)', borderRadius: 33, elevation: 4, height: 64, justifyContent: 'center', shadowColor: '#11151B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, width: 64 },
  sheetChrome: { backgroundColor: 'rgba(248,248,248,0.68)', borderColor: 'rgba(255,255,255,0.88)', borderRadius: 36, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, borderWidth: 1, flex: 1, overflow: 'hidden' },
  sheetChromeShadow: { backgroundColor: 'rgba(244,246,248,0.08)', borderRadius: 36, elevation: 22, left: 0, position: 'absolute', right: 0, shadowColor: '#10141A', shadowOffset: { width: 0, height: -7 }, shadowOpacity: 0.17, shadowRadius: 24, top: 0 },
  sheetInner: { flex: 1 },
  sheetTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(250,250,251,0.42)' },
  title: { color: '#111217', fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
});
