import React, { useEffect, useState } from 'react';
import { Linking, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { V2_ROUTES, parsePlaceId, type V2ScreenProps } from '../../../app/navigation/types';
import MapDiscoverySearch from '../components/MapDiscoverySearch';
import KakaoMapAdapter from '../components/KakaoMapAdapter';
import MapSelectedPlaceCard from '../components/MapSelectedPlaceCard';
import PlaceReportEntryButton from '../../place-report/components/PlaceReportEntryButton';
import {
  LocationStatusOverlay,
  MapDataStatusOverlay,
} from '../components/MapStatusOverlays';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useMapDiscovery } from '../hooks/useMapDiscovery';
import type { MapPlaceResult, MapPlaceSelection } from '../model/mapDiscovery';
import { FALLBACK_COORDINATE } from '../model/mapFixtures';

const RADIUS_KM = 3;

type MapScreenProps = Pick<V2ScreenProps<'Map'>, 'navigation'>;

export default function MapScreen({ navigation }: MapScreenProps) {
  const { t } = useTranslation();
  const location = useCurrentLocation();
  const [center, setCenter] = useState(FALLBACK_COORDINATE);
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlaceSelection | null>(null);
  const discovery = useMapDiscovery({
    category,
    center,
    keyword: searchText,
    radiusKm: RADIUS_KM,
    selectedPlace,
  });

  useEffect(() => {
    if (location.status === 'granted' && selectedPlace === null) {
      setCenter(location.coordinate);
    }
  }, [location.coordinate, location.status, selectedPlace]);

  useEffect(() => {
    if (!selectedPlace || !discovery.hasResolvedMarkers) return;

    const isSelectedPlaceVisible = discovery.markers.some(
      (marker) => marker.kind === 'place' && marker.placeId === selectedPlace.id,
    );

    if (!isSelectedPlaceVisible) setSelectedPlace(null);
  }, [discovery.hasResolvedMarkers, discovery.markers, selectedPlace]);

  const selectPlace = ({
    coordinate,
    distanceMeters,
    id,
  }: Pick<MapPlaceResult, 'coordinate' | 'distanceMeters' | 'id'>) => {
    setSelectedPlace({ distanceMeters, id });
    setCenter(coordinate);
    setSearchFocused(false);
  };

  const handleMarkerSelect = (markerId: string) => {
    const marker = discovery.markers.find((item) => item.id === markerId);
    if (!marker) return;
    const coordinate = { lat: marker.lat, lng: marker.lng };

    if (marker.kind === 'cluster' || marker.placeId === null) {
      setSelectedPlace(null);
      setCenter(coordinate);
      return;
    }
    if (selectedPlace?.id === marker.placeId) {
      setSelectedPlace(null);
      return;
    }
    selectPlace({ coordinate, distanceMeters: null, id: marker.placeId });
  };

  const visibleResults = searchFocused && searchText.trim().length >= 2
    ? discovery.autocomplete
    : searchText.trim() || category
      ? discovery.results
      : [];

  return (
    <Container testID="v2-map-screen">
      <KakaoMapAdapter
        center={center}
        followUser={location.status === 'granted' && selectedPlace === null}
        markers={discovery.markers}
        onCameraIdle={setCenter}
        onMarkerSelect={handleMarkerSelect}
        userCoordinate={location.coordinate ?? undefined}
      />

      <SafeOverlay edges={['top', 'right', 'bottom', 'left']} pointerEvents="box-none">
        <MapDiscoverySearch
          category={category}
          isBusy={discovery.isAutocompleteLoading || discovery.isRefreshing}
          onCategoryChange={(value) => {
            setCategory(value);
            setSelectedPlace(null);
          }}
          onFocusChange={setSearchFocused}
          onQueryChange={(value) => {
            setSearchText(value);
            setSelectedPlace(null);
          }}
          onSelectPlace={selectPlace}
          query={searchText}
          results={visibleResults}
        />

        <LocateButton
          accessibilityLabel={t('map.locate')}
          accessibilityRole="button"
          onPress={() => {
            setSelectedPlace(null);
            setCenter(location.coordinate ?? FALLBACK_COORDINATE);
          }}
          testID="v2-map-locate"
        >
          <LocateButtonText>{t('map.locate')}</LocateButtonText>
        </LocateButton>

        <LocationStatusOverlay
          location={location}
          onRefresh={() => void location.refresh()}
        />
        <MapDataStatusOverlay
          error={discovery.queryError}
          isEmpty={discovery.isEmpty}
          isLoading={discovery.isLoading}
          onRetry={() => void discovery.refetch()}
        />
        <PlaceReportEntry
          accessibilityLabel={t('placeReport.mapEntry')}
          onPress={() => navigation.navigate(V2_ROUTES.PlaceReport)}
          testID="v2-map-place-report"
          label={t('placeReport.mapEntry')}
        />
        <MapSelectedPlaceCard
          error={discovery.selectedPlaceError}
          loading={discovery.selectedPlaceLoading}
          onDirections={(place) => {
            void Linking.openURL(`https://map.kakao.com/link/search/${encodeURIComponent(place.address || place.name)}`);
          }}
          onDismiss={() => setSelectedPlace(null)}
          onOpenPlace={(value) => {
            const placeId = parsePlaceId(value);
            if (placeId) navigation.navigate(V2_ROUTES.PlaceDetail, { placeId });
          }}
          onReserve={(value) => {
            const placeId = parsePlaceId(value);
            if (placeId) navigation.navigate(V2_ROUTES.CreateReservation, { placeId });
          }}
          onRetry={() => void discovery.selectedPlaceRefetch()}
          onShare={(place) => {
            void Share.share({ message: `${place.name}\n${place.address}` });
          }}
          place={discovery.selectedPlace}
          selectedPlaceId={selectedPlace?.id ?? null}
          visible={selectedPlace !== null}
        />
      </SafeOverlay>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const SafeOverlay = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: ${({ theme }) => theme.spacing.md}px;
`;
const LocateButton = styled.Pressable`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md}px;
  top: ${({ theme }) => theme.spacing.xxl * 4}px;
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const LocateButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const PlaceReportEntry = styled(PlaceReportEntryButton)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md}px;
  top: ${({ theme }) => theme.spacing.xxl * 4}px;
`;
