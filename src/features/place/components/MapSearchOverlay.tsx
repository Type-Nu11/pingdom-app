import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { placeApi, type PlaceAutocompleteItem } from '../api/placeApi';
import type { KakaoLocalSearchItem } from '../api/kakaoLocalApi';
import { useKakaoLocalSearch } from '../hooks/useKakaoLocalSearch';
import type { RecommendedPlace } from '../model/place.types';

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
  onCreatePlace?: () => void;
  onOpenProfile?: () => void;
  onRefreshRecommendations?: () => Promise<unknown> | void;
  onSelectRecommendedPlace?: (place: RecommendedPlace) => void;
  onSelectPlace: (place: MapSearchSelection) => void;
  recommendedPlaces?: RecommendedPlace[];
};

const quickActions = [
  { id: 'food', icon: '♨', label: '음식', query: '음식' },
  { id: 'music', icon: '♪', label: '음악', query: '음악' },
  { id: 'fashion', icon: '♧', label: '패션', query: '패션' },
  { id: 'game', icon: '⊙', label: '게임', query: '게임' },
  { id: 'more', icon: '•••', label: '더보기', query: '핫플' },
] as const;

const toKakaoSelection = (item: KakaoLocalSearchItem): MapSearchSelection => ({
  address: item.address,
  id: item.id,
  isRegisteredPlace: false,
  lat: item.lat,
  lng: item.lng,
  name: item.name,
  roadAddress: item.roadAddress,
});

const toRegisteredSelection = (item: PlaceAutocompleteItem): MapSearchSelection => ({
  address: item.address,
  id: String(item.id),
  isRegisteredPlace: true,
  lat: item.latitude,
  lng: item.longitude,
  name: item.name,
  roadAddress: item.address,
});

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }

  return `${Math.round(distanceMeters)}m`;
}

function formatRegistrantId(userId: number | undefined) {
  return userId === undefined ? '' : `등록자 ID ${userId}`;
}

const MapSearchOverlay = ({
  centerLat,
  centerLng,
  isRecommendationsError = false,
  isRecommendationsLoading = false,
  onClose,
  onCreatePlace,
  onRefreshRecommendations,
  onSelectRecommendedPlace,
  onSelectPlace,
  recommendedPlaces = [],
}: MapSearchOverlayProps) => {
  const inputRef = useRef<TextInput>(null);
  const searchRequestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recentQueries, setRecentQueries] = useState([
    '대구소프트웨어마이스터고',
    '진주성',
    '이용인집',
    '이용인카페',
    '스타벅스',
    '대소고사감실',
  ]);
  const [registeredResults, setRegisteredResults] = useState<PlaceAutocompleteItem[]>([]);
  const [isSearchingRegisteredPlaces, setIsSearchingRegisteredPlaces] = useState(false);
  const {
    clearSearchResults,
    isSearchingAddress,
    searchPlaces,
    searchResults,
    searchStatusMessage,
  } = useKakaoLocalSearch();
  const isSearching = isSearchingAddress || isSearchingRegisteredPlaces;
  const trimmedQuery = query.trim();
  const hasResults = registeredResults.length > 0 || searchResults.length > 0;
  const isResultMode = hasSearched || trimmedQuery.length > 0;
  const shouldShowEmptyState = hasSearched && !isSearching && !hasResults;

  const handleQueryChange = (nextQuery: string) => {
    searchRequestIdRef.current += 1;
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setHasSearched(false);
    }

    setShowRecommendations(false);
    setRegisteredResults([]);
    setIsSearchingRegisteredPlaces(false);
    clearSearchResults();
  };

  const runSearch = async (nextQuery = query) => {
    const normalizedQuery = nextQuery.trim();

    if (!normalizedQuery) {
      setHasSearched(false);
      setRegisteredResults([]);
      setIsSearchingRegisteredPlaces(false);
      await searchPlaces(normalizedQuery, { centerLat, centerLng });
      return;
    }

    Keyboard.dismiss();
    const requestId = ++searchRequestIdRef.current;
    setHasSearched(true);
    setQuery(normalizedQuery);
    setRecentQueries((prev) => [
      normalizedQuery,
      ...prev.filter((item) => item !== normalizedQuery),
    ].slice(0, 6));

    setIsSearchingRegisteredPlaces(true);
    setRegisteredResults([]);

    const registeredSearch = placeApi.autocompletePlaces({
      keyword: normalizedQuery,
      latitude: centerLat,
      longitude: centerLng,
    })
      .then(({ places }) => {
        if (requestId === searchRequestIdRef.current) {
          setRegisteredResults(places);
        }
      })
      .catch(() => {
        if (requestId === searchRequestIdRef.current) {
          setRegisteredResults([]);
        }
      })
      .finally(() => {
        if (requestId === searchRequestIdRef.current) {
          setIsSearchingRegisteredPlaces(false);
        }
      });
    const localSearch = searchPlaces(normalizedQuery, { centerLat, centerLng });

    await Promise.all([registeredSearch, localSearch]);
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

  const handleQuickAction = (id: typeof quickActions[number]['id']) => {
    const action = quickActions.find((item) => item.id === id);

    if (action) {
      void runSearch(action.query);
    }
  };

  const handleShowRecommendations = () => {
    Keyboard.dismiss();
    setShowRecommendations(true);
    void onRefreshRecommendations?.();
  };

  const recommendationStatusText = isRecommendationsLoading
    ? '추천 장소를 불러오고 있어요'
    : isRecommendationsError
      ? '추천 장소를 불러오지 못했어요'
      : recommendedPlaces.length === 0
        ? '주변 추천 장소가 아직 없어요'
        : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검색 닫기"
          hitSlop={10}
          style={styles.backButton}
          onPress={onClose}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.searchField}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            ref={inputRef}
            returnKeyType="search"
            style={styles.searchInput}
            placeholder="원하는 장소 검색"
            placeholderTextColor="#717481"
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => void runSearch()}
          />
          {trimmedQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="검색어 지우기"
              hitSlop={8}
              onPress={() => {
                searchRequestIdRef.current += 1;
                setQuery('');
                setHasSearched(false);
                setShowRecommendations(false);
                setRegisteredResults([]);
                clearSearchResults();
                inputRef.current?.focus();
              }}
            >
              <Text style={styles.clearIcon}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!isResultMode ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 검색어</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setRecentQueries([])}
              >
                <Text style={styles.deleteText}>전체 삭제</Text>
              </Pressable>
            </View>
            <View style={styles.chipRow}>
              {recentQueries.map((item) => (
                <View key={item} style={styles.chip}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item} 검색`}
                    onPress={() => void runSearch(item)}
                  >
                    <Text style={styles.chipText}>{item}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item} 최근 검색어 삭제`}
                    hitSlop={6}
                    onPress={() => setRecentQueries((prev) => prev.filter((query) => query !== item))}
                  >
                    <Text style={styles.chipRemove}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, styles.shortcutTitle]}>바로가기</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shortcutRow}
            >
              {quickActions.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  style={styles.shortcut}
                  onPress={() => handleQuickAction(item.id)}
                >
                  <Text style={styles.shortcutIcon}>{item.icon}</Text>
                  <Text style={styles.shortcutText}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, styles.recommendTitle]}>장소 추천 받기</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.recommendButton}
              onPress={handleShowRecommendations}
            >
              <Text style={styles.recommendButtonText}>
                {showRecommendations ? '추천 다시 받기' : '장소 추천 받아보기'}
              </Text>
            </Pressable>
            {showRecommendations ? (
              <View style={styles.recommendList}>
                {recommendationStatusText ? (
                  <View style={styles.recommendStateRow}>
                    {isRecommendationsLoading ? (
                      <ActivityIndicator color="#ff1956" size="small" />
                    ) : null}
                    <Text style={styles.recommendStateText}>{recommendationStatusText}</Text>
                  </View>
                ) : recommendedPlaces.slice(0, 5).map((place) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${place.name} 추천 장소 보기`}
                    key={place.id}
                    style={styles.recommendItem}
                    onPress={() => handleRecommendedPlaceSelect(place)}
                  >
                    <View style={styles.recommendBadge}>
                      <Text style={styles.recommendBadgeText}>P</Text>
                    </View>
                    <View style={styles.recommendTextGroup}>
                      <Text numberOfLines={1} style={styles.resultName}>{place.name}</Text>
                      <Text numberOfLines={1} style={styles.resultAddress}>
                        {formatDistance(place.distanceMeters)} · {place.address}
                      </Text>
                      <Text numberOfLines={1} style={styles.resultCategory}>
                        {formatRegistrantId(place.userId)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        {isSearching ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#ff1956" size="small" />
            <Text style={styles.statusInlineText}>장소를 찾고 있어요</Text>
          </View>
        ) : null}

        {registeredResults.length > 0 ? (
          <View style={styles.resultGroup}>
            <Text style={styles.sectionTitle}>핑덤 장소</Text>
            {registeredResults.slice(0, 5).map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleSelect(toRegisteredSelection(item))}
              >
                <Text numberOfLines={1} style={styles.resultName}>{item.name}</Text>
                <Text numberOfLines={1} style={styles.resultAddress}>
                  {item.address}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {searchResults.length > 0 ? (
          <View style={styles.resultGroup}>
            <Text style={styles.sectionTitle}>장소 검색 결과</Text>
            {searchResults.slice(0, 8).map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                style={styles.resultItem}
                onPress={() => handleSelect(toKakaoSelection(item))}
              >
                <Text numberOfLines={1} style={styles.resultName}>{item.name}</Text>
                <Text numberOfLines={1} style={styles.resultAddress}>
                  {item.roadAddress || item.address}
                </Text>
                {item.category ? (
                  <Text numberOfLines={1} style={styles.resultCategory}>{item.category}</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        {shouldShowEmptyState ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>아직 장소를 추가 안 했나봐요!</Text>
            <Text style={styles.emptyDescription}>먼저 하실래요?</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.emptyButton}
              onPress={() => {
                onClose();
                onCreatePlace?.();
              }}
            >
              <Text style={styles.emptyButtonText}>장소 추가하기</Text>
            </Pressable>
          </View>
        ) : !isSearching && !hasResults && searchStatusMessage && !hasSearched ? (
          <Text style={styles.statusText}>{searchStatusMessage}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 32,
  },
  backIcon: {
    color: '#5c606b',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 44,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#f0f0f2',
    borderRadius: 21,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  chipRemove: {
    color: '#7a7d86',
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
    color: '#696d78',
    fontSize: 15,
    fontWeight: '600',
  },
  clearIcon: {
    color: '#777a84',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fbfbfc',
    zIndex: 200,
  },
  content: {
    paddingBottom: 48,
    paddingHorizontal: 31,
    paddingTop: 16,
  },
  deleteText: {
    color: '#737781',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 13,
    height: 46,
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 22,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  emptyDescription: {
    color: '#777a84',
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
    color: '#252934',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  recommendTitle: {
    marginTop: 48,
  },
  recommendButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 18,
    height: 75,
    justifyContent: 'center',
    marginTop: 14,
    width: '100%',
  },
  recommendButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  recommendBadge: {
    alignItems: 'center',
    backgroundColor: '#ffedf3',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  recommendBadgeText: {
    color: '#ff1956',
    fontSize: 15,
    fontWeight: '900',
  },
  recommendItem: {
    alignItems: 'center',
    borderBottomColor: '#eff0f4',
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
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
  recommendTextGroup: {
    flex: 1,
  },
  resultAddress: {
    color: '#636774',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  resultCategory: {
    color: '#9a9da7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  resultGroup: {
    marginTop: 18,
  },
  resultItem: {
    borderBottomColor: '#eff0f4',
    borderBottomWidth: 1,
    paddingVertical: 13,
  },
  resultName: {
    color: '#1d2028',
    fontSize: 16,
    fontWeight: '900',
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: '#e8e8eb',
    borderRadius: 18,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 54,
    paddingHorizontal: 17,
  },
  searchIcon: {
    color: '#717481',
    fontSize: 30,
    lineHeight: 32,
  },
  searchInput: {
    color: '#303440',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    padding: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#2f333d',
    fontSize: 15,
    fontWeight: '900',
  },
  shortcut: {
    alignItems: 'center',
    backgroundColor: '#f4f4f6',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 7,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  shortcutIcon: {
    color: '#ff1956',
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
    color: '#5f626d',
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
    color: '#777a84',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
  },
  statusInlineText: {
    color: '#777a84',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MapSearchOverlay;
