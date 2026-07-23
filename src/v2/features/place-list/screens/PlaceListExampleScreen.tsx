import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {
  ApiErrorState,
  EmptyState,
  LoadingState,
  StatusBadge,
  Surface,
} from '../../../shared/components';
import {
  getOperatingStatusPresentation,
  getSupportLevelLabelKey,
} from '../../place-detail/model/placePresentation';
import { usePlaceList } from '../hooks/usePlaceList';

export default function PlaceListExampleScreen() {
  const { t } = useTranslation();
  const placeListQuery = usePlaceList();

  if (placeListQuery.isPending) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('examplePlaces.loading')} fill />
      </Screen>
    );
  }

  if (placeListQuery.isError) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ApiErrorState
          error={placeListQuery.error}
          fill
          onRetry={() => void placeListQuery.refetch()}
        />
      </Screen>
    );
  }

  if (placeListQuery.data.places.length === 0) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <EmptyState
          description={t('examplePlaces.emptyDescription')}
          fill
          title={t('examplePlaces.emptyTitle')}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <Title>{t('examplePlaces.title')}</Title>
        <Count>{t('examplePlaces.count', { count: placeListQuery.data.totalCount })}</Count>
      </Header>
      <List>
        <ListContent>
          {placeListQuery.data.places.map((place) => {
            const operatingStatus = getOperatingStatusPresentation(
              place.liveStatus.operatingStatus,
            );

            return (
              <Surface key={place.id} padding="lg" tone="outlined">
                <StatusBadge
                  label={t(operatingStatus.labelKey)}
                  tone={operatingStatus.tone}
                />
                <PlaceName>{place.name}</PlaceName>
                <PlaceAddress>{place.address}</PlaceAddress>
                <PlaceMetadata>
                  {t('examplePlaces.englishMenu', {
                    status: t(getSupportLevelLabelKey(place.touristSupport.englishMenu)),
                  })}
                </PlaceMetadata>
                <PlaceMetadata>
                  {t('examplePlaces.trustScore', { score: place.trustSummary.score })}
                </PlaceMetadata>
              </Surface>
            );
          })}
        </ListContent>
      </List>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const Count = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const List = styled.ScrollView`
  flex: 1;
`;

const ListContent = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.none}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xl}px;
`;

const PlaceName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const PlaceAddress = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const PlaceMetadata = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
