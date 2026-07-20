import React from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import GlassSurface from './GlassSurface';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

export type DecisionPlace = {
  address: string;
  category: string;
  distance: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  tags: string[];
  verifiedAgo: string;
  wait: string;
};

type MapBottomSheetProps = {
  activeFilters: VisitFilter[];
  content: BottomSheetContent;
  height: number;
  onBackHome: () => void;
  onCouponPress: (place: DecisionPlace) => void;
  onCreatePlace?: () => void;
  onDetailPress: (place: DecisionPlace) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  selectedPlace: DecisionPlace | null;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const FILTERS: VisitFilter[] = ['Open now', 'Short wait', 'Coupon', 'Bookable'];
const FILTER_LABEL_KEYS: Record<VisitFilter, string> = {
  'Open now': 'map.decision.filters.openNow',
  'Short wait': 'map.decision.filters.shortWait',
  Coupon: 'map.decision.filters.coupon',
  Bookable: 'map.decision.filters.bookable',
};

const SearchBar = ({
  onFocus,
  onProfilePress,
  onQueryChange,
  onSubmit,
  query,
}: {
  onFocus: () => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  query: string;
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel={t('map.decision.searchAccessibilityLabel')}
          autoCorrect={false}
          onChangeText={onQueryChange}
          onFocus={onFocus}
          onSubmitEditing={onSubmit}
          placeholder={t('map.decision.searchPlaceholder')}
          placeholderTextColor="#8B9099"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
        />
      </View>
      <Pressable
        accessibilityLabel={t('map.decision.profileAccessibilityLabel')}
        hitSlop={8}
        onPress={onProfilePress}
        style={styles.profileIconButton}
      >
        <View style={styles.profileGlyph}>
          <View style={styles.profileGlyphHead} />
          <View style={styles.profileGlyphBody} />
        </View>
      </Pressable>
    </View>
  );
};

const FilterRow = ({
  activeFilters,
  onFilterPress,
}: {
  activeFilters: VisitFilter[];
  onFilterPress: (filter: VisitFilter) => void;
}) => (
  <FilterRowContent activeFilters={activeFilters} onFilterPress={onFilterPress} />
);

const FilterRowContent = ({
  activeFilters,
  onFilterPress,
}: {
  activeFilters: VisitFilter[];
  onFilterPress: (filter: VisitFilter) => void;
}) => {
  const { t } = useTranslation();

  return (
    <ScrollView
    contentContainerStyle={styles.filterContent}
    horizontal
    keyboardShouldPersistTaps="handled"
    showsHorizontalScrollIndicator={false}
    style={styles.filterScroll}
  >
    {FILTERS.map((filter) => {
      const isActive = activeFilters.includes(filter);
      return (
        <Pressable
          accessibilityRole="button"
          key={filter}
          onPress={() => onFilterPress(filter)}
          style={[styles.filterChip, isActive && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {t(FILTER_LABEL_KEYS[filter])}
          </Text>
        </Pressable>
      );
    })}
    </ScrollView>
  );
};

const PlaceMeta = ({ place }: { place: DecisionPlace }) => {
  const { t } = useTranslation();

  return (
    <>
    <View style={styles.statusRow}>
      <View style={styles.openDot} />
      <Text style={styles.openText}>{t('map.decision.status.openNow')}</Text>
      <Text style={styles.metaDivider}>·</Text>
      <Text style={styles.waitText}>{t('map.decision.status.wait', { wait: place.wait })}</Text>
    </View>
    <Text numberOfLines={1} style={styles.verifiedText}>
      {t('map.decision.status.verified', { time: place.verifiedAgo })}
    </Text>
    </>
  );
};

const RecommendationCard = ({
  onCouponPress,
  onGoNowPress,
  onPress,
  place,
}: {
  onCouponPress: (place: DecisionPlace) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onPress: (place: DecisionPlace) => void;
  place: DecisionPlace;
}) => {
  const { t } = useTranslation();

  return (
    <Pressable onPress={() => onPress(place)} style={styles.recommendationCard}>
    <View style={styles.cardTopRow}>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{place.category}</Text>
      </View>
      <Text style={styles.distanceText}>{place.distance}</Text>
    </View>
    <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
    <PlaceMeta place={place} />
    <View style={styles.cardActions}>
      <Pressable onPress={() => onCouponPress(place)} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{t('map.decision.filters.coupon')}</Text>
      </Pressable>
      <Pressable onPress={() => onGoNowPress(place)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{t('map.decision.goNow')}</Text>
      </Pressable>
    </View>
    </Pressable>
  );
};

const ResultCard = ({ onPress, place }: {
  onPress: (place: DecisionPlace) => void;
  place: DecisionPlace;
}) => (
  <Pressable onPress={() => onPress(place)} style={styles.resultCard}>
    <View style={styles.resultThumb}>
      <Text style={styles.resultThumbText}>{place.category.slice(0, 1)}</Text>
    </View>
    <View style={styles.resultBody}>
      <View style={styles.resultTitleRow}>
        <Text numberOfLines={1} style={styles.resultName}>{place.name}</Text>
        <Text style={styles.distanceText}>{place.distance}</Text>
      </View>
      <PlaceMeta place={place} />
      <Text numberOfLines={1} style={styles.resultTags}>{place.tags.join(' · ')}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const PlacePreview = ({
  onCouponPress,
  onDetailPress,
  onGoNowPress,
  place,
}: {
  onCouponPress: (place: DecisionPlace) => void;
  onDetailPress: (place: DecisionPlace) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  place: DecisionPlace;
}) => {
  const { t } = useTranslation();

  return (
    <Pressable onPress={() => onDetailPress(place)} style={styles.previewCard}>
    <View style={styles.previewImage}>
      <View style={styles.previewImageOrb} />
      <View style={styles.previewImageLabel}>
        <Text style={styles.previewImageLabelText}>{place.category}</Text>
      </View>
    </View>
    <View style={styles.previewBody}>
      <View style={styles.previewTitleRow}>
        <View style={styles.previewTitleBody}>
          <Text numberOfLines={1} style={styles.previewName}>{place.name.toUpperCase()}</Text>
          <Text numberOfLines={1} style={styles.previewAddress}>{place.address}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      <PlaceMeta place={place} />
      <View style={styles.tagRow}>
        {place.tags.map((tag) => (
          <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
        ))}
      </View>
      <View style={styles.previewActions}>
        <Pressable onPress={() => onCouponPress(place)} style={styles.previewSecondaryButton}>
          <Text style={styles.secondaryButtonText}>{t('map.decision.getCoupon')}</Text>
        </Pressable>
        <Pressable onPress={() => onGoNowPress(place)} style={styles.previewPrimaryButton}>
          <Text style={styles.primaryButtonText}>{t('map.decision.goNow')}</Text>
        </Pressable>
      </View>
    </View>
    </Pressable>
  );
};

const MapBottomSheet = ({
  activeFilters,
  content,
  height,
  onBackHome,
  onCouponPress,
  onCreatePlace,
  onDetailPress,
  onFilterPress,
  onGoNowPress,
  onHandlePress,
  onPlacePress,
  onProfilePress,
  onQueryChange,
  onSearchFocus,
  onSubmitSearch,
  panHandlers,
  places,
  selectedPlace,
  sheetTranslateY,
  snapPoint,
}: MapBottomSheetProps) => {
  const { t } = useTranslation();
  const query = content.type === 'search' || content.type === 'results' ? content.query : '';
  const isPreview = content.type === 'place-preview' && selectedPlace;
  const showResults = content.type === 'search' || content.type === 'results' || snapPoint === 'expanded';

  return (
    <Animated.View
      style={[styles.bottomSheet, { height, transform: [{ translateY: sheetTranslateY }] }]}
    >
      <GlassSurface
        intensity={76}
        pointerEvents="none"
        style={styles.sheetGlass}
        tintColor="rgba(255,255,255,0.18)"
      />
      <View pointerEvents="none" style={styles.topSheen} />
      <View style={styles.handleArea} {...panHandlers}>
        <Pressable accessibilityLabel="하단 시트 크기 변경" hitSlop={10} onPress={onHandlePress}>
          <View style={styles.handle} />
        </Pressable>
      </View>
      <View style={styles.headerArea}>
        <SearchBar
          onFocus={onSearchFocus}
          onProfilePress={onProfilePress}
          onQueryChange={onQueryChange}
          onSubmit={onSubmitSearch}
          query={query}
        />
        {!isPreview ? (
          <View style={styles.sheetActionRow}>
            <Pressable
              accessibilityLabel={t('map.actions.addPlace')}
              accessibilityRole="button"
              hitSlop={6}
              onPress={onCreatePlace}
              style={({ pressed }) => [
                styles.createPlaceButton,
                pressed && styles.createPlaceButtonPressed,
              ]}
            >
              <Text style={styles.createPlaceIcon}>＋</Text>
              <Text style={styles.createPlaceText}>{t('map.actions.addPlace')}</Text>
            </Pressable>
            <View style={styles.filterRowBody}>
              <FilterRow activeFilters={activeFilters} onFilterPress={onFilterPress} />
            </View>
          </View>
        ) : (
          <Pressable onPress={onBackHome} style={styles.backRow}>
            <Text style={styles.backText}>‹  {t('map.decision.backToRecommendations')}</Text>
          </Pressable>
        )}
      </View>

      {isPreview ? (
        <ScrollView contentContainerStyle={styles.previewScrollContent} showsVerticalScrollIndicator={false}>
          <PlacePreview
            onCouponPress={onCouponPress}
            onDetailPress={onDetailPress}
            onGoNowPress={onGoNowPress}
            place={selectedPlace}
          />
        </ScrollView>
      ) : showResults ? (
        <ScrollView
          contentContainerStyle={styles.resultList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              {query ? t('map.decision.resultsFor', { query }) : t('map.decision.placesNearYou')}
            </Text>
            <Pressable><Text style={styles.sortText}>{t('map.decision.recommended')}⌄</Text></Pressable>
          </View>
          {places.length > 0 ? (
            places.map((place) => <ResultCard key={place.id} onPress={onPlacePress} place={place} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t('map.decision.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('map.decision.emptyBody')}</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.homeContent}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.eyebrow}>{t('map.decision.livePicks')}</Text>
              <Text style={styles.sectionTitle}>{t('map.decision.whereToGo')}</Text>
            </View>
            <Pressable onPress={onSearchFocus}><Text style={styles.seeAllText}>{t('map.decision.seeAll')}</Text></Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.recommendationRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {places.map((place) => (
              <RecommendationCard
                key={place.id}
                onCouponPress={onCouponPress}
                onGoNowPress={onGoNowPress}
                onPress={onPlacePress}
                place={place}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backRow: { height: 40, justifyContent: 'center' },
  backText: { color: '#5F6670', fontSize: 13, fontWeight: '700' },
  bottomSheet: {
    backgroundColor: 'rgba(247,250,252,0.38)', borderColor: 'rgba(255,255,255,0.76)',
    borderTopLeftRadius: 30, borderTopRightRadius: 30, borderTopWidth: 1, bottom: 0,
    elevation: 18, left: 0, position: 'absolute', right: 0, shadowColor: '#101820',
    shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.16, shadowRadius: 18, zIndex: 50,
  },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  cardTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { backgroundColor: '#FFF0F4', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  categoryBadgeText: { color: '#E8245E', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  chevron: { color: '#B3B7BE', fontSize: 28, fontWeight: '300' },
  createPlaceButton: { alignItems: 'center', backgroundColor: '#F52A62', borderRadius: 18, flexDirection: 'row', gap: 3, height: 36, justifyContent: 'center', paddingHorizontal: 13 },
  createPlaceButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  createPlaceIcon: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', lineHeight: 19 },
  createPlaceText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  distanceText: { color: '#8A9099', fontSize: 11, fontWeight: '700' },
  emptyBody: { color: '#838992', fontSize: 12, marginTop: 7, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 70 },
  emptyTitle: { color: '#2B3139', fontSize: 16, fontWeight: '900' },
  eyebrow: { color: '#F52A62', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 3 },
  filterChip: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.68)', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', paddingHorizontal: 14 },
  filterChipActive: { backgroundColor: '#FFF0F4', borderColor: '#FF4A75' },
  filterContent: { gap: 8, paddingRight: 20 },
  filterScroll: { flexGrow: 0 },
  filterText: { color: '#5F6670', fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#EA235B' },
  filterRowBody: { flex: 1, overflow: 'hidden' },
  handle: { backgroundColor: 'rgba(75,83,94,0.3)', borderRadius: 3, height: 5, width: 42 },
  handleArea: { alignItems: 'center', height: 24, justifyContent: 'center' },
  headerArea: { paddingHorizontal: 18 },
  homeContent: { paddingTop: 16 },
  metaDivider: { color: '#B0B4BA', fontSize: 11 },
  openDot: { backgroundColor: '#18B66A', borderRadius: 4, height: 7, width: 7 },
  openText: { color: '#158B56', fontSize: 11, fontWeight: '800' },
  placeName: { color: '#161A20', fontSize: 17, fontWeight: '900', marginBottom: 7, marginTop: 10 },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  previewAddress: { color: '#8A9099', fontSize: 12, marginTop: 3 },
  previewBody: { padding: 18 },
  previewCard: { backgroundColor: 'rgba(255,255,255,0.62)', borderColor: 'rgba(255,255,255,0.82)', borderRadius: 22, borderWidth: 1, overflow: 'hidden', shadowColor: '#18202A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 14 },
  previewImage: { backgroundColor: '#26394A', height: 145, justifyContent: 'flex-end', overflow: 'hidden', padding: 14 },
  previewImageLabel: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
  previewImageLabelText: { color: '#D91F56', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  previewImageOrb: { backgroundColor: '#F5567F', borderRadius: 90, height: 180, opacity: 0.72, position: 'absolute', right: -20, top: -55, width: 180 },
  previewName: { color: '#151A20', fontSize: 19, fontWeight: '900' },
  previewPrimaryButton: { alignItems: 'center', backgroundColor: '#F52A62', borderRadius: 13, flex: 1, height: 48, justifyContent: 'center' },
  previewScrollContent: { padding: 18, paddingBottom: 48 },
  previewSecondaryButton: { alignItems: 'center', backgroundColor: '#FFF0F4', borderRadius: 13, flex: 1, height: 48, justifyContent: 'center' },
  previewTitleBody: { flex: 1 },
  previewTitleRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  primaryButton: { alignItems: 'center', backgroundColor: '#F52A62', borderRadius: 10, flex: 1, height: 35, justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  recommendationCard: { backgroundColor: 'rgba(255,255,255,0.58)', borderColor: 'rgba(255,255,255,0.82)', borderRadius: 20, borderWidth: 1, padding: 15, shadowColor: '#151A20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, width: 255 },
  recommendationRow: { gap: 12, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 12 },
  resultBody: { flex: 1 },
  resultCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.28)', borderBottomColor: 'rgba(255,255,255,0.72)', borderBottomWidth: 1, flexDirection: 'row', gap: 13, minHeight: 104, paddingHorizontal: 8, paddingVertical: 13 },
  resultList: { paddingBottom: 40, paddingHorizontal: 18, paddingTop: 17 },
  resultName: { color: '#181C22', flex: 1, fontSize: 15, fontWeight: '900' },
  resultTags: { color: '#737982', fontSize: 11, marginTop: 5 },
  resultThumb: { alignItems: 'center', backgroundColor: '#293C4E', borderRadius: 14, height: 72, justifyContent: 'center', overflow: 'hidden', width: 72 },
  resultThumbText: { color: '#FF7599', fontSize: 25, fontWeight: '900' },
  resultTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 5 },
  searchBar: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.54)', borderColor: 'rgba(255,255,255,0.8)', borderRadius: 16, borderWidth: 1, flex: 1, flexDirection: 'row', height: 48, paddingHorizontal: 14 },
  sheetGlass: { ...StyleSheet.absoluteFillObject, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  searchIcon: { color: '#252B33', fontSize: 27, lineHeight: 29, marginRight: 8, transform: [{ rotate: '-20deg' }] },
  searchInput: { color: '#151A20', flex: 1, fontSize: 15, fontWeight: '600', height: '100%', padding: 0 },
  profileGlyph: { alignItems: 'center', height: 18, justifyContent: 'flex-end', overflow: 'hidden', width: 18 },
  profileGlyphBody: { backgroundColor: '#5C636D', borderTopLeftRadius: 7, borderTopRightRadius: 7, height: 9, width: 14 },
  profileGlyphHead: { backgroundColor: '#5C636D', borderRadius: 4, height: 8, marginBottom: 2, width: 8 },
  profileIconButton: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.8)', borderRadius: 16, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  searchRow: { flexDirection: 'row', gap: 8 },
  sheetActionRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 11 },
  secondaryButton: { alignItems: 'center', backgroundColor: '#FFF0F4', borderRadius: 10, flex: 1, height: 35, justifyContent: 'center' },
  secondaryButtonText: { color: '#E8245E', fontSize: 12, fontWeight: '900' },
  sectionTitle: { color: '#171B21', fontSize: 20, fontWeight: '900' },
  sectionTitleRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 },
  seeAllText: { color: '#EC245B', fontSize: 12, fontWeight: '800' },
  sortText: { color: '#707680', fontSize: 11, fontWeight: '700' },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  tag: { backgroundColor: '#F3F4F6', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tagText: { color: '#5E6570', fontSize: 10, fontWeight: '800' },
  topSheen: { backgroundColor: 'rgba(255,255,255,0.64)', borderRadius: 2, height: 1, left: 34, position: 'absolute', right: 34, top: 1 },
  verifiedText: { color: '#777D86', fontSize: 11, marginTop: 5 },
  waitText: { color: '#4E555F', fontSize: 11, fontWeight: '700' },
});

export default MapBottomSheet;
