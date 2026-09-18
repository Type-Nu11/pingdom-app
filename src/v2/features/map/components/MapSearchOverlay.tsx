import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput as NativeTextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import ArtAsset from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../assets/v2/icons/place/heritage.svg';
import MusicAsset from '../../../../assets/v2/icons/place/music_svg.svg';
import PopupAsset from '../../../../assets/v2/icons/place/popup_svg.svg';
import {
  getPlaceListRuntimeState,
  usePlaceAutocomplete,
} from '../../../modules/place/exploration';
import {
  toAutocompleteResults,
  type MapPlaceResult,
} from '../model/mapDiscovery';
import { env } from '../../../shared/config';
import type { KakaoLocalSearchItem } from '../api/kakaoLocalApi';
import { useKakaoLocalSearch } from '../hooks/useKakaoLocalSearch';
import { usePlaceRegistrantUsernames } from '../hooks/usePlaceRegistrantUsernames';
import type { RecommendedPlace } from '../model/place.types';
import {
  formatRecentSearchDate,
  type RecentSearch,
} from '../model/recentSearch';
import {
  getRecentSearchOwnerKey,
  type RecentSearchOwner,
} from '../services/recentSearchStorage';
import { useRecentSearchStore } from '../store/recentSearchStore';
import type { AppTheme } from '../../../shared/theme';

export type MapSearchSelection = {
  address: string;
  id: string;
  isRegisteredPlace: boolean;
  lat: number;
  lng: number;
  name: string;
  roadAddress: string;
};

type MapSearchOverlayProps = {
  centerLat: number;
  centerLng: number;
  isRecommendationsError?: boolean;
  isRecommendationsLoading?: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  onRefreshRecommendations?: () => Promise<unknown> | void;
  onSelectRecommendedPlace?: (place: RecommendedPlace) => void;
  onSelectPlace: (place: MapSearchSelection) => void;
  recentSearchOwner?: RecentSearchOwner;
  recommendedPlaces?: RecommendedPlace[];
};

type SearchCategory =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'heritage'
  | 'music'
  | 'popup';

const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: SearchCategory;
}> = [
  { id: 'all' }, { Icon: MusicAsset, id: 'music' }, { Icon: FoodAsset, id: 'food' },
  { Icon: PopupAsset, id: 'popup' }, { Icon: FashionAsset, id: 'fashion' },
  { Icon: BeautyAsset, id: 'beauty' }, { Icon: ArtAsset, id: 'art' },
  { Icon: CafeAsset, id: 'cafe' }, { Icon: HeritageAsset, id: 'heritage' }, { Icon: EtcAsset, id: 'etc' },
];

const RecentCategoryIcon = ({ category, color }: { category: RecentSearch['category']; color: string }) => {
  const Icon = categories.find((item) => item.id === category)?.Icon ?? ArtAsset;
  return <Icon color={color} height={21} width={24} />;
};

const toKakaoSelection = (item: KakaoLocalSearchItem): MapSearchSelection => ({
  address: item.address,
  id: item.id,
  isRegisteredPlace: false,
  lat: item.lat,
  lng: item.lng,
  name: item.name,
  roadAddress: item.roadAddress,
});

const toRegisteredSelection = (item: MapPlaceResult): MapSearchSelection => ({
  address: item.address,
  id: String(item.id),
  isRegisteredPlace: true,
  lat: item.coordinate.lat,
  lng: item.coordinate.lng,
  name: item.name,
  roadAddress: item.address,
});

const MapSearchOverlay = ({
  centerLat,
  centerLng,
  isRecommendationsError = false,
  isRecommendationsLoading = false,
  onClose,
  onRefreshRecommendations,
  onSelectRecommendedPlace,
  onSelectPlace,
  recentSearchOwner,
  recommendedPlaces = [],
}: MapSearchOverlayProps) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<NativeTextInput>(null);
  const searchRequestInFlight = useRef(false);
  const [query, setQuery] = useState('');
  const [registeredQuery, setRegisteredQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const activeRecentSearchOwnerKey = useRecentSearchStore((state) => state.activeOwnerKey);
  const recentSearchHydrationStatus = useRecentSearchStore((state) => state.hydrationStatus);
  const storedRecentQueries = useRecentSearchStore((state) => state.items);
  const activateRecentSearchOwner = useRecentSearchStore((state) => state.activateOwner);
  const clearRecentSearches = useRecentSearchStore((state) => state.clearSearches);
  const recordRecentSearch = useRecentSearchStore((state) => state.recordSearch);
  const removeRecentSearch = useRecentSearchStore((state) => state.removeSearch);
  const recentSearchOwnerKey = useMemo(
    () => recentSearchOwner ? getRecentSearchOwnerKey(recentSearchOwner) : null,
    [recentSearchOwner],
  );
  const isRecentSearchHydrating = recentSearchOwnerKey !== null
    && (
      activeRecentSearchOwnerKey !== recentSearchOwnerKey
      || recentSearchHydrationStatus === 'loading'
    );
  const recentQueries = activeRecentSearchOwnerKey === recentSearchOwnerKey
    ? storedRecentQueries
    : [];

  useEffect(() => {
    if (recentSearchOwner) void activateRecentSearchOwner(recentSearchOwner);
  }, [activateRecentSearchOwner, recentSearchOwner, recentSearchOwnerKey]);
  const registeredSearch = usePlaceAutocomplete({
    keyword: registeredQuery,
    latitude: centerLat,
    longitude: centerLng,
  }, {
    enabled: env.featureFlags.placeList && registeredQuery.length > 0,
  });
  const registeredResults = toAutocompleteResults(registeredSearch.data);
  const {
    clearSearchResults,
    isSearchingAddress,
    searchPlaces,
    searchResults,
    searchStatusMessage,
  } = useKakaoLocalSearch();
  const isSearching = isSearchingAddress || registeredSearch.isFetching;
  const trimmedQuery = query.trim();
  const hasResults = registeredResults.length > 0 || searchResults.length > 0;
  const isResultMode = hasSearched || trimmedQuery.length > 0;
  const shouldShowEmptyState = hasSearched && !isSearching && !hasResults;
  const registeredStatus = getPlaceListRuntimeState({
    enabled: env.featureFlags.placeList,
    isError: registeredSearch.isError,
    isLoading: registeredSearch.isFetching,
    placeCount: registeredResults.length,
  });
  const { isLoadingByPlaceId, usernamesByPlaceId } = usePlaceRegistrantUsernames(
    showRecommendations ? recommendedPlaces.slice(0, 5) : []
  );

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setHasSearched(false);
    }

    setShowRecommendations(false);
    setRegisteredQuery('');
    clearSearchResults();
  };

  const runSearch = async (
    nextQuery = query,
    searchCategory: SearchCategory = activeCategory,
  ) => {
    if (searchRequestInFlight.current) return;
    const normalizedQuery = nextQuery.trim();

    if (!normalizedQuery) {
      setHasSearched(false);
      setRegisteredQuery('');
      searchRequestInFlight.current = true;
      try {
        await searchPlaces(normalizedQuery, { centerLat, centerLng });
      } finally {
        searchRequestInFlight.current = false;
      }
      return;
    }

    Keyboard.dismiss();
    setHasSearched(true);
    setQuery(normalizedQuery);
    if (recentSearchOwner) {
      void recordRecentSearch({
        category: searchCategory === 'all' ? 'art' : searchCategory,
        query: normalizedQuery,
      }, recentSearchOwner);
    }

    setRegisteredQuery(normalizedQuery);
    searchRequestInFlight.current = true;
    try {
      await searchPlaces(normalizedQuery, { centerLat, centerLng });
    } finally {
      searchRequestInFlight.current = false;
    }
  };

  const handleSelect = (place: MapSearchSelection) => {
    Keyboard.dismiss();
    onSelectPlace(place);
    onClose();
  };

  const handleRecommendedPlaceSelect = (place: RecommendedPlace) => {
    Keyboard.dismiss();
    onSelectRecommendedPlace?.(place);
    onClose();
  };

  const handleShowRecommendations = () => {
    Keyboard.dismiss();
    setShowRecommendations(true);
    void onRefreshRecommendations?.();
  };

  const recommendationStatusText = isRecommendationsLoading
    ? t('map.searchOverlay.recommendationLoading')
    : isRecommendationsError
      ? t('map.searchOverlay.recommendationError')
      : recommendedPlaces.length === 0
        ? t('map.searchOverlay.recommendationEmpty')
        : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchField}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('map.searchOverlay.close')}
            hitSlop={8}
            style={styles.backButton}
            onPress={onClose}
          >
            <AppText style={styles.backIcon}>‹</AppText>
          </Pressable>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            ref={inputRef}
            returnKeyType="search"
            style={styles.searchInput}
            placeholder={t('map.searchOverlay.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => void runSearch()}
          />
          {trimmedQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('map.searchOverlay.clear')}
              hitSlop={8}
              onPress={() => {
                setQuery('');
                setHasSearched(false);
                setShowRecommendations(false);
                setRegisteredQuery('');
                clearSearchResults();
                inputRef.current?.focus();
              }}
            >
              <AppText style={styles.clearIcon}>×</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.categoryContent}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map(({ Icon, id }) => {
          const active = id === activeCategory;
          const label = t(`map.categories.${id}`);
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={id}
              onPress={() => {
                setActiveCategory(id);
                if (id !== 'all') void runSearch(label, id);
              }}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              {Icon ? <Icon color={active ? colors.primary : colors.textMuted} height={18} width={22} /> : null}
              <AppText style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!isResultMode ? (
          <>
            <View style={styles.recentHeader}>
              <AppText style={styles.recentTitle}>{t('map.searchOverlay.recent')}</AppText>
              {recentQueries.length > 0 && recentSearchOwner ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('map.searchOverlay.recentClearAll')}
                  onPress={() => void clearRecentSearches(recentSearchOwner)}
                >
                  <AppText style={styles.deleteText}>{t('map.searchOverlay.clearAll')}</AppText>
                </Pressable>
              ) : null}
            </View>
            {isRecentSearchHydrating ? (
              <ActivityIndicator
                accessibilityLabel={t('map.searchOverlay.recentLoading')}
                color={colors.textMuted}
                size="small"
                style={styles.recentLoading}
              />
            ) : null}
            {recentQueries.map((item) => (
              <View key={item.id} style={styles.recentRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('map.searchOverlay.recentSearch', { query: item.query })}
                  onPress={() => void runSearch(item.query, item.category)}
                  style={styles.recentMain}
                >
                  <View style={styles.recentIcon}>
                    <RecentCategoryIcon category={item.category} color={colors.textMuted} />
                  </View>
                  <AppText numberOfLines={1} style={styles.recentQuery}>{item.query}</AppText>
                </Pressable>
                <AppText style={styles.recentDate}>
                  {formatRecentSearchDate(item.searchedAt, i18n.language)}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('map.searchOverlay.recentDelete', { query: item.query })}
                  hitSlop={10}
                  onPress={() => recentSearchOwner
                    ? void removeRecentSearch(item.id, recentSearchOwner)
                    : undefined}
                >
                  <AppText style={styles.recentRemove}>×</AppText>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}

        {isSearching ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <AppText style={styles.statusInlineText}>{t('map.searchOverlay.loading')}</AppText>
          </View>
        ) : null}

        {hasSearched && !isSearching && (
          registeredStatus !== 'ready' || env.apiMode === 'mock'
        ) ? (
          <View style={styles.registeredStatus} testID={`registered-place-status-${
            env.apiMode === 'mock' && registeredStatus === 'ready' ? 'mock' : registeredStatus
          }`}>
            <AppText style={styles.statusInlineText}>
              {env.apiMode === 'mock' && registeredStatus === 'ready'
                ? t('map.searchOverlay.registeredMock')
                : registeredStatus === 'disabled'
                  ? t('map.searchOverlay.registeredDisabled')
                  : registeredStatus === 'error'
                    ? t('map.searchOverlay.registeredError')
                    : t('map.searchOverlay.registeredEmpty')}
            </AppText>
          </View>
        ) : null}

        {registeredResults.length > 0 ? (
          <View style={styles.resultGroup}>
            <AppText style={styles.sectionTitle}>{t('map.searchOverlay.pingdomResults')}</AppText>
            {registeredResults.slice(0, 5).map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleSelect(toRegisteredSelection(item))}
              >
                <AppText numberOfLines={1} style={styles.resultName}>{item.name}</AppText>
                <AppText numberOfLines={1} style={styles.resultAddress}>
                  {item.address}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {searchResults.length > 0 ? (
          <View style={styles.resultGroup}>
            <AppText style={styles.sectionTitle}>{t('map.searchOverlay.externalResults')}</AppText>
            {searchResults.slice(0, 8).map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleSelect(toKakaoSelection(item))}
              >
                <AppText numberOfLines={1} style={styles.resultName}>{item.name}</AppText>
                <AppText numberOfLines={1} style={styles.resultAddress}>
                  {item.roadAddress || item.address}
                </AppText>
                {item.category ? (
                  <AppText numberOfLines={1} style={styles.resultCategory}>{item.category}</AppText>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        {shouldShowEmptyState ? (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyTitle}>{t('map.searchOverlay.emptyTitle')}</AppText>
            <AppText style={styles.emptyDescription}>{t('map.searchOverlay.emptyBody')}</AppText>
          </View>
        ) : !isSearching && !hasResults && searchStatusMessage && !hasSearched ? (
          <AppText style={styles.statusText}>{searchStatusMessage}</AppText>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const absoluteFill = { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 };
const createStyles = (colors: AppTheme['colors']): Record<string, object> => ({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 26,
  },
  backIcon: {
    color: colors.textMuted,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  categoryChipActive: { backgroundColor: colors.primarySelected, borderColor: colors.selectedBorder },
  categoryContent: { gap: 8, paddingHorizontal: 27, paddingVertical: 10 },
  categoryLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  categoryLabelActive: { color: colors.primary },
  categoryScroll: { flexGrow: 0 },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  chipRemove: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  clearIcon: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  container: {
    ...absoluteFill,
    backgroundColor: colors.background,
    zIndex: 200,
  },
  content: {
    paddingBottom: 48,
    paddingHorizontal: 27,
    paddingTop: 10,
  },
  deleteText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 7,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 88,
  },
  emptyTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 27,
    paddingTop: 10,
  },
  recommendTitle: {
    marginTop: 48,
  },
  recommendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    height: 75,
    justifyContent: 'center',
    marginTop: 14,
    width: '100%',
  },
  recommendButtonText: {
    color: colors.onPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  recommendBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  recommendBadgeText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  recommendItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 13,
  },
  recommendList: {
    marginTop: 12,
  },
  recommendStateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
  },
  recommendStateText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  recommendTextGroup: {
    flex: 1,
  },
  resultAddress: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  resultCategory: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  resultGroup: {
    marginTop: 18,
  },
  resultItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: 13,
  },
  resultName: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  registeredStatus: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 26,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 44,
    paddingLeft: 8,
    paddingRight: 17,
  },
  searchIcon: {
    color: colors.textMuted,
    fontSize: 30,
    lineHeight: 32,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  recentDate: { color: colors.textMuted, fontSize: 14 },
  recentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  recentMain: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 14 },
  recentQuery: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '500' },
  recentRemove: { color: colors.textMuted, fontSize: 29, fontWeight: '300', lineHeight: 30 },
  recentRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 15,
    height: 77,
  },
  recentLoading: { marginTop: 18 },
  recentTitle: { color: colors.textStrong, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900',
  },
  shortcut: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 7,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  shortcutIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 31,
    paddingTop: 16,
  },
  shortcutText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  shortcutTitle: {
    marginTop: 64,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
  },
  statusInlineText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MapSearchOverlay;
