import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import MapDiscoverySearch from '../components/MapDiscoverySearch';
import KakaoMapAdapter from '../components/KakaoMapAdapter';
import MapSelectedPlaceCard from '../components/MapSelectedPlaceCard';
import {
  LocationStatusOverlay,
  MapDataStatusOverlay,
} from '../components/MapStatusOverlays';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useMapDiscovery } from '../hooks/useMapDiscovery';
import type { MapPlaceResult } from '../model/mapDiscovery';
import { FALLBACK_COORDINATE } from '../model/mapFixtures';

const RADIUS_KM = 3;

export default function MapScreen() {
  const { t } = useTranslation();
  const location = useCurrentLocation();
  const [center, setCenter] = useState(FALLBACK_COORDINATE);
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const discovery = useMapDiscovery({
    category,
    center,
    keyword: searchText,
    radiusKm: RADIUS_KM,
    selectedPlaceId,
  });

  useEffect(() => {
    if (location.status === 'granted' && selectedPlaceId === null) {
      setCenter(location.coordinate);
    }
  }, [location.coordinate, location.status, selectedPlaceId]);

  const selectPlace = ({ coordinate, id }: Pick<MapPlaceResult, 'coordinate' | 'id'>) => {
    setSelectedPlaceId(id);
    setCenter(coordinate);
    setSearchFocused(false);
  };

  const handleMarkerSelect = (markerId: string) => {
    const marker = discovery.markers.find((item) => item.id === markerId);
    if (!marker) return;
    const coordinate = { lat: marker.lat, lng: marker.lng };

    if (marker.kind === 'cluster' || marker.placeId === null) {
      setSelectedPlaceId(null);
      setCenter(coordinate);
      return;
    }
    selectPlace({ coordinate, id: marker.placeId });
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
        followUser={location.status === 'granted' && selectedPlaceId === null}
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
            setSelectedPlaceId(null);
          }}
          onFocusChange={setSearchFocused}
          onQueryChange={(value) => {
            setSearchText(value);
            setSelectedPlaceId(null);
          }}
          onSelectPlace={selectPlace}
          query={searchText}
          results={visibleResults}
        />

        <LocateButton
          accessibilityLabel={t('map.locate')}
          accessibilityRole="button"
          onPress={() => {
            setSelectedPlaceId(null);
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
        <MapSelectedPlaceCard
          error={discovery.selectedPlaceError}
          loading={discovery.selectedPlaceLoading}
          place={discovery.selectedPlace}
          visible={selectedPlaceId !== null}
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
