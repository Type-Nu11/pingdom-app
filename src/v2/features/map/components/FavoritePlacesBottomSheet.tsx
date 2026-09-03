import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  Text as NativeText,
  type TextProps,
  View,
} from 'react-native';
import ArtAsset from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../assets/v2/icons/place/heritage.svg';
import MusicAsset from '../../../../assets/v2/icons/place/music_svg.svg';
import MyPlaceAsset from '../../../../assets/v2/icons/place/my_place.svg';
import PopupAsset from '../../../../assets/v2/icons/place/popup_svg.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import type { DecisionPlace } from './MapBottomSheet';
import MapSheetBottomNavigation from './MapSheetBottomNavigation';
import * as GlassStyles from '../styles/BottomSheetGlass.styles';
import { normalizePlaceCategory } from '../utils/placeCategory';
import { formatDistance as formatLocalizedDistance } from '../../../shared/i18n/formatters';
import { colors } from '../../../shared/theme/colors';

type FavoriteCategory = 'all' | 'art' | 'beauty' | 'cafe' | 'etc' | 'fashion' | 'food' | 'heritage' | 'music' | 'popup';

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
const Text = (props: TextProps) => <NativeText maxFontSizeMultiplier={1} {...props} />;
const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: FavoriteCategory;
}> = [
  { id: 'all' }, { Icon: MusicAsset, id: 'music' }, { Icon: FoodAsset, id: 'food' },
  { Icon: PopupAsset, id: 'popup' }, { Icon: FashionAsset, id: 'fashion' },
  { Icon: BeautyAsset, id: 'beauty' }, { Icon: ArtAsset, id: 'art' },
  { Icon: CafeAsset, id: 'cafe' }, { Icon: HeritageAsset, id: 'heritage' }, { Icon: EtcAsset, id: 'etc' },
];

const getFavoriteCategory = (place: DecisionPlace): Exclude<FavoriteCategory, 'all'> => {
  const category = normalizePlaceCategory(place.category);
  return category === 'game' ? 'popup' : category;
};

const matchesCategory = (place: DecisionPlace, category: FavoriteCategory) => {
  if (category === 'all') return true;
  return getFavoriteCategory(place) === category;
};

const formatDistance = (place: DecisionPlace, language: string) => {
  if (place.distanceMeters === undefined) return place.distance;
  return formatLocalizedDistance(place.distanceMeters, language);
};

const HeaderStar = () => <MyPlaceAsset height={42} width={42} />;

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
  const { i18n, t } = useTranslation();
  const sources = imageUrls.slice(0, 2);

  return (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeRow, pressed && styles.pressed]}
    >
      <View style={styles.placeHeading}>
        <View style={styles.placeText}>
          <View style={styles.nameRow}>
            <Text accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={1} style={styles.placeName}>{place.name}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.placeCategory}>{t(`map.categories.${getFavoriteCategory(place)}`)}</Text>
          </View>
          <Text accessibilityLabel={`${formatDistance(place, i18n.language)} · ${place.address}`} ellipsizeMode="tail" numberOfLines={1} style={styles.placeMeta}>
            {formatDistance(place, i18n.language)} · {place.address}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={t('map.favorites.remove', { name: place.name })}
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
  const { t } = useTranslation();
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
    <GlassStyles.BottomSheetContainer style={{ height, transform: [{ translateY: sheetTranslateY }] }}>
      <GlassStyles.SheetChromeShadow
        pointerEvents="none"
        style={{ bottom: chromeBottomInset, left: chromeGap, right: chromeGap }}
      >
        <GlassStyles.SheetChrome
          $borderColor="transparent"
          style={[
            { borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius },
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

      <GlassStyles.SheetInner $clipContent $inset={SHEET_RESTING_GAP}>
        <View style={styles.handleArea} {...panHandlers}>
          <Pressable
            accessibilityLabel={t('map.favorites.adjust')}
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
            <Text style={styles.title}>{t('map.favorites.title')}</Text>
          </View>
          <ScrollView
            contentContainerStyle={styles.categoryContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(({ Icon, id }) => {
              const active = activeCategory === id;
              const label = t(`map.categories.${id}`);
              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  key={`${id}-${label}`}
                  onPress={() => setActiveCategory(id)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  {Icon ? <Icon color={active ? colors.primary : colors.textAlternative} height={18} width={21} /> : null}
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
                  <Text style={styles.emptyTitle}>{t('map.favorites.loading')}</Text>
                </View>
              ) : isUnauthorized ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>{t('map.favorites.sessionTitle')}</Text>
                  <Text style={styles.emptyBody}>{t('map.favorites.sessionBody')}</Text>
                </View>
              ) : isError ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>{t('map.favorites.error')}</Text>
                  <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
                    <Text style={styles.retryLabel}>{t('map.favorites.retry')}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <HeaderStar />
                  <Text style={styles.emptyTitle}>{t('map.favorites.emptyTitle')}</Text>
                  <Text style={styles.emptyBody}>{t('map.favorites.emptyBody')}</Text>
                </View>
              )}
              {filteredPlaces.length > 0 && hasNextPage ? (
                <View style={styles.loadMoreState}>
                  {isFetchNextPageError ? (
                    <Text style={styles.loadMoreError}>{t('map.favorites.loadMoreError')}</Text>
                  ) : null}
                  <Pressable
                    accessibilityLabel={t('map.favorites.loadMoreLabel')}
                    accessibilityRole="button"
                    accessibilityState={{ busy: isFetchingNextPage, disabled: isFetchingNextPage }}
                    disabled={isFetchingNextPage}
                    onPress={onLoadMore}
                    style={styles.loadMoreButton}
                  >
                    <Text style={styles.retryLabel}>
                      {isFetchingNextPage ? t('map.favorites.loading') : isFetchNextPageError ? t('map.favorites.retry') : t('map.favorites.loadMore')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </GlassStyles.SheetInner>

      <MapSheetBottomNavigation
        activeTab="favorites"
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const styles: Record<string, object> = {
  categoryChip: {
    alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.backgroundNeutral,
    borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 6, height: 36, justifyContent: 'center', paddingHorizontal: 13,
  },
  categoryChipActive: { backgroundColor: colors.selectedSurface, borderColor: colors.selectedBorder },
  categoryContent: { gap: 8, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 10 },
  categoryLabel: { color: colors.textAlternative, fontSize: 14, fontWeight: '700' },
  categoryLabelActive: { color: colors.primary },
  categoryScroll: { flexGrow: 0, height: 58, overflow: 'hidden' },
  content: { flex: 1 },
  emptyBody: { color: '#777982', fontSize: 13, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingTop: 42 },
  emptyTitle: { color: '#27292F', fontSize: 17, fontWeight: '800', marginTop: 12 },
  handle: { backgroundColor: 'rgba(80,83,91,0.34)', borderRadius: 3, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 36, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 96 },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#E7E7EA', justifyContent: 'center' },
  imageRow: { borderRadius: 15, flexDirection: 'row', height: 120, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingBottom: 116, paddingHorizontal: 16 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 182, marginBottom: 0 },
  loadMoreButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#FF1956', borderRadius: 18, marginBottom: 18, paddingHorizontal: 20, paddingVertical: 9 },
  loadMoreError: { color: '#777982', fontSize: 13 },
  loadMoreState: { alignItems: 'center', gap: 8 },
  moreButton: { alignItems: 'center', height: 30, justifyContent: 'center', width: 24 },
  moreButtonText: { color: '#3B3B40', fontSize: 22, lineHeight: 24 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 5, minWidth: 0 },
  placeCategory: { color: colors.textAlternative, flexShrink: 1, fontSize: 12, includeFontPadding: false, lineHeight: 16, minWidth: 0 },
  placeHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 9 },
  placeImage: { borderRightColor: 'rgba(255,255,255,0.9)', borderRightWidth: 1, flex: 1, height: '100%' },
  placeMeta: { color: colors.textAlternative, flexShrink: 1, fontSize: 13, includeFontPadding: false, lineHeight: 18, marginTop: 3, minWidth: 0 },
  placeName: { color: colors.text, flexShrink: 1, fontSize: 16, fontWeight: '800', includeFontPadding: false, lineHeight: 21, minWidth: 0 },
  placeRow: { marginBottom: 14 },
  placeText: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.72 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  title: { color: '#111217', fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
};
