import Skeleton from '../../../../../shared/components/Skeleton';
import { Text as AppText } from '../../../../../shared/components/Typography';
import UnavailableStateIcon from '../../../../../shared/components/UnavailableStateIcon';
import ApiErrorState from '../../../../../shared/components/ApiErrorState';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import MoreAsset from '../../../../../../assets/v2/icons/place/favorites-more.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArtAsset from '../../../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../../../assets/v2/icons/place/heritage.svg';
import MusicAsset from '../../../../../../assets/v2/icons/place/music_svg.svg';
import MyPlaceAsset from '../../../../../../assets/v2/icons/place/my_place.svg';
import PopupAsset from '../../../../../../assets/v2/icons/place/popup_svg.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import type { DecisionPlace } from './MapBottomSheet';
import MapSheetBottomNavigation, { getMapSheetNavigationBottom } from './MapSheetBottomNavigation';
import * as GlassStyles from '../styles/BottomSheetGlass.styles';
import { normalizePlaceCategory } from '../../../core/placeCategory';
import { formatDistance as formatLocalizedDistance } from '../../../../../shared/i18n/formatters';
import { liquidGlass } from '../../../../../shared/theme/liquidGlass';
import { useTheme } from 'styled-components/native';
import type { AppTheme } from '../../../../../shared/theme';

type FavoriteCategory = 'all' | 'art' | 'beauty' | 'cafe' | 'etc' | 'fashion' | 'food' | 'heritage' | 'music' | 'popup';

type FavoritePlacesBottomSheetProps = {
  collapsedTranslateY: number;
  /** Snap offset of the raised sheet; the chrome reaches full width there (Figma *-Up frames). */
  expandedTranslateY?: number;
  height: number;
  imageUrlsByPlaceId: Record<string, string[]>;
  hasNextPage: boolean;
  isError: boolean;
  error?: unknown;
  isFetching?: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isUnauthorized: boolean;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenCommunity?: () => void;
  onOpenMap: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onLoadMore: () => void;
  onRemovePlace: (place: DecisionPlace) => void;
  onRetry: () => unknown;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  pendingPlaceIds?: Record<string, boolean>;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = liquidGlass.sheet.bottomRadius;
const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: FavoriteCategory;
  iconWidth?: number;
}> = [
  { id: 'all' }, { Icon: FoodAsset, id: 'food', iconWidth: 15 }, { Icon: MusicAsset, id: 'music' },
  { Icon: PopupAsset, id: 'popup' }, { Icon: FashionAsset, id: 'fashion', iconWidth: 24 },
  { Icon: BeautyAsset, id: 'beauty', iconWidth: 7 }, { Icon: ArtAsset, id: 'art', iconWidth: 18 },
  { Icon: CafeAsset, id: 'cafe' }, { Icon: HeritageAsset, id: 'heritage' }, { Icon: EtcAsset, id: 'etc', iconWidth: 16 },
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

const useFavoriteStyles = () => {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [theme]);
};

const FavoriteImage = ({ uri }: { uri?: string }) => {
  const [hasError, setHasError] = useState(false);
  const styles = useFavoriteStyles();

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
  const styles = useFavoriteStyles();
  const { colors } = useTheme();
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
            <AppText accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={1} style={styles.placeName}>{place.name}</AppText>
            <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.placeCategory}>{t(`map.categories.${getFavoriteCategory(place)}`)}</AppText>
          </View>
          <AppText accessibilityLabel={`${formatDistance(place, i18n.language)} · ${place.address}`} ellipsizeMode="tail" numberOfLines={1} style={styles.placeMeta}>
            {formatDistance(place, i18n.language)} · {place.address}
          </AppText>
        </View>
        <Pressable
          accessibilityLabel={t('map.favorites.remove', { name: place.name })}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          hitSlop={20}
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          style={styles.moreButton}
        >
          <MoreAsset color={colors.text} height={24} width={3} />
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
  expandedTranslateY = 0,
  hasNextPage,
  height,
  imageUrlsByPlaceId,
  isError,
  error,
  isFetching,
  isFetchNextPageError,
  isFetchingNextPage,
  isLoading,
  isUnauthorized,
  mediumTranslateY,
  onHandlePress,
  onOpenCommunity,
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
  const theme = useTheme();
  const { colors, liquidGlass: themedGlass } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const footerSpace = getMapSheetNavigationBottom(insets.bottom) + 64 + 16;
  // Keep the scroll viewport above the fixed footer at every snap point and while dragging.
  const availableListHeight = Math.max(0, height - 107 - footerSpace);
  const listHeight = sheetChromeBottom.interpolate({
    inputRange: [0, Math.max(1, availableListHeight)],
    outputRange: [availableListHeight, 0],
    extrapolate: 'clamp',
  });
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
  const chromeGapRange = [expandedTranslateY, Math.max(mediumTranslateY, expandedTranslateY + 1)];
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
        style={{ boxShadow: themedGlass.sheet.shadow, bottom: chromeBottomInset, left: chromeGap, right: chromeGap }}
      >
        <GlassStyles.SheetChrome
          $borderColor={themedGlass.sheet.rim}
          style={[
            { borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius },
          ]}
        >
          <GlassStyles.SheetGlass
            cornerRadius={themedGlass.sheet.topRadius}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={themedGlass.sheet.highlightOpacity}
            rimColor={themedGlass.sheet.rim}
            tintColor={themedGlass.sheet.tint}
            topRimOnly
          />
        </GlassStyles.SheetChrome>
      </GlassStyles.SheetChromeShadow>

      <GlassStyles.SheetInner $clipContent $inset={snapPoint === 'expanded' ? 0 : SHEET_RESTING_GAP} testID="favorites-sheet-inner">
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
          {/* The title and chips are a drag area too; horizontal chip swipes still scroll. */}
          <View {...panHandlers} testID="favorites-sheet-header">
          <View style={styles.titleRow}>
            <AppText style={styles.title}>{t('map.navigation.favorites')}</AppText>
          </View>
          <ScrollView
            contentContainerStyle={styles.categoryContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(({ Icon, id, iconWidth = 21 }) => {
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
                  {Icon ? <Icon color={active ? theme.liquidGlass.category.activeForeground : colors.textAlternative} height={18} width={iconWidth} /> : null}
                  <AppText style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          </View>

          <Animated.View style={[styles.listViewport, { height: listHeight }]}>
            <ScrollView
              contentContainerStyle={styles.listContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >
              {isError && filteredPlaces.length > 0 && !isFetchNextPageError ? <ApiErrorState error={error} busy={isFetching} onRetry={onRetry} /> : null}
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
                <Skeleton accessibilityLabel={t('map.favorites.loading')} />
              ) : isUnauthorized ? (
                <View style={styles.emptyState}>
                  <AppText style={styles.emptyTitle}>{t('map.favorites.sessionTitle')}</AppText>
                  <AppText style={styles.emptyBody}>{t('map.favorites.sessionBody')}</AppText>
                </View>
              ) : isError ? (
                <ApiErrorState error={error} busy={isFetching} onRetry={onRetry} />
              ) : (
                <View style={styles.emptyState}>
                  <UnavailableStateIcon size={64} />
                  <AppText style={styles.emptyTitle}>{t('map.favorites.emptyTitle')}</AppText>
                  <AppText style={styles.emptyBody}>{t('map.favorites.emptyBody')}</AppText>
                </View>
              )}
              {filteredPlaces.length > 0 && hasNextPage ? (
                <View style={styles.loadMoreState}>
                  {isFetchNextPageError ? (
                    <AppText style={styles.loadMoreError}>{t('map.favorites.loadMoreError')}</AppText>
                  ) : null}
                  <Pressable
                    accessibilityLabel={t('map.favorites.loadMoreLabel')}
                    accessibilityRole="button"
                    accessibilityState={{ busy: isFetchingNextPage, disabled: isFetchingNextPage }}
                    disabled={isFetchingNextPage}
                    onPress={onLoadMore}
                    style={styles.loadMoreButton}
                  >
                    <AppText style={styles.retryLabel}>
                      {isFetchingNextPage ? t('map.favorites.loading') : isFetchNextPageError ? t('map.favorites.retry') : t('map.favorites.loadMore')}
                    </AppText>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </GlassStyles.SheetInner>

      <MapSheetBottomNavigation
        activeTab="favorites"
        onOpenCommunity={onOpenCommunity}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const createStyles = ({ colors, liquidGlass: glass }: AppTheme): Record<string, object> => ({
  categoryChip: {
    alignItems: 'center', backgroundColor: glass.category.tint, borderColor: glass.sheet.rim,
    boxShadow: glass.category.shadow, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 6, height: 36, justifyContent: 'center', paddingHorizontal: 12,
  },
  categoryChipActive: { backgroundColor: glass.category.activeTint, borderColor: glass.category.activeBorder },
  categoryContent: { gap: 8, paddingBottom: 10, paddingHorizontal: 16, paddingTop: 16 },
  categoryLabel: { color: colors.textAlternative, fontSize: 14, fontWeight: '500', lineHeight: 18, includeFontPadding: false },
  categoryLabelActive: { color: glass.category.activeForeground },
  categoryScroll: { flexGrow: 0, height: 62, overflow: 'hidden' },
  content: { flex: 1 },
  emptyBody: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingTop: 12 },
  emptyTitle: { color: colors.textStrong, fontSize: 17, fontWeight: '800', marginTop: 12 },
  handle: { backgroundColor: colors.borderEmphasis, borderRadius: 7, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 19, justifyContent: 'flex-start' },
  handleButton: { alignItems: 'center', height: 19, paddingTop: 6, width: 96 },
  imagePlaceholder: { alignItems: 'center', backgroundColor: colors.surfaceMuted, justifyContent: 'center' },
  imageRow: { borderRadius: 12, flexDirection: 'row', gap: 2, height: 114, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingBottom: 12, paddingHorizontal: 16 },
  listViewport: { overflow: 'hidden' },
  loadMoreButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.primaryAction, borderRadius: 18, marginBottom: 18, paddingHorizontal: 20, paddingVertical: 9 },
  loadMoreError: { color: colors.textMuted, fontSize: 13 },
  loadMoreState: { alignItems: 'center', gap: 8 },
  moreButton: { alignItems: 'center', height: 24, justifyContent: 'center', width: 3 },
  nameRow: { alignItems: 'center', flexDirection: 'row', gap: 4, minWidth: 0 },
  placeCategory: { color: colors.textAlternative, flexShrink: 1, fontSize: 14, fontWeight: '500', includeFontPadding: false, lineHeight: 18, minWidth: 0 },
  placeHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, marginBottom: 8 },
  placeImage: { flex: 1, height: '100%' },
  placeMeta: { color: colors.textAlternative, flexShrink: 1, fontSize: 16, includeFontPadding: false, lineHeight: 21, marginTop: 4, minWidth: 0 },
  placeName: { color: colors.text, flexShrink: 1, fontSize: 18, fontWeight: '700', includeFontPadding: false, lineHeight: 24, minWidth: 0 },
  placeRow: { paddingVertical: 6, marginBottom: 12 },
  placeText: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.72 },
  retryLabel: { color: colors.onPrimary, fontSize: 13, fontWeight: '800' },
  title: { color: colors.textStrong, fontSize: 20, fontWeight: '700', lineHeight: 26, includeFontPadding: false },
  titleRow: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 },
});
