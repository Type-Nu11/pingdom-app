import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import type { MapPlaceCardViewModel } from '../model/mapDiscovery';

type MapSelectedPlaceCardProps = {
  error: unknown;
  loading: boolean;
  place: MapPlaceCardViewModel | null;
  visible: boolean;
};

export default function MapSelectedPlaceCard({
  error,
  loading,
  place,
  visible,
}: MapSelectedPlaceCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!visible) return null;

  return (
    <Card accessibilityLiveRegion="polite" testID="v2-selected-place">
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : error || !place ? (
        <BodyText>{t('map.card.error')}</BodyText>
      ) : (
        <>
          <Header>
            <Eyebrow>{place.category}</Eyebrow>
            <Operating $open={place.currentlyOperating === true}>
              {place.currentlyOperating === null
                ? t('map.card.statusUnknown')
                : place.currentlyOperating
                  ? t('map.card.open')
                  : t('map.card.closed')}
            </Operating>
          </Header>
          <Name>{place.name}</Name>
          <BodyText>{place.address}</BodyText>
          {place.summary ? <BodyText numberOfLines={2}>{place.summary}</BodyText> : null}
          {place.notice ? <Notice numberOfLines={2}>{place.notice}</Notice> : null}
        </>
      )}
    </Card>
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
const Header = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;
const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const Operating = styled.Text<{ $open: boolean }>`
  color: ${({ $open, theme }) => $open ? theme.colors.success : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const Name = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
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
