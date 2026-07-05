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
import { placeApi, type PlaceSearchItem } from '../api/placeApi';
import type { KakaoLocalSearchItem } from '../api/kakaoLocalApi';
import { useKakaoLocalSearch } from '../hooks/useKakaoLocalSearch';

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
  onClose: () => void;
  onCreatePlace?: () => void;
  onOpenProfile?: () => void;
  onSelectPlace: (place: MapSearchSelection) => void;
};

const quickActions = [
  { id: 'create', icon: '+', label: '장소 등록' },
  { id: 'nearby', icon: '⌖', label: '내 주변' },
  { id: 'recommend', icon: '◆', label: '추천 장소' },
  { id: 'profile', icon: '●', label: '프로필' },
] as const;

const recommendedQueries = [
  '홍대 맛집',
  '강남 카페',
  '신촌 놀거리',
  '성수 편집샵',
  '이태원 음악바',
  '잠실 보드게임',
];

const toKakaoSelection = (item: KakaoLocalSearchItem): MapSearchSelection => ({
  address: item.address,
  id: item.id,
  isRegisteredPlace: false,
  lat: item.lat,
  lng: item.lng,
  name: item.name,
  roadAddress: item.roadAddress,
});

const toRegisteredSelection = (item: PlaceSearchItem): MapSearchSelection => ({
  address: item.address,
  id: String(item.id),
  isRegisteredPlace: true,
  lat: item.lat,
  lng: item.lng,
  name: item.name,
  roadAddress: item.roadAddress,
});

const MapSearchOverlay = ({
  centerLat,
  centerLng,
  onClose,
  onCreatePlace,
  onOpenProfile,
  onSelectPlace,
}: MapSearchOverlayProps) => {
  const inputRef = useRef<TextInput>(null);
  const searchRequestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [recentQueries, setRecentQueries] = useState(['동물병원', '포장주문', '할인중']);
  const [registeredResults, setRegisteredResults] = useState<PlaceSearchItem[]>([]);
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

    const registeredSearch = placeApi.searchPlaces(normalizedQuery)
      .then((results) => {
        if (requestId === searchRequestIdRef.current) {
          setRegisteredResults(results);
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

  const handleQuickAction = (id: typeof quickActions[number]['id']) => {
    if (id === 'create') {
      onClose();
      onCreatePlace?.();
      return;
    }

    if (id === 'profile') {
      onClose();
      onOpenProfile?.();
      return;
    }

    if (id === 'nearby') {
      void runSearch('내 주변 맛집');
      return;
    }

    void runSearch('추천 장소');
  };

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
            placeholder="집 근처 업체 검색"
            placeholderTextColor="#8b8e98"
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
                <Pressable
                  accessibilityRole="button"
                  key={item}
                  style={styles.chip}
                  onPress={() => void runSearch(item)}
                >
                  <Text style={styles.chipText}>{item}</Text>
                  <Text style={styles.chipRemove}>×</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, styles.shortcutTitle]}>바로가기</Text>
            <View style={styles.shortcutRow}>
              {quickActions.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  style={styles.shortcut}
                  onPress={() => handleQuickAction(item.id)}
                >
                  <View style={styles.shortcutIconBox}>
                    <Text style={styles.shortcutIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.shortcutText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
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
                  {item.roadAddress || item.address}
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

        {!isResultMode ? (
          <>
            <Text style={[styles.sectionTitle, styles.recommendTitle]}>추천 검색</Text>
            <View style={styles.chipRow}>
              {recommendedQueries.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item}
                  style={styles.recommendChip}
                  onPress={() => void runSearch(item)}
                >
                  <Text style={styles.recommendChipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 34,
  },
  backIcon: {
    color: '#3e414b',
    fontSize: 38,
    fontWeight: '300',
    lineHeight: 40,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#eef0f5',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 13,
  },
  chipRemove: {
    color: '#777a84',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chipText: {
    color: '#525661',
    fontSize: 13,
    fontWeight: '800',
  },
  clearIcon: {
    color: '#777a84',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 200,
  },
  content: {
    paddingBottom: 42,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  deleteText: {
    color: '#9a9da7',
    fontSize: 12,
    fontWeight: '700',
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
    gap: 7,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  recommendChip: {
    backgroundColor: '#f3f4f8',
    borderRadius: 18,
    minHeight: 34,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  recommendChipText: {
    color: '#4b4f5c',
    fontSize: 13,
    fontWeight: '800',
  },
  recommendTitle: {
    marginTop: 22,
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
    backgroundColor: '#f0f1f6',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: '#777a84',
    fontSize: 23,
    lineHeight: 26,
  },
  searchInput: {
    color: '#1d2028',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    padding: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#363a45',
    fontSize: 13,
    fontWeight: '900',
  },
  shortcut: {
    alignItems: 'center',
    flex: 1,
    minWidth: 68,
  },
  shortcutIcon: {
    color: '#ff1956',
    fontSize: 22,
    fontWeight: '900',
  },
  shortcutIconBox: {
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 12,
  },
  shortcutText: {
    color: '#3e414b',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    marginTop: 7,
    textAlign: 'center',
  },
  shortcutTitle: {
    marginTop: 24,
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
