import Skeleton from '../../../../shared/components/Skeleton';
import { Text as AppText, TextInput as AppTextInput } from '../../../../shared/components/Typography';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Pressable,
  ScrollView,
  TextInput as NativeTextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import ArtAsset from '../../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../../assets/v2/icons/place/beati_svg.svg';
import CafeAsset from '../../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcAsset from '../../../../../assets/v2/icons/place/etc_svg.svg';
import FashionAsset from '../../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../../assets/v2/icons/place/food_svg.svg';
import HeritageAsset from '../../../../../assets/v2/icons/place/heritage.svg';
import MusicAsset from '../../../../../assets/v2/icons/place/music_svg.svg';
import PopupAsset from '../../../../../assets/v2/icons/place/popup_svg.svg';
import type { MapSearchSelection } from '../../map/selection/model/externalPlace';
import { env } from '../../../../shared/config';
import { useMapSearchFlow, type SearchCategory } from '../hooks/useMapSearchFlow';
import type { RecommendedPlace } from '../../core/place.types';
import {
  formatRecentSearchDate,
  type RecentSearch,
} from '../model/recentSearch';
import type { RecentSearchOwner } from '../services/recentSearchStorage';
import type { AppTheme } from '../../../../shared/theme';

export type { MapSearchSelection };

type MapSearchOverlayProps = {
  centerLat?: number;
  centerLng?: number;
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

function RecentSearchList({
  isRecentSearchHydrating, onClear, onRemove, onSearch, recentQueries, styles, textMutedColor,
}: {
  isRecentSearchHydrating: boolean;
  onClear?: () => void;
  onRemove?: (id: string) => void;
  onSearch: (query: string, category: RecentSearch['category']) => void;
  recentQueries: readonly RecentSearch[];
  styles: ReturnType<typeof createStyles>;
  textMutedColor: string;
}) {
  const { i18n, t } = useTranslation();
  const language = i18n.language;

  return (
    <>
      <View style={styles.recentHeader}>
        <AppText style={styles.recentTitle}>{t('map.searchOverlay.recent')}</AppText>
        {recentQueries.length > 0 && onClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('map.searchOverlay.recentClearAll')}
            onPress={onClear}
          >
            <AppText style={styles.deleteText}>{t('map.searchOverlay.clearAll')}</AppText>
          </Pressable>
        ) : null}
      </View>
      {isRecentSearchHydrating ? (
        <Skeleton variant="chips" accessibilityLabel={t('map.searchOverlay.recentLoading')} style={styles.recentLoading} />
      ) : null}
      {recentQueries.map((item) => (
        <View key={item.id} style={styles.recentRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('map.searchOverlay.recentSearch', { query: item.query })}
            onPress={() => onSearch(item.query, item.category)}
            style={styles.recentMain}
          >
            <View style={styles.recentIcon}>
              <RecentCategoryIcon category={item.category} color={textMutedColor} />
            </View>
            <AppText numberOfLines={1} style={styles.recentQuery}>{item.query}</AppText>
          </Pressable>
          <AppText style={styles.recentDate}>
            {formatRecentSearchDate(item.searchedAt, language)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('map.searchOverlay.recentDelete', { query: item.query })}
            hitSlop={10}
            onPress={() => onRemove?.(item.id)}
          >
            <AppText style={styles.recentRemove}>×</AppText>
          </Pressable>
        </View>
      ))}
    </>
  );
}

function SearchResultGroup({ items, label, onSelect, styles }: {
  items: ReadonlyArray<MapSearchSelection & { category?: string }>;
  label: string;
  onSelect: (place: MapSearchSelection) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!items.length) return null;

  return (
    <View style={styles.resultGroup}>
      <AppText style={styles.sectionTitle}>{label}</AppText>
      {items.map(({ category, ...place }) => (
        <Pressable
          accessibilityRole="button"
          key={place.id}
          style={styles.resultItem}
          onPress={() => onSelect(place)}
        >
          <AppText numberOfLines={1} style={styles.resultName}>{place.name}</AppText>
          <AppText numberOfLines={1} style={styles.resultAddress}>
            {place.roadAddress || place.address}
          </AppText>
          {category ? <AppText numberOfLines={1} style={styles.resultCategory}>{category}</AppText> : null}
        </Pressable>
      ))}
    </View>
  );
}

const MapSearchOverlay = ({
  centerLat,
  centerLng,
  onClose,
  onSelectPlace,
  recentSearchOwner,
}: MapSearchOverlayProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<NativeTextInput>(null);
  const {
    activeCategory, setActiveCategory, query, trimmedQuery, handleQueryChange, runSearch,
    recentQueries, isRecentSearchHydrating, clearRecentSearches, removeRecentSearch,
    hasSearched, isSearching, hasResults, isResultMode, shouldShowEmptyState,
    registeredStatus, registeredResults, externalResults, searchStatusMessage,
  } = useMapSearchFlow({ centerLat, centerLng, recentSearchOwner });

  const handleSelect = (place: MapSearchSelection) => {
    Keyboard.dismiss();
    onSelectPlace(place);
    onClose();
  };

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
                handleQueryChange('');
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
          <RecentSearchList
              isRecentSearchHydrating={isRecentSearchHydrating}
              recentQueries={recentQueries}
              onClear={recentSearchOwner ? () => void clearRecentSearches(recentSearchOwner) : undefined}
              onRemove={recentSearchOwner ? (id) => void removeRecentSearch(id, recentSearchOwner) : undefined}
              onSearch={(nextQuery, category) => void runSearch(nextQuery, category)}
              styles={styles}
              textMutedColor={colors.textMuted}
          />
        ) : null}

        {isSearching && !hasResults ? <Skeleton accessibilityLabel={t('map.searchOverlay.loading')} style={{ padding: 16 }} /> : null}

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

        <SearchResultGroup
          label={t('map.searchOverlay.pingdomResults')}
          items={registeredResults}
          onSelect={handleSelect}
          styles={styles}
        />
        <SearchResultGroup
          label={t('map.searchOverlay.externalResults')}
          items={externalResults}
          onSelect={handleSelect}
          styles={styles}
        />

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
    backgroundColor: colors.primaryAction,
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
