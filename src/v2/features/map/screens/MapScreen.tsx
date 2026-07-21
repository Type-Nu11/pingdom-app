import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import Button from '../../../shared/components/Button';
import KakaoMapAdapter from '../components/KakaoMapAdapter';
import { createTestPlaceMarkers, FALLBACK_COORDINATE } from '../model/mapFixtures';
import type { Coordinate } from '../model/map.types';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export default function MapScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useCurrentLocation();
  const [center, setCenter] = useState<Coordinate>(FALLBACK_COORDINATE);
  const [visibleCenter, setVisibleCenter] = useState<Coordinate>(FALLBACK_COORDINATE);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const markerOrigin = location.coordinate ?? FALLBACK_COORDINATE;
  const markers = useMemo(() => createTestPlaceMarkers(markerOrigin), [markerOrigin]);
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? null;

  useEffect(() => {
    if (location.status === 'granted' && selectedMarkerId === null) {
      setCenter(location.coordinate);
    }
  }, [location.coordinate, location.status, selectedMarkerId]);

  const handleMarkerSelect = (markerId: string) => {
    const marker = markers.find((item) => item.id === markerId);
    if (!marker) return;

    setSelectedMarkerId(markerId);
    setCenter({ lat: marker.lat, lng: marker.lng });
  };

  const handleLocate = () => {
    setSelectedMarkerId(null);
    setCenter(location.coordinate ?? FALLBACK_COORDINATE);
  };

  return (
    <Container testID="v2-map-screen">
      <KakaoMapAdapter
        center={center}
        followUser={location.status === 'granted' && selectedMarkerId === null}
        markers={markers}
        onCameraIdle={setVisibleCenter}
        onMarkerSelect={handleMarkerSelect}
        userCoordinate={location.coordinate ?? undefined}
      />

      <SafeOverlay edges={['top', 'right', 'bottom', 'left']} pointerEvents="box-none">
        <Header pointerEvents="none">
          <Title>{t('map.title')}</Title>
          <RegionLabel>
            {t('map.visibleCenter', {
              lat: visibleCenter.lat.toFixed(4),
              lng: visibleCenter.lng.toFixed(4),
            })}
          </RegionLabel>
        </Header>

        <LocateButton
          accessibilityLabel={t('map.locate')}
          accessibilityRole="button"
          onPress={handleLocate}
          testID="v2-map-locate"
        >
          <LocateButtonText>{t('map.locate')}</LocateButtonText>
        </LocateButton>

        {location.status === 'loading' ? (
          <LocationStatusCard accessibilityLiveRegion="polite" testID="v2-location-loading">
            <ActivityIndicator color={theme.colors.primary} />
            <StatusText>{t('map.location.loading')}</StatusText>
          </LocationStatusCard>
        ) : null}

        {location.status === 'denied' ? (
          <LocationStatusCard accessibilityLiveRegion="polite" testID="v2-location-denied">
            <StatusTitle>{t('map.location.deniedTitle')}</StatusTitle>
            <StatusText>{t('map.location.deniedDescription')}</StatusText>
            {!location.canAskAgain ? (
              <Button label={t('map.location.openSettings')} onPress={() => void Linking.openSettings()} />
            ) : null}
            <Button label={t('map.location.retry')} onPress={() => void location.refresh()} variant="secondary" />
          </LocationStatusCard>
        ) : null}

        {location.status === 'failed' ? (
          <LocationStatusCard accessibilityLiveRegion="polite" testID="v2-location-failed">
            <StatusTitle>{t('map.location.failedTitle')}</StatusTitle>
            <StatusText>{t('map.location.failedDescription')}</StatusText>
            <Button label={t('map.location.retry')} onPress={() => void location.refresh()} variant="secondary" />
          </LocationStatusCard>
        ) : null}

        {selectedMarker ? (
          <PlaceCard accessibilityLiveRegion="polite" testID="v2-selected-place">
            <PlaceEyebrow>{t('map.testPlace')}</PlaceEyebrow>
            <StatusTitle>{selectedMarker.name}</StatusTitle>
            <StatusText>
              {selectedMarker.lat.toFixed(5)}, {selectedMarker.lng.toFixed(5)}
            </StatusText>
          </PlaceCard>
        ) : null}
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

const Header = styled.View`
  align-self: flex-start;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const RegionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const LocateButton = styled.Pressable`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md}px;
  top: ${({ theme }) => theme.spacing.xxl * 2 + theme.spacing.md}px;
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.none}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const LocateButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Card = styled.View`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md}px;
  left: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const LocationStatusCard = styled(Card)`
  top: ${({ theme }) => theme.spacing.xxl * 3 + theme.spacing.md}px;
`;

const PlaceCard = styled(Card)`
  bottom: ${({ theme }) => theme.spacing.md}px;
  align-items: flex-start;
`;

const PlaceEyebrow = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const StatusTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  text-align: center;
`;

const StatusText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  text-align: center;
`;
