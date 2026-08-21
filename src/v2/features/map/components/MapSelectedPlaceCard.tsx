import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import type { MapPlaceCardViewModel } from '../model/mapDiscovery';

type MapSelectedPlaceCardProps = {
  error: unknown;
  loading: boolean;
  onDismiss: () => void;
  onOpenPlace: (placeId: number) => void;
  onRetry: () => void;
  place: MapPlaceCardViewModel | null;
  selectedPlaceId: number | null;
  visible: boolean;
};

export default function MapSelectedPlaceCard({
  error,
  loading,
  onDismiss,
  onOpenPlace,
  onRetry,
  place,
  selectedPlaceId,
  visible,
}: MapSelectedPlaceCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!visible) return null;

  const matchingPlace = place?.id === selectedPlaceId ? place : null;

  return (
    <Card accessibilityLiveRegion="polite" testID="v2-selected-place">
      <CardHeader>
        <HeaderLabel>{t('map.card.preview')}</HeaderLabel>
        <DismissButton
          accessibilityLabel={t('map.card.dismiss')}
          accessibilityRole="button"
          onPress={onDismiss}
          testID="v2-selected-place-dismiss"
        >
          <DismissLabel>×</DismissLabel>
        </DismissButton>
      </CardHeader>
      {loading || (!error && !matchingPlace) ? (
        <CardState>
          <ActivityIndicator color={theme.colors.primary} />
          <BodyText>{t('map.card.loading')}</BodyText>
        </CardState>
      ) : error ? (
        <CardState>
          <BodyText>{t('map.card.error')}</BodyText>
          <RetryButton
            accessibilityRole="button"
            onPress={onRetry}
            testID="v2-selected-place-retry"
          >
            <RetryLabel>{t('map.data.retry')}</RetryLabel>
          </RetryButton>
        </CardState>
      ) : matchingPlace ? (
        <SelectedPlaceContent onOpenPlace={onOpenPlace} place={matchingPlace} />
      ) : null}
    </Card>
  );
}

function SelectedPlaceContent({
  onOpenPlace,
  place,
}: Pick<MapSelectedPlaceCardProps, 'onOpenPlace'> & { place: MapPlaceCardViewModel }) {
  const { t } = useTranslation();

  return (
    <CardContent
      accessibilityHint={t('map.card.openHint')}
      accessibilityRole="button"
      onPress={() => onOpenPlace(place.id)}
      testID="v2-selected-place-open"
    >
      <PlaceImage imageUrl={place.imageUrl} name={place.name} />
      <Details>
        <Header>
          <Eyebrow numberOfLines={1}>{place.category}</Eyebrow>
          {place.distanceMeters !== null ? (
            <Distance>
              {t('map.distanceMeters', { count: Math.round(place.distanceMeters) })}
            </Distance>
          ) : null}
        </Header>
        <Name numberOfLines={1}>{place.name}</Name>
        <Operating $open={place.currentlyOperating === true}>
          {place.currentlyOperating === null
            ? t('map.card.statusUnknown')
            : place.currentlyOperating
              ? t('map.card.open')
              : t('map.card.closed')}
        </Operating>
        <BodyText numberOfLines={1}>{place.address}</BodyText>
        {place.summary ? <BodyText numberOfLines={2}>{place.summary}</BodyText> : null}
        {place.notice ? <Notice numberOfLines={2}>{place.notice}</Notice> : null}
      </Details>
    </CardContent>
  );
}

function PlaceImage({ imageUrl, name }: Pick<MapPlaceCardViewModel, 'imageUrl' | 'name'>) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [imageUrl]);

  if (!imageUrl || failed) {
    return (
      <ImageFallback testID="v2-selected-place-image-fallback">
        <ImageFallbackText>{t('map.card.imageUnavailable')}</ImageFallbackText>
      </ImageFallback>
    );
  }

  return (
    <Photo
      accessibilityLabel={t('map.card.imageLabel', { name })}
      onError={() => setFailed(true)}
      source={{ uri: imageUrl }}
      testID="v2-selected-place-image"
    />
  );
}

const Card = styled.View`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md}px;
  bottom: ${({ theme }) => theme.spacing.md}px;
  left: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const HeaderLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const DismissButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.lg}px;
  height: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const DismissLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
`;
const CardState = styled.View`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
const RetryButton = styled.Pressable`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;
const RetryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const CardContent = styled.Pressable`
  flex-direction: row;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
const Photo = styled(Image)`
  width: ${({ theme }) => theme.spacing.xxl * 2}px;
  height: ${({ theme }) => theme.spacing.xxl * 2}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const ImageFallback = styled.View`
  width: ${({ theme }) => theme.spacing.xxl * 2}px;
  height: ${({ theme }) => theme.spacing.xxl * 2}px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const ImageFallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
`;
const Details = styled.View`flex: 1;`;
const Header = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;
const Eyebrow = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const Distance = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const Operating = styled.Text<{ $open: boolean }>`
  color: ${({ $open, theme }) => $open ? theme.colors.success : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const Name = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const BodyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
const Notice = styled.Text`
  padding: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.warning};
  background-color: ${({ theme }) => theme.colors.warningSoft};
`;
