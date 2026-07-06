import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChips from '../components/CategoryChips';
import KakaoMapCard, { KakaoMapMarkerPressEvent } from '../components/KakaoMapCard';
import MapActionButtons from '../components/MapActionButtons';
import MapBottomSheet from '../components/MapBottomSheet';
import MarkerPreviewCard from '../components/MarkerPreviewCard';
import MapSearchBar from '../components/MapSearchBar';
import MapSearchOverlay, { type MapSearchSelection } from '../components/MapSearchOverlay';
import { mapCategories } from '../constants/mapFixtures';
import {
  ACTION_BOTTOM_GAP,
  BASE_SCREEN_HEIGHT,
  BASE_SCREEN_WIDTH,
  BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT,
  BASE_SHEET_EXPANDED_HEIGHT,
  clamp,
} from '../constants/mapLayout';
import { useBottomSheet } from '../hooks/useBottomSheet';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { usePlaces } from '../hooks/usePlaces';
import { useHiddenPosts } from '../../record/hooks/useHiddenPosts';
import { usePostLike } from '../../record/hooks/usePostLike';
import { useBookmarkedPosts, usePostBookmark } from '../../record/hooks/usePostBookmark';
import { usePostReport } from '../../record/hooks/usePostReport';
import { usePlacePosts } from '../../record/hooks/usePlacePosts';
import { useProfile } from '../../profile/hooks/useProfile';
import { usePlaceRecommendations } from '../hooks/usePlaceRecommendations';
import { useRecordPlaceRecommendationClick } from '../hooks/useRecordPlaceRecommendationClick';
import { useHotPlaceIds } from '../hooks/useHotPlaceIds';
import type { MapMarker, RecommendedPlace } from '../model/place.types';
import { normalizePlaceCategory } from '../utils/placeCategory';

const SEARCH_FOCUS_MARKER_ID = 'search-focus-place';
const COORDINATE_MATCH_THRESHOLD = 0.00015;
const I18N_LANGUAGE_ALIASES: Record<string, string> = {
  chinese: 'zh',
  english: 'en',
  japanese: 'ja',
  korean: 'ko',
  thai: 'th',
  vietnamese: 'vi',
  '中文': 'zh',
  '日本語': 'ja',
  '한국어': 'ko',
  'ภาษาไทย': 'th',
  'tiếng việt': 'vi',
};
const SUPPORTED_I18N_LANGUAGES = new Set(['en', 'ko', 'ja', 'zh', 'vi', 'th']);

const normalizeI18nLanguage = (language: string | undefined | null) => {
  const normalized = language?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const baseLanguage = normalized.split('-')[0];

  if (SUPPORTED_I18N_LANGUAGES.has(baseLanguage)) {
    return baseLanguage;
  }

  return I18N_LANGUAGE_ALIASES[normalized] ?? null;
};

const isSamePlaceCoordinate = (
  a: { latitude: number; longitude: number },
  b: { lat: number; lng: number }
) => (
  Math.abs(a.latitude - b.lat) <= COORDINATE_MATCH_THRESHOLD
  && Math.abs(a.longitude - b.lng) <= COORDINATE_MATCH_THRESHOLD
);

const isSameMarkerCoordinate = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => (
  Math.abs(a.lat - b.lat) <= COORDINATE_MATCH_THRESHOLD
  && Math.abs(a.lng - b.lng) <= COORDINATE_MATCH_THRESHOLD
);

type MapScreenProps = {
  notificationLikeContext?: {
    notificationsId?: string;
    postId?: string;
  } | null;
  onCreatePlace?: () => void;
  onClearOpenedBookmarkedPlace?: () => void;
  onOpenProfile?: () => void;
  openedBookmarkedPlaceId?: number | null;
};

export default function MapScreen({
  notificationLikeContext,
  onCreatePlace,
  onClearOpenedBookmarkedPlace,
  onOpenProfile,
  openedBookmarkedPlaceId,
}: MapScreenProps) {
  const [reportedPostIds, setReportedPostIds] = useState<Record<string, boolean>>({});
  const [reportPendingPostIds, setReportPendingPostIds] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchFocusPlace, setSearchFocusPlace] = useState<MapSearchSelection | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const { i18n } = useTranslation();
  const { width, height } = useWindowDimensions();
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  const {
    isError: isPlacesError,
    markers,
    places,
    refetch: refetchPlaces,
  } = usePlaces();
  const {
    hotPlaceIds,
    refetch: refetchHotPlaceIds,
  } = useHotPlaceIds();
  const {
    isError: isRecommendationsError,
    isLoading: isRecommendationsLoading,
    places: recommendedPlaces,
    refetch: refetchRecommendations,
    recommendationRequestId,
    recommendationVersion,
  } = usePlaceRecommendations({
    latitude: userLat,
    longitude: userLng,
  });
  const { recordRecommendationClick } = useRecordPlaceRecommendationClick();
  const { bookmarkedPlaceIds } = useBookmarkedPosts();
  const { togglePostBookmark } = usePostBookmark();
  const { hiddenPostIds, hidePost } = useHiddenPosts();
  const { togglePostLike } = usePostLike();
  const { reportPost } = usePostReport();
  const { profile } = useProfile();
  useEffect(() => {
    const nextLanguage = normalizeI18nLanguage(profile?.language);

    if (nextLanguage && i18n.language !== nextLanguage) {
      void i18n.changeLanguage(nextLanguage);
    }
  }, [i18n, profile?.language]);
  const selectedPlace = useMemo(
    () => (
      places.find((place) => String(place.id) === selectedMarkerId)
      ?? recommendedPlaces.find((place) => String(place.id) === selectedMarkerId)
      ?? null
    ),
    [places, recommendedPlaces, selectedMarkerId]
  );
  const mapMarkers = useMemo<MapMarker[]>(() => {
    const placeMarkerIds = new Set(markers.map((marker) => marker.id));
    const placeMarkers = markers.map((marker) => ({
      ...marker,
      markerType: hotPlaceIds.has(marker.id) ? 'hot' as const : 'default' as const,
    }));
    const recommendationMarkers = (recommendedPlaces ?? [])
      .filter((place) => !placeMarkerIds.has(String(place.id)))
      .map((place) => ({
        category: normalizePlaceCategory(place.category),
        id: String(place.id),
        lat: place.latitude,
        lng: place.longitude,
        markerType: hotPlaceIds.has(String(place.id)) ? 'hot' as const : 'default' as const,
      }));
    const baseMarkers = [...placeMarkers, ...recommendationMarkers];
    const hasMatchingMarker = searchFocusPlace
      ? baseMarkers.some((marker) => (
        marker.id === searchFocusPlace.id
        || isSameMarkerCoordinate(marker, searchFocusPlace)
      ))
      : true;
    const searchFocusMarker = searchFocusPlace && !hasMatchingMarker
      ? [{
        category: 'food' as const,
        id: SEARCH_FOCUS_MARKER_ID,
        lat: searchFocusPlace.lat,
        lng: searchFocusPlace.lng,
        markerType: 'search' as const,
      }]
      : [];

    return [...baseMarkers, ...searchFocusMarker];
  }, [hotPlaceIds, markers, recommendedPlaces, searchFocusPlace]);
  const selectedPlaceId = selectedPlace?.id
    ?? (selectedMarkerId !== null ? Number(selectedMarkerId) : null);
  const {
    isError: isPostsError,
    isLoading: isPostsLoading,
    posts: selectedPlacePosts,
    refetch: refetchSelectedPlacePosts,
  } = usePlacePosts(Number.isFinite(selectedPlaceId) ? selectedPlaceId : null);
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      await Promise.all([
        refetchPlaces(),
        refetchRecommendations(),
        refetchHotPlaceIds(),
        Number.isFinite(selectedPlaceId) ? refetchSelectedPlacePosts() : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    refetchHotPlaceIds,
    refetchPlaces,
    refetchRecommendations,
    refetchSelectedPlacePosts,
    selectedPlaceId,
  ]);
  const uiScale = Math.min(width / BASE_SCREEN_WIDTH, height / BASE_SCREEN_HEIGHT, 1);
  const sheetExpandedHeight = Math.round(
    clamp(Math.min(BASE_SHEET_EXPANDED_HEIGHT * uiScale, height * 0.74), 420, BASE_SHEET_EXPANDED_HEIGHT)
  );
  const sheetCollapsedVisibleHeight = Math.round(
    clamp(BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT * uiScale, 104, BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT)
  );
  const sheetCollapsedTranslateY = Math.max(0, sheetExpandedHeight - sheetCollapsedVisibleHeight);
  const smallActionWidth = Math.round(clamp(44 * uiScale, 38, 44));
  const smallActionHeight = Math.round(clamp(51 * uiScale, 44, 51));
  const addIconSize = Math.round(clamp(21 * uiScale, 17, 21));
  const addTextSize = Math.round(clamp(17 * uiScale, 14, 17));
  const sideGap = Math.round(clamp(42 * uiScale, 16, 42));
  const rightGap = Math.round(clamp(36 * uiScale, 16, 36));
  const topPaddingX = Math.round(clamp(22 * uiScale, 16, 22));
  const topPaddingTop = Math.round(clamp(44 * uiScale, 24, 44));
  const searchHeight = Math.round(clamp(64 * uiScale, 44, 64));
  const profileSize = Math.round(clamp(44 * uiScale, 32, 44));
  const chipHeight = Math.round(clamp(44 * uiScale, 40, 44));
  const categoryIconScale = clamp(chipHeight / 52, 0.76, 0.86);
  const markerCardWidth = Math.round(clamp(width - 44, 338, 380));
  const { isExpanded, panHandlers, sheetTranslateY, toggleSheet } = useBottomSheet({
    collapsedTranslateY: sheetCollapsedTranslateY,
  });
  const refreshPanResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => (
        !isRefreshing
        && !isSearchOpen
        && gesture.dy > 72
        && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.8
      ),
      onPanResponderRelease: () => {
        void handleRefresh();
      },
    }),
    [handleRefresh, isRefreshing, isSearchOpen]
  );
  useEffect(() => {
    if (openedBookmarkedPlaceId !== undefined && openedBookmarkedPlaceId !== null) {
      setSelectedMarkerId(String(openedBookmarkedPlaceId));
      onClearOpenedBookmarkedPlace?.();
    }
  }, [onClearOpenedBookmarkedPlace, openedBookmarkedPlaceId]);
  const mapCenterLat = searchFocusPlace?.lat ?? center.lat;
  const mapCenterLng = searchFocusPlace?.lng ?? center.lng;

  const handleMarkerPress = (event: KakaoMapMarkerPressEvent) => {
    if (event.nativeEvent.markerId === SEARCH_FOCUS_MARKER_ID) {
      return;
    }

    setSelectedMarkerId(event.nativeEvent.markerId);
  };
  const handleRecommendedPlacePress = (place: RecommendedPlace) => {
    setSelectedMarkerId(String(place.id));
    setSearchFocusPlace(null);

    if (recommendationRequestId) {
      void recordRecommendationClick({
        placeId: place.id,
        recommendationVersion: recommendationVersion ?? 'place-rec-v1',
        requestId: recommendationRequestId,
      }).catch(() => undefined);
    }
  };
  const handleSearchPlaceSelect = (place: MapSearchSelection) => {
    const matchingPlace = [...places, ...recommendedPlaces].find((candidate) => (
      String(candidate.id) === place.id
      || isSamePlaceCoordinate(candidate, place)
    ));

    setSearchFocusPlace(place);
    setSelectedMarkerId(matchingPlace ? String(matchingPlace.id) : null);
  };
  const handleReport = async (postId: number, reason: string, hideAfterReport: boolean) => {
    const postKey = String(postId);

    if (reportPendingPostIds[postKey] || reportedPostIds[postKey]) {
      return;
    }

    setReportPendingPostIds((prev) => ({ ...prev, [postKey]: true }));

    try {
      await reportPost(postId, reason);
      setReportedPostIds((prev) => ({ ...prev, [postKey]: true }));

      if (hideAfterReport) {
        await hidePost(postId);
      }
    } finally {
      setReportPendingPostIds((prev) => ({ ...prev, [postKey]: false }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <KakaoMapCard
        style={styles.map}
        centerLat={mapCenterLat}
        centerLng={mapCenterLng}
        zoomLevel={16}
        userLat={userLat}
        userLng={userLng}
        followUser={searchFocusPlace ? false : followUser}
        markers={mapMarkers}
        onMarkerPress={handleMarkerPress}
      />

      <View style={styles.mapTint} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View
          {...refreshPanResponder.panHandlers}
          style={[
            styles.topPanel,
            { paddingHorizontal: topPaddingX, paddingTop: topPaddingTop },
          ]}
          pointerEvents="box-none"
        >
          <MapSearchBar
            onOpenSearch={() => setIsSearchOpen(true)}
            onProfilePress={onOpenProfile}
            profileSize={profileSize}
            searchHeight={searchHeight}
            uiScale={uiScale}
          />
          <CategoryChips
            categories={mapCategories}
            categoryIconScale={categoryIconScale}
            chipHeight={chipHeight}
            topPaddingX={topPaddingX}
            uiScale={uiScale}
          />
          {isPlacesError ? (
            <View style={styles.mapStatusPill}>
              <Text style={styles.mapStatusText}>장소를 불러오지 못했어요</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
      {isRefreshing ? (
        <View
          style={[styles.refreshIndicator, { top: topPaddingTop + 14 }]}
          pointerEvents="none"
        >
          <ActivityIndicator color="#ff1956" />
        </View>
      ) : null}

      <MapActionButtons
        addIconSize={addIconSize}
        addTextSize={addTextSize}
        bottom={sheetExpandedHeight + ACTION_BOTTOM_GAP}
        left={sideGap}
        onAddPlace={onCreatePlace}
        right={rightGap}
        sheetTranslateY={sheetTranslateY}
        smallActionHeight={smallActionHeight}
        smallActionWidth={smallActionWidth}
      />

      <MapBottomSheet
        height={sheetExpandedHeight}
        isExpanded={isExpanded}
        isRecommendationsError={isRecommendationsError}
        isRecommendationsLoading={isRecommendationsLoading}
        onPlacePress={handleRecommendedPlacePress}
        onToggle={toggleSheet}
        panHandlers={panHandlers}
        places={recommendedPlaces}
        sheetTranslateY={sheetTranslateY}
      />

      {selectedMarkerId && (
        <View
          style={[
            styles.markerPreviewLayer,
            { paddingHorizontal: Math.round(clamp(22 * uiScale, 14, 22)) },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="마커 카드 닫기"
            style={styles.markerPreviewBackdrop}
            onPress={() => setSelectedMarkerId(null)}
          />
          <MarkerPreviewCard
            bookmarkedPlaceIds={bookmarkedPlaceIds}
            hiddenPostIds={hiddenPostIds}
            isError={isPostsError}
            isLoading={isPostsLoading}
            notificationLikeContext={notificationLikeContext}
            placeName={selectedPlace?.name}
            posts={selectedPlacePosts}
            width={markerCardWidth}
            onClose={() => setSelectedMarkerId(null)}
            onRetry={() => void refetchSelectedPlacePosts()}
            onToggleBookmark={togglePostBookmark}
            onReport={handleReport}
            onToggleLike={togglePostLike}
            reportedPostIds={reportedPostIds}
            reportPendingPostIds={reportPendingPostIds}
            translationTargetLanguage={profile?.language || 'ko'}
          />
        </View>
      )}

      {isSearchOpen ? (
        <MapSearchOverlay
          centerLat={mapCenterLat}
          centerLng={mapCenterLng}
          onClose={() => setIsSearchOpen(false)}
          onCreatePlace={onCreatePlace}
          onOpenProfile={onOpenProfile}
          onSelectPlace={handleSearchPlaceSelect}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eff3f6',
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.26)',
  },
  markerPreviewLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    elevation: 100,
    justifyContent: 'flex-start',
    paddingTop: 62,
    zIndex: 100,
  },
  markerPreviewBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  mapStatusPill: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#ececf0',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapStatusText: {
    color: '#555965',
    fontSize: 13,
    fontWeight: '700',
  },
  safeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  refreshIndicator: {
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 4,
    height: 36,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -18,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    width: 36,
    zIndex: 30,
  },
  topPanel: {
    paddingHorizontal: 22,
    paddingTop: 44,
  },
});
