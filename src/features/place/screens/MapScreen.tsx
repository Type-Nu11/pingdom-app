import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RestaurantMarkerAsset from '../../../assets/v2/icons/place/Restaurant.svg';
import { registerAndroidBackOverride } from '../../../shared/navigation/androidBackOverride';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import { useTranslation } from 'react-i18next';
import { useMapSettingsStore } from '../../../app/store/mapSettingsStore';
import { useAuthStore } from '../../../app/store/authStore';
import MapBottomSheet, {
  type BottomSheetContent,
  type DecisionPlace,
  type MapPreviewFallbackContent,
  type VisitFilter,
} from '../components/MapBottomSheet';
import FavoritePlacesBottomSheet from '../components/FavoritePlacesBottomSheet';
import ReservationBottomSheet from '../../reservation/components/ReservationBottomSheet';
import MapCanvas from '../components/MapCanvas';
import MapSearchOverlay from '../components/MapSearchOverlay';
import MapTopOverlay, { type MapCategoryId } from '../components/MapTopOverlay';
import type { KakaoMapMarkerPressEvent } from '../components/KakaoMapCard';
import { useBottomSheet } from '../hooks/useBottomSheet';
import {
  useBookmarkedPlaceMembership,
  useBookmarkedPlaces,
} from '../hooks/useBookmarkedPlaces';
import { usePlaceBookmark } from '../hooks/usePlaceBookmark';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { usePlaces } from '../hooks/usePlaces';
import { useMapPlaceRankings } from '../hooks/useMapPlaceRankings';
import { usePlaceRecommendations } from '../hooks/usePlaceRecommendations';
import { useRecordPlaceRecommendationClick } from '../hooks/useRecordPlaceRecommendationClick';
import { useRecommendationExplanation } from '../../../v2/features/place-exploration';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import { useProfile } from '../../profile/hooks/useProfile';
import type { MapMarker, Place } from '../model/place.types';
import {
  getPlaceRankingState,
  toRankingDecisionPlaces,
  toRankingImageUrls,
} from '../model/placeRankingPresentation';
import { normalizePlaceCategory } from '../utils/placeCategory';
import { getMapBackAction } from '../utils/mapBack';
import {
  createRecommendationPresentation,
  getRecommendationState,
} from '../model/recommendationPresentation';
import { applyBookmarkStateToMarkers } from '../utils/mapMarkerBookmarks';
import { toFavoritePlaceImageUrls } from '../utils/favoritePlaceImages';
import {
  findMapPreviewPlace,
  mergeMapPreviewPlaces,
} from '../utils/mapPreviewSelection';
import { createFocusedRecommendationMarker } from '../utils/recommendationMarkers';

const MOCK_PLACE_IDS = [138001, 138002, 138003] as const;

const MOCK_PLACE_PREVIEW_CONTENT_BY_ID: Record<string, MapPreviewFallbackContent> = {
  [String(MOCK_PLACE_IDS[0])]: {
    amenities: ['english', 'parking'],
    businessHours: '20:00에 영업 종료',
    coupons: [
      { period: '26.08.18~27.08.18', title: '생일 10% 할인 쿠폰' },
      { period: '26.08.18~27.08.18', title: '생일 10% 할인 쿠폰' },
    ],
    imageUrls: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=85',
    ],
    menuItems: [
      { description: '성능좋은 짜장면', name: '짜장면', price: '9,000원' },
      { description: '성능좋은 짜장면', name: '짜장면', price: '9,000원' },
      { description: '성능좋은 짜장면', name: '짜장면', price: '9,000원' },
    ],
    phone: '0507-1418-9977 · 010-1234-5678',
    reviewCount: 123,
    reviewHighlights: [
      { count: 132, label: '사진 찍기 좋아요' },
      { count: 98, label: '매장이 깨끗해요' },
      { count: 76, label: '다국어 설명이 잘 되어 있어요' },
      { count: 54, label: '친절해요' },
      { count: 41, label: '음식이 맛있어요' },
    ],
    reviewParticipantCount: 284,
    reviews: [
      {
        author: '이용인',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=160&q=80',
        createdAt: '26.08.18 · 2시간 전',
        hiddenTags: ['사진 찍기 좋아요', '친절해요', '매장이 깨끗해요'],
        tags: ['음식이 맛있어요'],
        text: '암소 된장찌개가 더 맛있는 것 같아요...',
      },
      {
        author: '이용인',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=160&q=80',
        createdAt: '26.08.18 · 2시간 전',
        hiddenTags: ['사진 찍기 좋아요', '친절해요', '매장이 깨끗해요'],
        photoCount: 2,
        tags: ['음식이 맛있어요'],
        text: '암소 된장찌개가 더 맛있는 것 같아요...',
      },
      {
        author: '이용인',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=160&q=80',
        createdAt: '26.08.18 · 2시간 전',
        tags: ['음식이 맛있어요', '사진 찍기 좋아요', '친절해요', '매장이 깨끗해요'],
        text: '먼 옛날, 한 고을에 이용인(李龍人)이라 불리는 자가 있었다. 사람들은 그를 두고 이르길, 태어날 때 하늘에서 청룡이 내려와 그의 이름 석 자에 용(龍) 자를 새기고 갔다 하였다.',
      },
      {
        author: '이용인',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=160&q=80',
        createdAt: '26.08.18 · 2시간 전',
        hiddenTags: ['사진 찍기 좋아요', '친절해요', '매장이 깨끗해요'],
        tags: ['음식이 맛있어요'],
        text: '암소 된장찌개가 더 맛있는 것 같아요...',
      },
    ],
    statusDescription: '23명이 검증했어요!',
    statusEmphasis: '영업 중',
  },
};

// Matches SHEET_RESTING_GAP in MapBottomSheet.
const SHEET_RESTING_GAP = 8;

const makeMockPlaces = (latitude: number, longitude: number): DecisionPlace[] => [
  {
    address: '대구 달성군 구지면',
    category: '음식점',
    distance: '12.3km',
    distanceMeters: 12300,
    id: MOCK_PLACE_IDS[0],
    latitude: latitude + 0.006,
    longitude: longitude - 0.006,
    name: '대성반점',
    tags: ['English menu', 'Parking'],
    verifiedAgo: '18m',
    verifiedMinutes: 18,
    wait: '10–20 min',
    waitMinutes: [10, 20],
  },
  {
    address: 'Yeonmujang-gil · 7 min walk',
    category: 'CAFE',
    distance: '580 m',
    distanceMeters: 580,
    id: MOCK_PLACE_IDS[1],
    latitude: latitude - 0.004,
    longitude: longitude + 0.008,
    name: '레이어드 커피 랩',
    tags: ['Short wait', 'Bookable'],
    verifiedAgo: '7m',
    verifiedMinutes: 7,
    wait: '5–10 min',
    waitMinutes: [5, 10],
  },
  {
    address: 'Ttukseom-ro · 10 min walk',
    category: 'DINING',
    distance: '810 m',
    distanceMeters: 810,
    id: MOCK_PLACE_IDS[2],
    latitude: latitude + 0.002,
    longitude: longitude + 0.012,
    name: '커먼 테이블 성수',
    tags: ['Coupon', 'Bookable'],
    verifiedAgo: '24m',
    verifiedMinutes: 24,
    wait: '20–30 min',
    waitMinutes: [20, 30],
  },
];

const toDecisionPlace = (place: Place): DecisionPlace => ({
  ...place,
  address: place.address || 'Nearby place',
  category: (place.category || 'PLACE').toUpperCase(),
  distance: place.distanceMeters ? `${Math.round(place.distanceMeters)} m` : 'Nearby',
  distanceMeters: place.distanceMeters,
  id: place.id,
  latitude: place.latitude,
  longitude: place.longitude,
  name: place.name,
  recommendationReason: 'reason' in place && typeof place.reason === 'string'
    ? place.reason
    : undefined,
  tags: ['Visitor verified'],
  verifiedAgo: 'recently',
  verifiedMinutes: 0,
  wait: '10–20 min',
  waitMinutes: [10, 20],
});

type MapScreenProps = {
  initialSection?: 'favorites' | 'map' | 'reservations';
  notificationLikeContext?: {
    notificationsId?: string;
    postId?: string;
  } | null;
  onClearOpenedBookmarkedPlace?: () => void;
  onCreateReservation?: (place: {
    category: string;
    id: number;
    imageUrl?: string;
    name: string;
  }) => void;
  onOpenProfile?: () => void;
  onOpenReservation?: (reservationId: number) => void;
  onOpenVerification?: () => void;
  openedBookmarkedPlaceId?: number | null;
};

export default function MapScreen({
  initialSection = 'map',
  onClearOpenedBookmarkedPlace,
  onCreateReservation,
  onOpenProfile,
  onOpenReservation,
  onOpenVerification,
  openedBookmarkedPlaceId,
}: MapScreenProps) {
  const { i18n, t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { center, userLat, userLng } = useCurrentLocation();
  const { markers: apiMarkers, places: apiPlaces } = usePlaces();
  const [rankingFeed, setRankingFeed] = useState<'local' | 'national'>('local');
  const recommendationRadiusKm = useMapSettingsStore((state) => state.recommendationRadiusKm);
  const {
    appliedActivityIntent,
    appliedTravelPurposes,
    isError: isRecommendationsError,
    isLoading: isRecommendationsLoading,
    limitReasons,
    places: recommendedPlaces,
    recommendationRequestId,
    recommendationVersion,
    refetch: refetchRecommendations,
  } = usePlaceRecommendations({
    latitude: userLat,
    limit: 8,
    longitude: userLng,
    radiusKm: recommendationRadiusKm,
  });
  const { recordRecommendationClick } = useRecordPlaceRecommendationClick();
  const recommendationExplanation = useRecommendationExplanation(
    recommendationRequestId ?? '',
    { enabled: Boolean(recommendationRequestId) },
  );
  const { profile } = useProfile();
  const isAuthHydrating = useAuthStore((state) => state.isHydrating);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [activeFilters, setActiveFilters] = useState<VisitFilter[]>([]);
  const [content, setContent] = useState<BottomSheetContent>({ type: 'home' });
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MapCategoryId>('all');
  const [mapSection, setMapSection] = useState<'map' | 'favorites' | 'reservations'>(initialSection);

  useEffect(() => {
    setMapSection(initialSection);
  }, [initialSection]);
  const canQueryBookmarks = isLoggedIn && !isAuthHydrating;
  const {
    fetchNextPage: fetchNextFavoritePage,
    hasNextPage: hasNextFavoritePage,
    isError: isFavoritesError,
    isFetchNextPageError: isFetchNextFavoritePageError,
    isFetchingNextPage: isFetchingNextFavoritePage,
    isLoading: isFavoritesLoading,
    isUnauthorized: isFavoritesUnauthorized,
    places: bookmarkedPlaces,
    refetch: refetchFavorites,
  } = useBookmarkedPlaces(canQueryBookmarks && mapSection === 'favorites');
  const {
    bookmarkedPlaceIds,
    isLoading: isBookmarkMembershipLoading,
  } = useBookmarkedPlaceMembership(canQueryBookmarks);
  const {
    pendingPlaceIds: bookmarkPendingPlaceIds,
    togglePlaceBookmark,
  } = usePlaceBookmark();

  const expandedSheetTop = insets.top + 2 + 60 + 8;
  // Sheet spans to the screen bottom; the resting 8px gap is applied inside the sheet
  // so the expanded state can go edge to edge without drawing outside its parent.
  const fullSheetHeight = Math.round(height - expandedSheetTop);
  const designScale = Math.min(Math.max(width / 402, 0.9), 1.1);
  const collapsedVisibleHeight = Math.round(101 * designScale) + SHEET_RESTING_GAP;
  const mediumVisibleHeight = Math.round(418 * designScale) + SHEET_RESTING_GAP;
  const collapsedTranslateY = fullSheetHeight - collapsedVisibleHeight;
  const mediumTranslateY = fullSheetHeight - mediumVisibleHeight;
  const { panHandlers, sheetChromeBottom, sheetTranslateY, snapPoint, snapTo } = useBottomSheet({
    collapsedTranslateY,
    initialSnapPoint: 'medium',
    mediumTranslateY,
  });

  useEffect(() => {
    const language = profile?.language?.trim().toLowerCase();
    const nextLanguage = language === 'korean' || language === '한국어'
      ? 'ko'
      : language === 'english' || language === '영어'
        ? 'en'
        : language?.split('-')[0];

    if (nextLanguage && i18n.language !== nextLanguage) {
      void i18n.changeLanguage(nextLanguage);
    }
  }, [i18n, profile?.language]);

  const mockPlaces = useMemo(
    () => makeMockPlaces(center.lat, center.lng),
    [center.lat, center.lng],
  );

  // 우리 지역 핫플과 전국 트렌드는 서버 랭킹 계약(GET /map/place-rankings)만 사용한다.
  const rankings = useMapPlaceRankings(rankingFeed === 'local'
    ? {
      latitude: userLat ?? center.lat,
      longitude: userLng ?? center.lng,
      radiusKm: recommendationRadiusKm,
      scope: 'LOCAL',
    }
    : { scope: 'NATIONAL' });
  const rankingPlaces = useMemo(
    () => toRankingDecisionPlaces(rankings.items),
    [rankings.items],
  );
  const rankingImageUrlsByPlaceId = useMemo(
    () => toRankingImageUrls(rankings.items),
    [rankings.items],
  );
  const rankingState = getPlaceRankingState({
    isEmpty: rankings.isEmpty,
    isError: rankings.isError,
    isLoading: rankings.isLoading,
  });
  const recommendationPlaces = useMemo(() => {
    const explanationByPlaceId = new Map(
      (recommendationExplanation.data?.items ?? [])
        .filter((item) => typeof item.placeId === 'number')
        .map((item) => [item.placeId as number, item]),
    );

    return recommendedPlaces.map((place) => {
      const explanation = explanationByPlaceId.get(place.id);
      return {
        ...toDecisionPlace(place),
        recommendationRank: explanation?.ranking,
        recommendationSource: explanation?.source,
      };
    });
  }, [recommendationExplanation.data?.items, recommendedPlaces]);
  const allPlaces = useMemo(() => {
    const serverPlaces = mergeMapPreviewPlaces(
      recommendationPlaces,
      apiPlaces.map(toDecisionPlace),
    );

    // Keep the map demonstrable on an empty development database. These markers are
    // only rendered with their matching preview places and disappear once server data exists.
    return serverPlaces.length > 0 ? serverPlaces : mockPlaces;
  }, [apiPlaces, mockPlaces, recommendationPlaces]);
  const recommendationPresentation = useMemo(() => createRecommendationPresentation({
    appliedActivityIntent,
    appliedTravelPurposes,
    limitReasons,
  }), [
    appliedActivityIntent,
    appliedTravelPurposes,
    limitReasons,
  ]);
  const recommendationsState = getRecommendationState({
    isError: isRecommendationsError,
    isLoading: isRecommendationsLoading,
    places: recommendationPlaces,
  });
  const favoritePlaces = useMemo(
    () => bookmarkedPlaces.map(toDecisionPlace),
    [bookmarkedPlaces],
  );
  const { imageUrlsByPlaceId: favoritePreviewImages } = usePlacePreviewImages(
    bookmarkedPlaces,
    canQueryBookmarks && mapSection === 'favorites',
  );
  const favoriteImageUrlsByPlaceId = useMemo(
    () => toFavoritePlaceImageUrls(favoritePreviewImages),
    [favoritePreviewImages],
  );
  const selectedPlace = useMemo(() => {
    if (content.type !== 'place-preview') return null;
    const selectedFromCurrentData = [...allPlaces, ...favoritePlaces]
      .find((place) => place.id === content.placeId);

    // A recommendation response can replace an empty list immediately after a
    // temporary marker is tapped. Preserve that selected mock place until the
    // user closes it so the response cannot dismiss the preview underneath them.
    return selectedFromCurrentData
      ?? mockPlaces.find((place) => place.id === content.placeId)
      ?? null;
  }, [allPlaces, content, favoritePlaces, mockPlaces]);
  useEffect(() => {
    if (content.type !== 'place-preview' || selectedPlace) return;

    setContent({ type: 'home' });
    setIsFollowingUser(true);
    snapTo('medium');
  }, [content, selectedPlace, snapTo]);
  const query = content.type === 'search' || content.type === 'results' ? content.query : '';
  const visiblePlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allPlaces.filter((place) => {
      const matchesQuery = !normalizedQuery || [place.name, place.category, place.address]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesFilters = activeFilters.every((filter) => {
        if (filter === 'Open now') return true;
        if (filter === 'Short wait') return place.wait.startsWith('5') || place.wait.startsWith('10');
        return place.tags.includes(filter);
      });

      return matchesQuery && matchesFilters;
    });
  }, [activeFilters, allPlaces, query]);
  const sheetPlaces = useMemo(() => {
    if (
      content.type === 'place-preview'
      && selectedPlace
      && !visiblePlaces.some((place) => place.id === selectedPlace.id)
    ) {
      return [selectedPlace, ...visiblePlaces];
    }

    return visiblePlaces;
  }, [content.type, selectedPlace, visiblePlaces]);
  const mapMarkers = useMemo<MapMarker[]>(() => {
    const liveMarkerIds = new Set(apiMarkers.map((marker) => marker.id));
    const recommendationPlaceIds = new Set(recommendationPlaces.map((place) => place.id));
    const focusedRecommendationMarker = createFocusedRecommendationMarker(
      content.type === 'place-preview' ? selectedPlace : null,
      recommendationPlaceIds,
      liveMarkerIds,
    );
    const visibleMarkerIds = new Set(liveMarkerIds);
    if (focusedRecommendationMarker) visibleMarkerIds.add(focusedRecommendationMarker.id);
    const markers = applyBookmarkStateToMarkers([
      ...apiMarkers.map((marker) => ({
        ...marker,
        category: normalizePlaceCategory(marker.category),
      })),
      ...(focusedRecommendationMarker ? [focusedRecommendationMarker] : []),
    ], bookmarkedPlaceIds);

    if (activeCategory === 'all') return markers;
    const markerCategory: MapMarker['category'] = activeCategory === 'fashion'
      ? 'fashion'
      : activeCategory === 'music'
        ? 'music'
        : activeCategory === 'food' || activeCategory === 'cafe'
          ? 'food'
          : 'etc';

    return markers.filter((marker) => marker.category === markerCategory);
  }, [
    activeCategory,
    apiMarkers,
    bookmarkedPlaceIds,
    content.type,
    apiPlaces.length,
    mockPlaces,
    recommendationPlaces,
    selectedPlace,
  ]);

  useEffect(() => {
    if (openedBookmarkedPlaceId === null || openedBookmarkedPlaceId === undefined) return;

    setContent({ type: 'place-preview', placeId: openedBookmarkedPlaceId });
    setIsFollowingUser(false);
    snapTo('medium');
    onClearOpenedBookmarkedPlace?.();
  // Only react when a bookmarked place is explicitly opened.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedBookmarkedPlaceId]);

  const handleMarkerPress = (event: KakaoMapMarkerPressEvent) => {
    const place = findMapPreviewPlace(event.nativeEvent.markerId, [
      ...allPlaces,
      ...favoritePlaces,
      ...mockPlaces,
    ]);
    if (!place) return;

    if (content.type === 'place-preview' && content.placeId === place.id) {
      setContent({ type: 'home' });
      setIsFollowingUser(true);
      snapTo('medium');
      return;
    }

    setContent({ type: 'place-preview', placeId: place.id });
    setIsFollowingUser(false);
    snapTo('medium');
  };
  const handlePlacePress = (place: DecisionPlace) => {
    const isRecommendation = recommendedPlaces.some((item) => item.id === place.id);
    if (isRecommendation && recommendationRequestId && recommendationVersion) {
      void recordRecommendationClick({
        placeId: place.id,
        recommendationVersion,
        requestId: recommendationRequestId,
      }).catch((error) => {
        if (__DEV__) console.warn('[recommendation-click]', error);
      });
    }
    setContent({ type: 'place-preview', placeId: place.id });
    setIsFollowingUser(false);
    snapTo('medium');
  };
  const handleQueryChange = (nextQuery: string) => {
    setContent({ type: 'search', query: nextQuery });
    snapTo('expanded');
  };
  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };
  const handleFilterPress = (filter: VisitFilter) => {
    setActiveFilters((current) => (
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    ));
  };
  const handleBackHome = () => {
    setContent({ type: 'home' });
    setIsFollowingUser(true);
    snapTo('medium');
  };

  useFocusEffect(useCallback(() => {
    return registerAndroidBackOverride(() => {
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return true;
      }

      if (mapSection === 'favorites') {
        setMapSection('map');
        snapTo('medium');
        return true;
      }

      const action = getMapBackAction(content, snapPoint);

      if (action === 'show-home') {
        setContent({ type: 'home' });
        setIsFollowingUser(true);
        snapTo('medium');
        return true;
      }

      if (action === 'collapse-sheet') {
        snapTo('collapsed');
        return true;
      }

      return false;
    });
  }, [content, isSearchOpen, mapSection, snapPoint, snapTo]));
  const handleGoNow = (place: DecisionPlace) => {
    Alert.alert(
      t('map.decision.goNow'),
      t('map.decision.goNowMessage', { placeName: place.name, defaultValue: `Directions to ${place.name} are ready.` }),
      [{ text: t('map.search.confirm') }],
    );
  };
  const handleCoupon = (place: DecisionPlace) => {
    Alert.alert(
      t('map.decision.getCoupon'),
      t('map.decision.couponMessage', { placeName: place.name, defaultValue: `${place.name} coupon will be available here.` }),
      [{ text: t('map.search.confirm') }],
    );
  };
  const handleToggleBookmark = async (place: DecisionPlace, nextBookmarked: boolean) => {
    try {
      await togglePlaceBookmark(place, nextBookmarked);
    } catch (error) {
      Alert.alert(
        nextBookmarked ? '장소를 저장하지 못했어요' : '저장을 해제하지 못했어요',
        getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.'),
      );
    }
  };

  const focusedPlace = selectedPlace;
  const mapCenterLat = !isFollowingUser && focusedPlace ? focusedPlace.latitude : center.lat;
  const mapCenterLng = !isFollowingUser && focusedPlace ? focusedPlace.longitude : center.lng;
  const showTemporaryMarker = mapSection === 'map'
    && apiMarkers.length === 0
    && !isSearchOpen
    && (activeCategory === 'all' || activeCategory === 'food');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <View style={styles.mapBackground}>
        <MapCanvas
          centerLat={mapCenterLat}
          centerLng={mapCenterLng}
          followUser={isFollowingUser}
          markers={mapMarkers}
          onMarkerPress={handleMarkerPress}
          userLat={userLat}
          userLng={userLng}
        />
        <View pointerEvents="none" style={styles.mapTint} />
      </View>
          <MapTopOverlay
            activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onProfilePress={onOpenProfile}
          onQueryChange={handleQueryChange}
          onSearchFocus={handleSearchFocus}
          onSubmitSearch={() => {
            setContent({ type: 'results', query });
            snapTo('expanded');
          }}
          query={query}
        />
        {showTemporaryMarker ? (
          <Pressable
            accessibilityLabel="임시 장소 대성반점 열기"
            accessibilityRole="button"
            hitSlop={18}
            onPress={() => handlePlacePress(mockPlaces[0])}
            style={({ pressed }) => [
              styles.temporaryMarkerButton,
              pressed && styles.temporaryMarkerPressed,
            ]}
            testID="temporary-place-marker"
          >
            <RestaurantMarkerAsset height={62} pointerEvents="none" width={46} />
          </Pressable>
        ) : null}
        {mapSection === 'favorites' ? (
          <FavoritePlacesBottomSheet
            collapsedTranslateY={collapsedTranslateY}
            hasNextPage={Boolean(hasNextFavoritePage)}
            height={fullSheetHeight}
            imageUrlsByPlaceId={favoriteImageUrlsByPlaceId}
            isError={isFavoritesError}
            isFetchNextPageError={isFetchNextFavoritePageError}
            isFetchingNextPage={isFetchingNextFavoritePage}
            isLoading={isAuthHydrating || isFavoritesLoading}
            isUnauthorized={(!isAuthHydrating && !isLoggedIn) || isFavoritesUnauthorized}
            mediumTranslateY={mediumTranslateY}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenMap={() => {
              setMapSection('map');
              setContent({ type: 'home' });
              snapTo('medium');
            }}
            onOpenRecommendations={() => {
              setMapSection('map');
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenReservations={() => {
              setMapSection('reservations');
              snapTo('medium');
            }}
            onLoadMore={() => void fetchNextFavoritePage()}
            onRetry={() => void refetchFavorites()}
            onRemovePlace={(place) => void handleToggleBookmark(place, false)}
            onPlacePress={(place) => {
              setMapSection('map');
              handlePlacePress(place);
            }}
            panHandlers={panHandlers}
            places={favoritePlaces}
            pendingPlaceIds={bookmarkPendingPlaceIds}
            sheetChromeBottom={sheetChromeBottom}
            sheetTranslateY={sheetTranslateY}
            snapPoint={snapPoint}
          />
        ) : mapSection === 'reservations' ? (
          <ReservationBottomSheet
            collapsedTranslateY={collapsedTranslateY}
            height={fullSheetHeight}
            mediumTranslateY={mediumTranslateY}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenFavorites={() => {
              setMapSection('favorites');
              snapTo('medium');
            }}
            onOpenMap={() => {
              setMapSection('map');
              setContent({ type: 'home' });
              snapTo('medium');
            }}
            onOpenRecommendations={() => {
              setMapSection('map');
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenReservation={(reservationId) => onOpenReservation?.(reservationId)}
            onOpenVerification={() => onOpenVerification?.()}
            panHandlers={panHandlers}
            sheetChromeBottom={sheetChromeBottom}
            sheetTranslateY={sheetTranslateY}
            snapPoint={snapPoint}
          />
        ) : (
          <MapBottomSheet
            activeFilters={activeFilters}
            bookmarkedPlaceIds={bookmarkedPlaceIds}
            bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
            isBookmarkStateLoading={!canQueryBookmarks || isBookmarkMembershipLoading}
            collapsedTranslateY={collapsedTranslateY}
            content={content}
            height={fullSheetHeight}
            mediumTranslateY={mediumTranslateY}
            onBackHome={handleBackHome}
            onCouponPress={handleCoupon}
            onCreateReservation={(place, imageUrl) => onCreateReservation?.({
              category: place.category,
              id: place.id,
              imageUrl,
              name: place.name,
            })}
            onDetailPress={() => snapTo('expanded')}
            onFilterPress={handleFilterPress}
            onGoNowPress={handleGoNow}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenLikedPlaces={() => {
              setMapSection('favorites');
              snapTo('medium');
            }}
            onOpenRecommendations={() => {
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenSavedPlaces={() => {
              setMapSection('reservations');
              snapTo('medium');
            }}
            onPlacePress={handlePlacePress}
            onRetryRecommendations={() => void refetchRecommendations()}
            onProfilePress={onOpenProfile}
            onQueryChange={handleQueryChange}
            onSearchFocus={handleSearchFocus}
            onSubmitSearch={() => {
              setContent({ type: 'results', query });
              snapTo('expanded');
            }}
            onToggleBookmark={handleToggleBookmark}
            panHandlers={panHandlers}
            places={sheetPlaces}
            previewFallbackContentByPlaceId={MOCK_PLACE_PREVIEW_CONTENT_BY_ID}
            feed={rankingFeed}
            onFeedChange={setRankingFeed}
            rankingImageUrlsByPlaceId={rankingImageUrlsByPlaceId}
            rankingPlaces={rankingPlaces}
            rankingState={rankingState}
            recommendationContext={recommendationPresentation.contextText}
            recommendationLimitMessage={recommendationPresentation.limitText}
            recommendationPlaces={recommendationPlaces}
            recommendationsState={recommendationsState}
            selectedPlace={selectedPlace}
            sheetChromeBottom={sheetChromeBottom}
            sheetTranslateY={sheetTranslateY}
            snapPoint={snapPoint}
            userName={profile?.username}
          />
        )}
      {isSearchOpen ? (
        <MapSearchOverlay
          centerLat={center.lat}
          centerLng={center.lng}
          isRecommendationsError={isRecommendationsError}
          isRecommendationsLoading={isRecommendationsLoading}
          onClose={() => setIsSearchOpen(false)}
          onRefreshRecommendations={refetchRecommendations}
          onSelectRecommendedPlace={(place) => {
            setIsSearchOpen(false);
            handlePlacePress(toDecisionPlace(place));
          }}
          onSelectPlace={(place) => {
            setIsSearchOpen(false);
            const registeredPlace = allPlaces.find((item) => String(item.id) === place.id);
            if (registeredPlace) {
              handlePlacePress(registeredPlace);
              return;
            }
            setContent({ type: 'results', query: place.name });
            snapTo('expanded');
          }}
          recommendedPlaces={recommendedPlaces}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#E7ECEF', flex: 1 },
  mapBackground: StyleSheet.absoluteFillObject,
  mapTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(244, 247, 249, 0.03)' },
  temporaryMarkerButton: {
    alignItems: 'center',
    left: '50%',
    marginLeft: -41,
    padding: 18,
    position: 'absolute',
    top: '37%',
    zIndex: 20,
  },
  temporaryMarkerPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
});
