import React from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import Button from '../../../shared/components/Button';
import type { LocationState } from '../model/map.types';

type LocationStatusOverlayProps = {
  location: LocationState;
  onRefresh: () => void;
};

export function LocationStatusOverlay({ location, onRefresh }: LocationStatusOverlayProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (location.status === 'granted') return null;
  if (location.status === 'loading') {
    return (
      <TopCard accessibilityLiveRegion="polite" testID="v2-location-loading">
        <ActivityIndicator color={theme.colors.primary} />
        <BodyText>{t('map.location.loading')}</BodyText>
      </TopCard>
    );
  }

  const denied = location.status === 'denied';
  return (
    <TopCard accessibilityLiveRegion="polite" testID={denied ? 'v2-location-denied' : 'v2-location-failed'}>
      <Title>{t(denied ? 'map.location.deniedTitle' : 'map.location.failedTitle')}</Title>
      <BodyText>
        {t(denied ? 'map.location.deniedDescription' : 'map.location.failedDescription')}
      </BodyText>
      {denied && !location.canAskAgain ? (
        <Button label={t('map.location.openSettings')} onPress={() => void Linking.openSettings()} />
      ) : null}
      <Button label={t('map.location.retry')} onPress={onRefresh} variant="secondary" />
    </TopCard>
  );
}

type MapDataStatusOverlayProps = {
  error: unknown;
  isDisabled?: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  isMock?: boolean;
  onRetry: () => void;
};

export function MapDataStatusOverlay({
  error,
  isDisabled = false,
  isEmpty,
  isLoading,
  isMock = false,
  onRetry,
}: MapDataStatusOverlayProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (isDisabled) {
    return (
      <MapCard accessibilityLiveRegion="polite" testID="v2-map-disabled">
        <Title>{t('map.data.disabledTitle')}</Title>
        <BodyText>{t('map.data.disabledDescription')}</BodyText>
      </MapCard>
    );
  }
  if (isLoading) {
    return (
      <MapCard accessibilityLiveRegion="polite" testID="v2-map-loading">
        <ActivityIndicator color={theme.colors.primary} />
        <BodyText>{t('map.data.loading')}</BodyText>
      </MapCard>
    );
  }
  if (error) {
    return (
      <MapCard accessibilityLiveRegion="polite" testID="v2-map-error">
        <Title>{t('map.data.errorTitle')}</Title>
        <BodyText>{t('map.data.errorDescription')}</BodyText>
        <Button label={t('map.data.retry')} onPress={onRetry} variant="secondary" />
      </MapCard>
    );
  }
  if (isEmpty) {
    return (
      <MapCard accessibilityLiveRegion="polite" testID="v2-map-empty">
        <Title>{t('map.data.emptyTitle')}</Title>
        <BodyText>{t('map.data.emptyDescription')}</BodyText>
      </MapCard>
    );
  }
  if (isMock) {
    return (
      <MapCard accessibilityLiveRegion="polite" testID="v2-map-mock">
        <Title>{t('map.data.mockTitle')}</Title>
        <BodyText>{t('map.data.mockDescription')}</BodyText>
      </MapCard>
    );
  }

  return null;
}

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
const TopCard = styled(Card)`top: ${({ theme }) => theme.spacing.xxl * 5}px;`;
const MapCard = styled(Card)`top: 45%;`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  text-align: center;
`;
const BodyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  text-align: center;
`;
