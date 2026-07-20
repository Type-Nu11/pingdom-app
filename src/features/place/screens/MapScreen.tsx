import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MapBottomSheet, {
  type BottomSheetContent,
  type DecisionPlace,
  type VisitFilter,
} from '../components/MapBottomSheet';
import MapCanvas from '../components/MapCanvas';
import MapControlRail from '../components/MapControlRail';
import type { KakaoMapMarkerPressEvent } from '../components/KakaoMapCard';
import { useBottomSheet } from '../hooks/useBottomSheet';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { usePlaces } from '../hooks/usePlaces';
import { useProfile } from '../../profile/hooks/useProfile';
import type { MapMarker, Place } from '../model/place.types';
import { normalizePlaceCategory } from '../utils/placeCategory';

const MOCK_PLACE_IDS = [138001, 138002, 138003] as const;

const makeMockPlaces = (latitude: number, longitude: number): DecisionPlace[] => [
  {
    address: 'Seongsu-dong 2-ga · 4 min walk',
    category: 'POP-UP',
    distance: '320 m',
    id: MOCK_PLACE_IDS[0],
    latitude: latitude + 0.0018,
    longitude: longitude - 0.0012,
    name: 'Seongsu Pop-up',
    tags: ['English menu', 'Coupon'],
    verifiedAgo: '18m',
    wait: '10–20 min',
  },
  {
    address: 'Yeonmujang-gil · 7 min walk',
    category: 'CAFE',
    distance: '580 m',
    id: MOCK_PLACE_IDS[1],
    latitude: latitude - 0.0011,
    longitude: longitude + 0.0019,
    name: 'Layered Coffee Lab',
    tags: ['Short wait', 'Bookable'],
    verifiedAgo: '7m',
    wait: '5–10 min',
  },
  {
    address: 'Ttukseom-ro · 10 min walk',
    category: 'DINING',
    distance: '810 m',
    id: MOCK_PLACE_IDS[2],
    latitude: latitude + 0.0004,
    longitude: longitude + 0.0028,
    name: 'Common Table Seongsu',
    tags: ['Coupon', 'Bookable'],
    verifiedAgo: '24m',
    wait: '20–30 min',
  },
];

const toDecisionPlace = (place: Place): DecisionPlace => ({
  address: place.address || 'Nearby place',
  category: (place.category || 'PLACE').toUpperCase(),
  distance: place.distanceMeters ? `${Math.round(place.distanceMeters)} m` : 'Nearby',
  id: place.id,
  latitude: place.latitude,
  longitude: place.longitude,
  name: place.name,
  tags: ['Visitor verified'],
  verifiedAgo: 'recently',
  wait: '10–20 min',
});

type MapScreenProps = {
  notificationLikeContext?: {
    notificationsId?: string;
    postId?: string;
  } | null;
  onClearOpenedBookmarkedPlace?: () => void;
  onCreatePlace?: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenPlaceDetail?: (placeId: string) => void;
  onOpenProfile?: () => void;
  onOpenSavedPlaces?: () => void;
  openedBookmarkedPlaceId?: number | null;
};

export default function MapScreen({
  onClearOpenedBookmarkedPlace,
  onOpenPlaceDetail,
  onOpenProfile,
  openedBookmarkedPlaceId,
}: MapScreenProps) {
  const { i18n, t } = useTranslation();
  const { height } = useWindowDimensions();
  const { center, userLat, userLng } = useCurrentLocation();
  const { markers: apiMarkers, places: apiPlaces } = usePlaces();
  const { profile } = useProfile();
  const [activeFilters, setActiveFilters] = useState<VisitFilter[]>([]);
  const [content, setContent] = useState<BottomSheetContent>({ type: 'home' });
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [mapType, setMapType] = useState<'Map' | 'Transit'>('Map');

  const fullSheetHeight = Math.round(Math.min(height * 0.9, height - 36));
  const collapsedVisibleHeight = Math.round(Math.min(168, height * 0.21));
  const mediumVisibleHeight = Math.round(Math.min(Math.max(height * 0.5, 390), 470));
  const collapsedTranslateY = fullSheetHeight - collapsedVisibleHeight;
  const mediumTranslateY = fullSheetHeight - mediumVisibleHeight;
  const { panHandlers, sheetTranslateY, snapPoint, snapTo } = useBottomSheet({
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
    const mockIds = new Set<number>(MOCK_PLACE_IDS);
    const livePlaces = apiPlaces
      .filter((place) => !mockIds.has(place.id))
      .slice(0, 8)
      .map(toDecisionPlace);

    return [...mockPlaces, ...livePlaces];
  }, [apiPlaces, mockPlaces]);
  const selectedPlace = useMemo(() => {
    if (content.type !== 'place-preview') return null;
    return allPlaces.find((place) => place.id === content.placeId) ?? null;
  }, [allPlaces, content]);
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

    return [
      ...apiMarkers.map((marker) => ({
        ...marker,
        category: normalizePlaceCategory(marker.category),
      })),
      ...mockMarkers,
    ];
  }, [apiMarkers, mockPlaces]);

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
    if (!Number.isFinite(placeId) || !allPlaces.some((place) => place.id === placeId)) return;

    setContent({ type: 'place-preview', placeId });
    setIsFollowingUser(false);
    snapTo('medium');
  };
  const handlePlacePress = (place: DecisionPlace) => {
    setContent({ type: 'place-preview', placeId: place.id });
    setIsFollowingUser(false);
    snapTo('medium');
  };
  const handleQueryChange = (nextQuery: string) => {
    setContent({ type: 'search', query: nextQuery });
    snapTo('expanded');
  };
  const handleSearchFocus = () => {
    setContent((current) => ({
      type: 'search',
      query: current.type === 'search' || current.type === 'results' ? current.query : '',
    }));
    snapTo('expanded');
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

  const focusedPlace = selectedPlace;
  const mapCenterLat = !isFollowingUser && focusedPlace ? focusedPlace.latitude : center.lat;
  const mapCenterLng = !isFollowingUser && focusedPlace ? focusedPlace.longitude : center.lng;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
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
      <MapControlRail
        bottom={fullSheetHeight + 16}
        mapType={mapType}
        onLocatePress={() => {
          setContent({ type: 'home' });
          setIsFollowingUser(true);
          snapTo('collapsed');
        }}
        onMapTypePress={() => setMapType((current) => current === 'Map' ? 'Transit' : 'Map')}
        sheetTranslateY={sheetTranslateY}
      />
      <MapBottomSheet
        activeFilters={activeFilters}
        content={content}
        height={fullSheetHeight}
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
        onPlacePress={handlePlacePress}
        onProfilePress={onOpenProfile}
        onQueryChange={handleQueryChange}
        onSearchFocus={handleSearchFocus}
        onSubmitSearch={() => {
          setContent({ type: 'results', query });
          snapTo('expanded');
        }}
        panHandlers={panHandlers}
        places={visiblePlaces}
        selectedPlace={selectedPlace}
        sheetTranslateY={sheetTranslateY}
        snapPoint={snapPoint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#E7ECEF', flex: 1 },
  mapTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(244, 247, 249, 0.12)' },
});
