import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BlurTargetView } from 'expo-blur';
import { Alert, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerAndroidBackOverride } from '../../../shared/navigation/androidBackOverride';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import { useTranslation } from 'react-i18next';
import { useMapSettingsStore } from '../../../app/store/mapSettingsStore';
import { useAuthStore } from '../../../app/store/authStore';
import MapBottomSheet, {
  type BottomSheetContent,
  type DecisionPlace,
  type VisitFilter,
} from '../components/MapBottomSheet';
import FavoritePlacesBottomSheet from '../components/FavoritePlacesBottomSheet';
import { GlassBlurTargetProvider } from '../components/GlassSurface';
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
import { usePlaceRecommendations } from '../hooks/usePlaceRecommendations';
import { useRecordPlaceRecommendationClick } from '../hooks/useRecordPlaceRecommendationClick';
import { useRecommendationExplanation } from '../../../v2/features/place-exploration';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import { useProfile } from '../../profile/hooks/useProfile';
import type { MapMarker, Place } from '../model/place.types';
import { normalizePlaceCategory } from '../utils/placeCategory';
import { getMapBackAction } from '../utils/mapBack';
import {
  createRecommendationPresentation,
  getRecommendationState,
} from '../model/recommendationPresentation';
import { applyBookmarkStateToMarkers } from '../utils/mapMarkerBookmarks';
import { toFavoritePlaceImageUrls } from '../utils/favoritePlaceImages';

const MOCK_PLACE_IDS = [138001, 138002, 138003] as const;

// Matches SHEET_RESTING_GAP in MapBottomSheet.
const SHEET_RESTING_GAP = 8;

const makeMockPlaces = (latitude: number, longitude: number): DecisionPlace[] => [
  {
    address: 'Seongsu-dong 2-ga · 4 min walk',
    category: 'POP-UP',
    distance: '320 m',
    distanceMeters: 320,
    id: MOCK_PLACE_IDS[0],
    latitude: latitude + 0.0018,
    longitude: longitude - 0.0012,
    name: '오아시스 팝업 스토어',
    tags: ['English menu', 'Coupon'],
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
    latitude: latitude - 0.0011,
    longitude: longitude + 0.0019,
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
    latitude: latitude + 0.0004,
    longitude: longitude + 0.0028,
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
  notificationLikeContext?: {
    notificationsId?: string;
    postId?: string;
  } | null;
  onClearOpenedBookmarkedPlace?: () => void;
  onOpenPlaceDetail?: (placeId: string) => void;
  onOpenProfile?: () => void;
  onOpenSavedPlaces?: () => void;
  openedBookmarkedPlaceId?: number | null;
};

export default function MapScreen({
  onClearOpenedBookmarkedPlace,
  onOpenPlaceDetail,
  onOpenProfile,
  onOpenSavedPlaces,
  openedBookmarkedPlaceId,
}: MapScreenProps) {
  const { i18n, t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mapBlurTargetRef = useRef<View | null>(null);
  const { center, userLat, userLng } = useCurrentLocation();
  const { markers: apiMarkers, places: apiPlaces } = usePlaces();
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
  const [mapSection, setMapSection] = useState<'map' | 'favorites'>('map');
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
  const allPlaces = useMemo(() => {
    const recommendations = recommendedPlaces
      .slice(0, 8)
      .map(toDecisionPlace);
    const livePlaces = apiPlaces
      .slice(0, 8)
      .map(toDecisionPlace);

    if (recommendations.length > 0) return recommendations;
    return livePlaces.length > 0 ? livePlaces : mockPlaces;
  }, [apiPlaces, mockPlaces, recommendedPlaces]);
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
    return [...allPlaces, ...favoritePlaces]
      .find((place) => place.id === content.placeId) ?? null;
  }, [allPlaces, content, favoritePlaces]);
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
    const mockMarkers = mockPlaces
      .filter((place) => !liveMarkerIds.has(String(place.id)))
      .map((place, index) => ({
        category: (index === 1 ? 'food' : index === 2 ? 'etc' : 'fashion') as MapMarker['category'],
        id: String(place.id),
        lat: place.latitude,
        lng: place.longitude,
        markerType: index === 0 ? 'hot' as const : 'default' as const,
      }));

    const recommendationMarkerIds = new Set(apiMarkers.map((marker) => marker.id));
    const recommendationMarkers = recommendationPlaces
      .filter((place) => !recommendationMarkerIds.has(String(place.id)))
      .map((place) => ({
        category: normalizePlaceCategory(place.category),
        id: String(place.id),
        lat: place.latitude,
        lng: place.longitude,
        markerType: 'default' as const,
      }));
    const markers = applyBookmarkStateToMarkers([
      ...apiMarkers.map((marker) => ({
        ...marker,
        category: normalizePlaceCategory(marker.category),
      })),
      ...recommendationMarkers,
      ...mockMarkers,
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
  }, [activeCategory, apiMarkers, bookmarkedPlaceIds, mockPlaces, recommendationPlaces]);

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
    const placeId = Number(event.nativeEvent.markerId);
    if (
      !Number.isFinite(placeId)
      || ![...allPlaces, ...favoritePlaces].some((place) => place.id === placeId)
    ) return;

    setContent({ type: 'place-preview', placeId });
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
      [{ text: t('placeCreate.alerts.confirm') }],
    );
  };
  const handleCoupon = (place: DecisionPlace) => {
    Alert.alert(
      t('map.decision.getCoupon'),
      t('map.decision.couponMessage', { placeName: place.name, defaultValue: `${place.name} coupon will be available here.` }),
      [{ text: t('placeCreate.alerts.confirm') }],
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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <BlurTargetView ref={mapBlurTargetRef} style={styles.mapBackground}>
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
      </BlurTargetView>
      <GlassBlurTargetProvider blurTarget={mapBlurTargetRef}>
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
              snapTo('medium');
            }}
            onOpenRecommendations={() => {
              setMapSection('map');
              setContent({ type: 'home' });
              snapTo('expanded');
            }}
            onOpenReservations={onOpenSavedPlaces}
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
            onDetailPress={(place) => onOpenPlaceDetail?.(String(place.id))}
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
              setContent({ type: 'home' });
              snapTo('expanded');
            }}
            onOpenSavedPlaces={onOpenSavedPlaces}
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
      </GlassBlurTargetProvider>
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
  mapTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(244, 247, 249, 0.12)' },
});
