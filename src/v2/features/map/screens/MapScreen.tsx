import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerAndroidBackOverride } from '../../../shared/navigation/androidBackOverride';
import { getApiErrorUx } from '../../../shared/api';
import { useTranslation } from 'react-i18next';
import { syncProfileLanguage } from '../../../shared/i18n';
import { useMapSettingsStore } from '../store/mapSettingsStore';
import MapBottomSheet, {
  type BottomSheetContent,
  type DecisionPlace,
  type MapPreviewFallbackContent,
  type VisitFilter,
} from '../components/MapBottomSheet';
import FavoritePlacesBottomSheet from '../components/FavoritePlacesBottomSheet';
import ReservationBottomSheet from '../../reservations/components/ReservationBottomSheet';
import MapCanvas from '../components/MapCanvas';
import MapSearchOverlay from '../components/MapSearchOverlay';
import MapTopOverlay, { type MapCategoryId } from '../components/MapTopOverlay';
import { MAP_TOP_OVERLAY_METRICS } from '../styles/MapTopOverlay.styles';
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
import {
  usePlaceExplorationMediaList,
  useRecommendationExplanation,
} from '../../place-exploration';
import { formatPlaceOperatingSummary, usePlaceDetailPresentation } from '../../place-detail';
import {
  MAP_DISMISSED_ZOOM_LEVEL,
  MAP_LOCATE_ZOOM_LEVEL,
  MAP_PREVIEW_ZOOM_LEVEL,
  markersForSelectedPlace,
} from '../model/mapSelection';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import { useProfile } from '../../my-page/hooks/useProfile';
import type { MapMarker, Place } from '../model/place.types';
import { normalizePlaceCategory } from '../utils/placeCategory';
import { getMapBackAction } from '../utils/mapBack';
import {
  createRecommendationPresentation,
  getRecommendationState,
} from '../model/recommendationPresentation';
import { toFavoritePlaceImageUrls } from '../utils/favoritePlaceImages';
import {
  findMapPreviewPlace,
  includeSelectedNearbyReservablePlace,
  mergeMapPreviewPlaces,
  shouldPresentMapSelection,
} from '../utils/mapPreviewSelection';
import { createFocusedRecommendationMarker } from '../utils/recommendationMarkers';
import { selectMapExplorationPlaceIds } from '../utils/mapExplorationPlaceIds';
import { VisitVerificationMapCta } from '../../place-visit-verification';
import { PlaceCouponCta } from '../../offers-coupons';
import { LocationStatusOverlay } from '../components/MapStatusOverlays';

// Matches SHEET_RESTING_GAP in MapBottomSheet.
const SHEET_RESTING_GAP = 8;

const toDecisionPlace = (place: Place): DecisionPlace => ({
  ...place,
  address: place.address || '',
  category: (place.category || 'PLACE').toUpperCase(),
  distance: place.distanceMeters ? `${Math.round(place.distanceMeters)} m` : '',
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
  canQueryBookmarks?: boolean;
  initialSection?: 'favorites' | 'map' | 'reservations';
  onClearOpenedBookmarkedPlace?: () => void;
  onCreateReservation?: (place: {
    category: string;
    id: number;
    imageUrl?: string;
    name: string;
  }) => void;
  onOpenCoupons?: () => void;
  onOpenProfile?: () => void;
  onOpenReservation?: (reservationId: number) => void;
  onStartVisitVerification?: (placeId: number) => void;
  onSignIn?: () => void;
  onOpenVisitVerification?: () => void;
  openedBookmarkedPlaceId?: number | null;
};

export default function MapScreen({
  canQueryBookmarks = true,
  initialSection = 'map',
  onClearOpenedBookmarkedPlace,
  onCreateReservation,
  onOpenCoupons,
  onOpenProfile,
  onOpenReservation,
  onStartVisitVerification,
  onSignIn,
  onOpenVisitVerification,
  openedBookmarkedPlaceId,
}: MapScreenProps) {
  const { i18n, t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reservationNavigationLock = useRef(false);
  const mapRefreshLock = useRef(false);
  const locateFollowFrame = useRef<number | null>(null);
  const location = useCurrentLocation();
  const center = location.coordinate;
  const userLat = center?.lat;
  const userLng = center?.lng;
  const {
    markers: apiMarkers,
    places: apiPlaces,
    refetch: refetchPlaces,
  } = usePlaces();
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
    latitude: userLat ?? Number.NaN,
    limit: 8,
    longitude: userLng ?? Number.NaN,
    radiusKm: recommendationRadiusKm,
  });
  const { recordRecommendationClick } = useRecordPlaceRecommendationClick();
  const recommendationExplanation = useRecommendationExplanation(
    recommendationRequestId ?? '',
    { enabled: Boolean(recommendationRequestId) },
  );
  const { profile } = useProfile();
  const [activeFilters, setActiveFilters] = useState<VisitFilter[]>([]);
  const [content, setContent] = useState<BottomSheetContent>({ type: 'home' });
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MapCategoryId>('all');
  const [mapSection, setMapSection] = useState<'map' | 'favorites' | 'reservations'>(initialSection);
  const [dismissedMarkerCenter, setDismissedMarkerCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapZoomLevel, setMapZoomLevel] = useState(MAP_PREVIEW_ZOOM_LEVEL);

  useEffect(() => {
    setMapSection(initialSection);
  }, [initialSection]);
  useEffect(() => () => {
    if (locateFollowFrame.current !== null) {
      cancelAnimationFrame(locateFollowFrame.current);
    }
  }, []);
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

  const expandedSheetTop = insets.top
    + 2
    + MAP_TOP_OVERLAY_METRICS.headerHeight
    + MAP_TOP_OVERLAY_METRICS.categoryHeight
    + 19;
  const isPlacePreview = mapSection === 'map' && content.type === 'place-preview';
  // Keep one stable sheet geometry while content changes. Only the expanded destination moves:
  // place detail can fill the screen, while other expanded content remains below the top overlay.
  const fullSheetHeight = Math.round(height);
  const expandedTranslateY = isPlacePreview ? 0 : expandedSheetTop;
  const designScale = Math.min(Math.max(width / 425, 0.9), 1.05);
  const collapsedVisibleHeight = Math.round(101 * designScale) + SHEET_RESTING_GAP;
  const mediumVisibleHeight = Math.min(
    // Keep the featured cards clear of the viewport-fixed bottom navigation.
    Math.round(442 * designScale) + SHEET_RESTING_GAP,
    Math.round(height * 0.56),
  );
  const collapsedTranslateY = fullSheetHeight - collapsedVisibleHeight;
  const mediumTranslateY = fullSheetHeight - mediumVisibleHeight;
  const { jumpTo, panHandlers, sheetChromeBottom, sheetTranslateY, snapPoint, snapTo } = useBottomSheet({
    collapsedTranslateY,
    expandedTranslateY,
    initialSnapPoint: 'medium',
    mediumTranslateY,
  });
  const verificationCtaOpacity = sheetTranslateY.interpolate({
    inputRange: [
      expandedTranslateY,
      Math.max(mediumTranslateY, expandedTranslateY + 1),
    ],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  useEffect(() => {
    void syncProfileLanguage(profile?.language);
  }, [profile?.language]);

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

    return serverPlaces;
  }, [apiPlaces, recommendationPlaces]);
  const mapExplorationPlaceIds = useMemo(() => selectMapExplorationPlaceIds({
    expanded: snapPoint === 'expanded',
    places: allPlaces,
    recommendationPlaces,
    recommendationsActive: content.type === 'recommendations',
    selectedPlaceId: content.type === 'place-preview' ? content.placeId : undefined,
  }), [allPlaces, content, recommendationPlaces, snapPoint]);
  const mapExplorationImageUrlsByPlaceId = usePlaceExplorationMediaList(
    mapExplorationPlaceIds,
    { enabled: mapSection === 'map' },
  );
  const mapExplorationPreviewImageUrlsByPlaceId = useMemo(
    () => Object.entries(mapExplorationImageUrlsByPlaceId)
      .reduce<Record<string, string>>((result, [placeId, imageUrls]) => {
        if (imageUrls[0]) result[placeId] = imageUrls[0];
        return result;
      }, {}),
    [mapExplorationImageUrlsByPlaceId],
  );
  const recommendationPresentation = useMemo(() => createRecommendationPresentation({
    appliedActivityIntent,
    appliedTravelPurposes,
    limitReasons,
  }, (key) => t(key)), [
    appliedActivityIntent,
    appliedTravelPurposes,
    limitReasons,
    t,
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
  const favoriteExplorationImageUrlsByPlaceId = usePlaceExplorationMediaList(
    bookmarkedPlaces.map((place) => place.id),
    { enabled: canQueryBookmarks && mapSection === 'favorites' },
  );
  const { imageUrlsByPlaceId: favoritePreviewImages } = usePlacePreviewImages(
    bookmarkedPlaces,
    canQueryBookmarks && mapSection === 'favorites',
  );
  const favoriteImageUrlsByPlaceId = useMemo(
    () => ({
      ...favoriteExplorationImageUrlsByPlaceId,
      ...toFavoritePlaceImageUrls(favoritePreviewImages),
    }),
    [favoriteExplorationImageUrlsByPlaceId, favoritePreviewImages],
  );
  const selectedPlaceBase = useMemo(() => {
    if (content.type !== 'place-preview') return null;
    const selectedFromCurrentData = [...allPlaces, ...favoritePlaces]
      .find((place) => place.id === content.placeId);

    return selectedFromCurrentData ?? null;
  }, [allPlaces, content, favoritePlaces]);
  const selectedPlaceId = selectedPlaceBase?.id ?? 0;
  const hasSelectedPlace = selectedPlaceBase !== null;
  const {
    presentation: selectedPlacePresentation,
    refetchAvailability,
    refetchMedia,
    refetchReviews,
  } = usePlaceDetailPresentation(selectedPlaceId, { enabled: hasSelectedPlace });
  const selectedPlace = useMemo<DecisionPlace | null>(() => {
    if (!selectedPlaceBase) return null;
    if (!selectedPlacePresentation) return selectedPlaceBase;

    return {
      ...selectedPlaceBase,
      address: selectedPlacePresentation.address || selectedPlaceBase.address,
      category: selectedPlacePresentation.category || selectedPlaceBase.category,
      name: selectedPlacePresentation.name || selectedPlaceBase.name,
    };
  }, [selectedPlaceBase, selectedPlacePresentation]);
  const nearbyReservationPlaces = useMemo(
    () => includeSelectedNearbyReservablePlace(
      recommendedPlaces.filter((place) => place.reservable).map(toDecisionPlace),
      selectedPlace,
      {
        radiusKm: recommendationRadiusKm,
        reservable: selectedPlacePresentation?.reservation.kind === 'available',
      },
    ),
    [recommendedPlaces, recommendationRadiusKm, selectedPlace, selectedPlacePresentation?.reservation.kind],
  );
  const mapSelectedPlace = shouldPresentMapSelection(snapPoint) ? selectedPlace : null;
  const previewFallbackContentByPlaceId = useMemo<Record<string, MapPreviewFallbackContent> | undefined>(() => {
    if (!selectedPlace || !selectedPlacePresentation) return undefined;
    const operatingSummary = selectedPlacePresentation.operatingSummary
      ? formatPlaceOperatingSummary(
        selectedPlacePresentation.operatingSummary,
        (key, options) => t(key, options),
      )
      : undefined;

    return {
      [String(selectedPlace.id)]: {
        amenities: [],
        coupons: selectedPlacePresentation.coupons,
        englishName: selectedPlacePresentation.englishName ?? undefined,
        events: selectedPlacePresentation.events,
        imageState: selectedPlacePresentation.imageState,
        imageUrls: selectedPlacePresentation.imageUrls,
        jibunAddress: selectedPlacePresentation.jibunAddress ?? undefined,
        notice: selectedPlacePresentation.notice ?? undefined,
        operatingSummary,
        phone: selectedPlacePresentation.merchant?.contactPhone ?? undefined,
        reservation: selectedPlacePresentation.reservation,
        reviewCount: selectedPlacePresentation.reviewTotal ?? undefined,
        reviewState: selectedPlacePresentation.reviewState,
        roadAddress: selectedPlacePresentation.roadAddress ?? undefined,
        reviews: selectedPlacePresentation.reviews.map((review) => ({
          author: t(review.authorKey),
          createdAt: review.createdAt,
          imageUrls: review.imageUrls,
          tags: review.tags,
          text: review.text,
        })),
        summary: selectedPlacePresentation.touristSummary
          ?? selectedPlacePresentation.description
          ?? undefined,
        statusDescription: selectedPlacePresentation.verificationLabelKey
          ? t(selectedPlacePresentation.verificationLabelKey)
          : '',
        statusEmphasis: operatingSummary?.statusText ?? '',
      },
    };
  }, [selectedPlace, selectedPlacePresentation, t]);
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
      content.type === 'place-preview' ? mapSelectedPlace : null,
      recommendationPlaceIds,
      liveMarkerIds,
    );
    const visibleMarkerIds = new Set(liveMarkerIds);
    if (focusedRecommendationMarker) visibleMarkerIds.add(focusedRecommendationMarker.id);
    const markers = [
      ...apiMarkers.map((marker) => ({
        ...marker,
        category: normalizePlaceCategory(marker.category),
      })),
      ...(focusedRecommendationMarker ? [focusedRecommendationMarker] : []),
    ];

    if (activeCategory === 'all') return markers;
    const markerCategory: MapMarker['category'] = activeCategory;

    return markers.filter((marker) => marker.category === markerCategory);
  }, [
    activeCategory,
    apiMarkers,
    content.type,
    recommendationPlaces,
    mapSelectedPlace,
  ]);
  const visibleMapMarkers = useMemo(() => markersForSelectedPlace(
    mapMarkers,
    content.type === 'place-preview' ? mapSelectedPlace?.id ?? null : null,
  ), [content.type, mapMarkers, mapSelectedPlace?.id]);
  useEffect(() => {
    if (openedBookmarkedPlaceId === null || openedBookmarkedPlaceId === undefined) return;

    setMapSection('map');
    setContent({ type: 'place-preview', placeId: openedBookmarkedPlaceId });
    setIsFollowingUser(false);
    snapTo('medium');
    onClearOpenedBookmarkedPlace?.();
  // Only react when a bookmarked place is explicitly opened.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedBookmarkedPlaceId]);

  const dismissPlaceAt = useCallback((place: DecisionPlace) => {
    setContent({ type: 'home' });
    setDismissedMarkerCenter({ lat: place.latitude, lng: place.longitude });
    setIsFollowingUser(false);
    setMapZoomLevel(MAP_DISMISSED_ZOOM_LEVEL);
    snapTo('medium');
  }, [snapTo]);

  const handleMarkerPress = (markerId: string) => {
    const place = findMapPreviewPlace(markerId, [
      ...allPlaces,
      ...favoritePlaces,
    ]);
    if (!place) return;

    setMapSection('map');

    if (content.type === 'place-preview' && content.placeId === place.id) {
      dismissPlaceAt(place);
      return;
    }

    setContent({ type: 'place-preview', placeId: place.id });
    setDismissedMarkerCenter(null);
    setIsFollowingUser(false);
    setMapZoomLevel(MAP_PREVIEW_ZOOM_LEVEL);
    snapTo('medium');
  };
  const handlePlacePress = (place: DecisionPlace) => {
    const isRecommendation = recommendedPlaces.some((item) => item.id === place.id);
    if (isRecommendation && recommendationRequestId && recommendationVersion) {
      void recordRecommendationClick({
        placeId: place.id,
        recommendationVersion,
        requestId: recommendationRequestId,
      }).catch(() => {
        if (__DEV__) console.warn('[recommendation-click] failed.');
      });
    }
    setMapSection('map');
    setContent({ type: 'place-preview', placeId: place.id });
    setDismissedMarkerCenter(null);
    setIsFollowingUser(false);
    setMapZoomLevel(MAP_PREVIEW_ZOOM_LEVEL);
    snapTo('medium');
  };
  const handleQueryChange = (nextQuery: string) => {
    setContent({ type: 'search', query: nextQuery });
    snapTo('expanded');
  };
  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };
  const openMapSection = useCallback((nextSection: 'favorites' | 'map' | 'reservations') => {
    setContent({ type: 'home' });
    setMapSection(nextSection);
    jumpTo('medium');
  }, [jumpTo]);
  const handleMapRefresh = useCallback(async () => {
    if (mapRefreshLock.current) return;

    mapRefreshLock.current = true;
    setMapSection('map');
    setContent({ type: 'home' });
    setDismissedMarkerCenter(null);
    setIsFollowingUser(true);

    try {
      await Promise.allSettled([
        refetchPlaces(),
        refetchRecommendations(),
      ]);
    } finally {
      mapRefreshLock.current = false;
    }
  }, [refetchPlaces, refetchRecommendations]);
  const handleFilterPress = (filter: VisitFilter) => {
    setActiveFilters((current) => (
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    ));
  };
  const handleBackHome = useCallback(() => {
    if (selectedPlace) {
      dismissPlaceAt(selectedPlace);
      return;
    }

    setContent({ type: 'home' });
    setIsFollowingUser(true);
    setDismissedMarkerCenter(null);
    setMapZoomLevel(MAP_PREVIEW_ZOOM_LEVEL);
    snapTo('medium');
  }, [dismissPlaceAt, selectedPlace, snapTo]);

  const handleLocatePress = useCallback(() => {
    setContent({ type: 'home' });
    setDismissedMarkerCenter(null);
    setMapZoomLevel(MAP_LOCATE_ZOOM_LEVEL);

    // Native map props only react when followUser changes. Pulse the value so an
    // unchanged current coordinate can still be re-centered on every button press.
    setIsFollowingUser(false);
    if (locateFollowFrame.current !== null) {
      cancelAnimationFrame(locateFollowFrame.current);
    }
    locateFollowFrame.current = requestAnimationFrame(() => {
      locateFollowFrame.current = null;
      setIsFollowingUser(true);
    });

    snapTo('medium');
  }, [snapTo]);

  useFocusEffect(useCallback(() => {
    reservationNavigationLock.current = false;
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
        handleBackHome();
        return true;
      }

      if (action === 'collapse-sheet') {
        snapTo('collapsed');
        return true;
      }

      return false;
    });
  }, [content, handleBackHome, isSearchOpen, mapSection, snapPoint, snapTo]));
  const handleGoNow = (place: DecisionPlace) => {
    Alert.alert(
      t('map.decision.goNow'),
      t('map.decision.goNowMessage', { placeName: place.name }),
      [{ text: t('map.search.confirm') }],
    );
  };
  const handleToggleBookmark = async (place: DecisionPlace, nextBookmarked: boolean) => {
    try {
      await togglePlaceBookmark(place, nextBookmarked);
    } catch (error) {
      Alert.alert(
        t(nextBookmarked ? 'map.sheet.bookmarkSaveError' : 'map.sheet.bookmarkRemoveError'),
        getApiErrorUx(error).error.message || t('common.error.description'),
      );
    }
  };

  const focusedPlace = mapSelectedPlace;
  const mapCenterLat = !isFollowingUser && focusedPlace
    ? focusedPlace.latitude - (0.00072 * designScale)
    : dismissedMarkerCenter?.lat ?? center?.lat;
  const mapCenterLng = !isFollowingUser && focusedPlace
    ? focusedPlace.longitude
    : dismissedMarkerCenter?.lng ?? center?.lng;
  const isExpandedPlaceDetail = mapSection === 'map'
    && content.type === 'place-preview'
    && snapPoint === 'expanded';
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={isExpandedPlaceDetail ? '#FFFFFF' : 'transparent'}
        barStyle="dark-content"
        translucent
      />
      <View style={styles.mapBackground}>
        {mapCenterLat !== undefined && mapCenterLng !== undefined && userLat !== undefined && userLng !== undefined ? <MapCanvas
          centerLat={mapCenterLat}
          centerLng={mapCenterLng}
          followUser={isFollowingUser}
          markers={visibleMapMarkers}
          onMarkerPress={handleMarkerPress}
          userLat={userLat}
          userLng={userLng}
          zoomLevel={mapZoomLevel}
        /> : null}
        <View pointerEvents="none" style={styles.mapTint} />
      </View>
      <LocationStatusOverlay location={location} onRefresh={() => void location.refresh()} />
        <MapTopOverlay
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onLocatePress={handleLocatePress}
          onProfilePress={onOpenProfile}
          onQueryChange={handleQueryChange}
          onRefreshMap={handleMapRefresh}
          onSearchFocus={handleSearchFocus}
          onSubmitSearch={() => {
            setContent({ type: 'results', query });
            snapTo('expanded');
          }}
          profileImageUrl={profile?.profileImageUrl}
          query={query}
          showCategories={!isExpandedPlaceDetail}
        />
        <View
          pointerEvents="box-none"
          style={styles.sectionTransition}
          testID={`map-section-transition-${mapSection}`}
        >
        {mapSection === 'favorites' ? (
          <FavoritePlacesBottomSheet
            collapsedTranslateY={collapsedTranslateY}
            hasNextPage={Boolean(hasNextFavoritePage)}
            height={fullSheetHeight}
            imageUrlsByPlaceId={favoriteImageUrlsByPlaceId}
            isError={isFavoritesError}
            isFetchNextPageError={isFetchNextFavoritePageError}
            isFetchingNextPage={isFetchingNextFavoritePage}
            isLoading={isFavoritesLoading}
            isUnauthorized={!canQueryBookmarks || isFavoritesUnauthorized}
            mediumTranslateY={mediumTranslateY}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenMap={() => {
              openMapSection('map');
            }}
            onOpenRecommendations={() => {
              setMapSection('map');
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenReservations={() => {
              openMapSection('reservations');
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
            bookmarkedPlaceIds={bookmarkedPlaceIds}
            bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
            collapsedTranslateY={collapsedTranslateY}
            height={fullSheetHeight}
            isBookmarkStateLoading={!canQueryBookmarks || isBookmarkMembershipLoading}
            mediumTranslateY={mediumTranslateY}
            nearbyPlaces={nearbyReservationPlaces}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenFavorites={() => {
              openMapSection('favorites');
            }}
            onOpenMap={() => {
              openMapSection('map');
            }}
            onOpenRecommendations={() => {
              setMapSection('map');
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenReservation={(reservationId) => onOpenReservation?.(reservationId)}
            onPlacePress={handlePlacePress}
            onToggleBookmark={handleToggleBookmark}
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
            couponContent={selectedPlace ? (
              <PlaceCouponCta
                onRequestSignIn={onSignIn}
                onViewMyCoupons={onOpenCoupons}
                placeId={selectedPlace.id}
                variant="compact"
              />
            ) : undefined}
            explorationImageUrlsByPlaceId={mapExplorationPreviewImageUrlsByPlaceId}
            height={fullSheetHeight}
            mediumTranslateY={mediumTranslateY}
            onBackHome={handleBackHome}
            onCreateReservation={(place, imageUrl) => {
              if (!onCreateReservation || reservationNavigationLock.current) return;
              reservationNavigationLock.current = true;
              onCreateReservation({
                category: place.category,
                id: place.id,
                imageUrl,
                name: place.name,
              });
            }}
            onDetailPress={() => snapTo('expanded')}
            onFilterPress={handleFilterPress}
            onGoNowPress={handleGoNow}
            onHandlePress={() => {
              if (snapPoint === 'collapsed') snapTo('medium');
              else if (snapPoint === 'medium') snapTo('expanded');
              else snapTo('medium');
            }}
            onOpenLikedPlaces={() => {
              openMapSection('favorites');
            }}
            onOpenRecommendations={() => {
              setContent({ type: 'recommendations' });
              snapTo('expanded');
            }}
            onOpenSavedPlaces={() => {
              openMapSection('reservations');
            }}
            onStartVisitVerification={onStartVisitVerification
              ? (place) => onStartVisitVerification(place.id)
              : undefined}
            onPlacePress={handlePlacePress}
            onRetryRecommendations={() => void refetchRecommendations()}
            onRetryAvailability={() => void refetchAvailability()}
            onRetryMedia={() => void refetchMedia()}
            onRetryReviews={() => void refetchReviews()}
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
            previewFallbackContentByPlaceId={previewFallbackContentByPlaceId}
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
        </View>
      {!isSearchOpen && content.type !== 'place-preview' && onOpenVisitVerification ? (
        <Animated.View
          pointerEvents={snapPoint === 'expanded' ? 'none' : 'auto'}
          style={{
            bottom: fullSheetHeight + 8,
            opacity: verificationCtaOpacity,
            position: 'absolute',
            right: 12,
            transform: [{ translateY: sheetTranslateY }],
            zIndex: 60,
          }}
          testID="visit-verification-map-cta-motion"
        >
          <VisitVerificationMapCta
            label={t('visitVerification.title')}
            onPress={onOpenVisitVerification}
          />
        </Animated.View>
      ) : null}
      {isSearchOpen && center ? (
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

const absoluteFill = { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 };
const styles: Record<string, object> = {
  container: { backgroundColor: '#E7ECEF', flex: 1 },
  mapBackground: absoluteFill,
  mapTint: { ...absoluteFill, backgroundColor: 'rgba(244, 247, 249, 0.03)' },
  sectionTransition: { ...absoluteFill, zIndex: 50 },
};
