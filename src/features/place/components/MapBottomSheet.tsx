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
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';

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
  onDetailPress: (place: DecisionPlace) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onPlacePress: (place: DecisionPlace) => void;
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

const SearchBar = ({
  onFocus,
  onQueryChange,
  onSubmit,
  query,
}: {
  onFocus: () => void;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  query: string;
}) => (
  <View style={styles.searchBar}>
    <Text style={styles.searchIcon}>⌕</Text>
    <TextInput
      accessibilityLabel="장소 검색"
      autoCorrect={false}
      onChangeText={onQueryChange}
      onFocus={onFocus}
      onSubmitEditing={onSubmit}
      placeholder="Search places"
      placeholderTextColor="#8B9099"
      returnKeyType="search"
      style={styles.searchInput}
      value={query}
    />
    <Pressable accessibilityLabel="검색" hitSlop={8} onPress={onSubmit}>
      <Text style={styles.searchAction}>Search</Text>
    </Pressable>
  </View>
);

const FilterRow = ({
  activeFilters,
  onFilterPress,
}: {
  activeFilters: VisitFilter[];
  onFilterPress: (filter: VisitFilter) => void;
}) => (
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
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const PlaceMeta = ({ place }: { place: DecisionPlace }) => (
  <>
    <View style={styles.statusRow}>
      <View style={styles.openDot} />
      <Text style={styles.openText}>Open now</Text>
      <Text style={styles.metaDivider}>·</Text>
      <Text style={styles.waitText}>Wait {place.wait}</Text>
    </View>
    <Text numberOfLines={1} style={styles.verifiedText}>
      Visitor verified · {place.verifiedAgo} ago
    </Text>
  </>
);

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
}) => (
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
        <Text style={styles.secondaryButtonText}>Coupon</Text>
      </Pressable>
      <Pressable onPress={() => onGoNowPress(place)} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Go now</Text>
      </Pressable>
    </View>
  </Pressable>
);

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
}) => (
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
          <Text style={styles.secondaryButtonText}>Get coupon</Text>
        </Pressable>
        <Pressable onPress={() => onGoNowPress(place)} style={styles.previewPrimaryButton}>
          <Text style={styles.primaryButtonText}>Go now</Text>
        </Pressable>
      </View>
    </View>
  </Pressable>
);

const MapBottomSheet = ({
  activeFilters,
  content,
  height,
  onBackHome,
  onCouponPress,
  onDetailPress,
  onFilterPress,
  onGoNowPress,
  onHandlePress,
  onPlacePress,
  onQueryChange,
  onSearchFocus,
  onSubmitSearch,
  panHandlers,
  places,
  selectedPlace,
  sheetTranslateY,
  snapPoint,
}: MapBottomSheetProps) => {
  const query = content.type === 'search' || content.type === 'results' ? content.query : '';
  const isPreview = content.type === 'place-preview' && selectedPlace;
  const showResults = content.type === 'search' || content.type === 'results' || snapPoint === 'expanded';

  return (
    <Animated.View
      style={[styles.bottomSheet, { height, transform: [{ translateY: sheetTranslateY }] }]}
    >
      <View style={styles.handleArea} {...panHandlers}>
        <Pressable accessibilityLabel="하단 시트 크기 변경" hitSlop={10} onPress={onHandlePress}>
          <View style={styles.handle} />
        </Pressable>
      </View>
      <View style={styles.headerArea}>
        <SearchBar
          onFocus={onSearchFocus}
          onQueryChange={onQueryChange}
          onSubmit={onSubmitSearch}
          query={query}
        />
        {!isPreview ? (
          <FilterRow activeFilters={activeFilters} onFilterPress={onFilterPress} />
        ) : (
          <Pressable onPress={onBackHome} style={styles.backRow}>
            <Text style={styles.backText}>‹  Back to recommendations</Text>
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
            <Text style={styles.sectionTitle}>{query ? `Results for “${query}”` : 'Places near you'}</Text>
            <Pressable><Text style={styles.sortText}>Recommended⌄</Text></Pressable>
          </View>
          {places.length > 0 ? (
            places.map((place) => <ResultCard key={place.id} onPress={onPlacePress} place={place} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No matching places yet</Text>
              <Text style={styles.emptyBody}>Try another keyword or remove a visit condition.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.homeContent}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.eyebrow}>LIVE PICKS</Text>
              <Text style={styles.sectionTitle}>Where to go now</Text>
            </View>
            <Pressable onPress={onSearchFocus}><Text style={styles.seeAllText}>See all</Text></Pressable>
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
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, bottom: 0,
    elevation: 18, left: 0, position: 'absolute', right: 0, shadowColor: '#101820',
    shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.16, shadowRadius: 18, zIndex: 50,
  },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  cardTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { backgroundColor: '#FFF0F4', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  categoryBadgeText: { color: '#E8245E', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  chevron: { color: '#B3B7BE', fontSize: 28, fontWeight: '300' },
  distanceText: { color: '#8A9099', fontSize: 11, fontWeight: '700' },
  emptyBody: { color: '#838992', fontSize: 12, marginTop: 7, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 70 },
  emptyTitle: { color: '#2B3139', fontSize: 16, fontWeight: '900' },
  eyebrow: { color: '#F52A62', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 3 },
  filterChip: { alignItems: 'center', backgroundColor: '#F4F5F7', borderColor: '#F4F5F7', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', paddingHorizontal: 14 },
  filterChipActive: { backgroundColor: '#FFF0F4', borderColor: '#FF4A75' },
  filterContent: { gap: 8, paddingRight: 20 },
  filterScroll: { flexGrow: 0, marginTop: 11 },
  filterText: { color: '#5F6670', fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#EA235B' },
  handle: { backgroundColor: '#D5D8DD', borderRadius: 3, height: 5, width: 42 },
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
  previewCard: { backgroundColor: '#FFFFFF', borderColor: '#ECEEF1', borderRadius: 22, borderWidth: 1, overflow: 'hidden', shadowColor: '#18202A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 14 },
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
  recommendationCard: { backgroundColor: '#FFFFFF', borderColor: '#E8EAED', borderRadius: 18, borderWidth: 1, padding: 15, shadowColor: '#151A20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, width: 255 },
  recommendationRow: { gap: 12, paddingBottom: 24, paddingHorizontal: 18, paddingTop: 12 },
  resultBody: { flex: 1 },
  resultCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#ECEEF1', borderBottomWidth: 1, flexDirection: 'row', gap: 13, minHeight: 104, paddingVertical: 13 },
  resultList: { paddingBottom: 40, paddingHorizontal: 18, paddingTop: 17 },
  resultName: { color: '#181C22', flex: 1, fontSize: 15, fontWeight: '900' },
  resultTags: { color: '#737982', fontSize: 11, marginTop: 5 },
  resultThumb: { alignItems: 'center', backgroundColor: '#293C4E', borderRadius: 14, height: 72, justifyContent: 'center', overflow: 'hidden', width: 72 },
  resultThumbText: { color: '#FF7599', fontSize: 25, fontWeight: '900' },
  resultTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 5 },
  searchAction: { color: '#EC245B', fontSize: 12, fontWeight: '900' },
  searchBar: { alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 15, flexDirection: 'row', height: 48, paddingHorizontal: 14 },
  searchIcon: { color: '#252B33', fontSize: 27, lineHeight: 29, marginRight: 8, transform: [{ rotate: '-20deg' }] },
  searchInput: { color: '#151A20', flex: 1, fontSize: 15, fontWeight: '600', height: '100%', padding: 0 },
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
  verifiedText: { color: '#777D86', fontSize: 11, marginTop: 5 },
  waitText: { color: '#4E555F', fontSize: 11, fontWeight: '700' },
});

export default MapBottomSheet;
