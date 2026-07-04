import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryChips from '../components/CategoryChips';
import KakaoMapCard, { KakaoMapMarkerPressEvent } from '../components/KakaoMapCard';
import MapActionButtons from '../components/MapActionButtons';
import MapBottomSheet from '../components/MapBottomSheet';
import MarkerPreviewCard from '../components/MarkerPreviewCard';
import MapSearchBar from '../components/MapSearchBar';
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
import type { MapMarker, RecommendedPlace } from '../model/place.types';

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
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  const { isError: isPlacesError, markers, places } = usePlaces();
  const {
    isError: isRecommendationsError,
    isLoading: isRecommendationsLoading,
    places: recommendedPlaces,
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
    const recommendationMarkers = (recommendedPlaces ?? [])
      .filter((place) => !placeMarkerIds.has(String(place.id)))
      .map((place) => ({
        category: 'food' as const,
        id: String(place.id),
        lat: place.latitude,
        lng: place.longitude,
        markerType: 'hot' as const,
      }));

    return [...markers, ...recommendationMarkers];
  }, [markers, recommendedPlaces]);
  const selectedPlaceId = selectedPlace?.id
    ?? (selectedMarkerId !== null ? Number(selectedMarkerId) : null);
  const {
    isError: isPostsError,
    isLoading: isPostsLoading,
    posts: selectedPlacePosts,
    refetch: refetchSelectedPlacePosts,
  } = usePlacePosts(Number.isFinite(selectedPlaceId) ? selectedPlaceId : null);
  const uiScale = Math.min(width / BASE_SCREEN_WIDTH, height / BASE_SCREEN_HEIGHT, 1);
  const sheetExpandedHeight = Math.round(
    clamp(Math.min(BASE_SHEET_EXPANDED_HEIGHT * uiScale, height * 0.74), 420, BASE_SHEET_EXPANDED_HEIGHT)
  );
  const sheetCollapsedVisibleHeight = Math.round(
    clamp(BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT * uiScale, 104, BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT)
  );
  const sheetCollapsedTranslateY = Math.max(0, sheetExpandedHeight - sheetCollapsedVisibleHeight);
  const smallActionWidth = Math.round(clamp(38 * uiScale, 30, 38));
  const smallActionHeight = Math.round(clamp(44 * uiScale, 35, 44));
  const addIconSize = Math.round(clamp(21 * uiScale, 17, 21));
  const addTextSize = Math.round(clamp(17 * uiScale, 14, 17));
  const sideGap = Math.round(clamp(42 * uiScale, 16, 42));
  const rightGap = Math.round(clamp(36 * uiScale, 16, 36));
  const topPaddingX = Math.round(clamp(22 * uiScale, 16, 22));
  const topPaddingTop = Math.round(clamp(44 * uiScale, 24, 44));
  const searchHeight = Math.round(clamp(64 * uiScale, 44, 64));
  const profileSize = Math.round(clamp(44 * uiScale, 32, 44));
  const chipHeight = Math.round(clamp(46 * uiScale, 34, 46));
  const categoryIconScale = clamp(chipHeight / 46, 0.78, 1);
  const markerCardWidth = Math.round(clamp(width - 44, 338, 380));
  const { isExpanded, panHandlers, sheetTranslateY, toggleSheet } = useBottomSheet({
    collapsedTranslateY: sheetCollapsedTranslateY,
  });
  useEffect(() => {
    if (openedBookmarkedPlaceId !== undefined && openedBookmarkedPlaceId !== null) {
      setSelectedMarkerId(String(openedBookmarkedPlaceId));
      onClearOpenedBookmarkedPlace?.();
    }
  }, [onClearOpenedBookmarkedPlace, openedBookmarkedPlaceId]);
  const handleMarkerPress = (event: KakaoMapMarkerPressEvent) => {
    setSelectedMarkerId(event.nativeEvent.markerId);
  };
  const handleRecommendedPlacePress = (place: RecommendedPlace) => {
    setSelectedMarkerId(String(place.id));

    void recordRecommendationClick({
      placeId: place.id,
      recommendationVersion: recommendationVersion ?? 'place-rec-v1',
    }).catch(() => undefined);
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
        centerLat={center.lat}
        centerLng={center.lng}
        zoomLevel={16}
        userLat={userLat}
        userLng={userLng}
        followUser={followUser}
        markers={mapMarkers}
        onMarkerPress={handleMarkerPress}
      />

      <View style={styles.mapTint} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View
          style={[
            styles.topPanel,
            { paddingHorizontal: topPaddingX, paddingTop: topPaddingTop },
          ]}
          pointerEvents="box-none"
        >
          <MapSearchBar
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
  topPanel: {
    paddingHorizontal: 22,
    paddingTop: 44,
  },
});
