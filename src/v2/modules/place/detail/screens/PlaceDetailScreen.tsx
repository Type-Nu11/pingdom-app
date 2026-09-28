import { Text as AppText } from '../../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import type { PlaceId } from '../../core';

type PlaceDetailScreenProps = {
  route: { params: { placeId: PlaceId } };
  navigation: {
    goBack: () => void;
    navigate: {
      (screen: 'CouponBox'): void;
      (screen: 'VisitVerificationSession', params: { mode: 'place'; placeId: PlaceId }): void;
    };
  };
};
import {
  ApiErrorState,
  Button,
  LoadingState,
  StatusBadge,
  Surface,
} from '../../../../shared/components';
import { PlaceCouponCta } from '../../../booking/offers-coupons';
import { usePlaceDetail } from '../hooks/usePlaceDetail';
import {
  formatPlaceOperatingSummary,
  selectPlaceOperatingSummary,
} from '../model/placeOperatingSummary';
import { getOperatingStatusPresentation } from '../model/placePresentation';

export default function PlaceDetailScreen({ navigation, route }: PlaceDetailScreenProps) {
  const { t } = useTranslation();
  const placeQuery = usePlaceDetail(route.params.placeId);

  if (placeQuery.isPending) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('placeDetail.loading')} fill />
      </Screen>
    );
  }

  if (placeQuery.isError && !placeQuery.data) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ApiErrorState
          busy={placeQuery.isFetching} error={placeQuery.error}
          fill
          onBack={navigation.goBack}
          onRetry={() => placeQuery.refetch({ cancelRefetch: false })}
        />
      </Screen>
    );
  }

  const place = placeQuery.data;
  const status = getOperatingStatusPresentation(place.operatingStatus);
  const operatingSummary = formatPlaceOperatingSummary(
    selectPlaceOperatingSummary(place),
    (key, options) => t(key, options),
  );

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Content>
        {placeQuery.isError ? <ApiErrorState error={placeQuery.error} busy={placeQuery.isFetching} onRetry={() => placeQuery.refetch({ cancelRefetch: false })} /> : null}
        <Surface padding="lg">
          <StatusBadge label={t(status.labelKey)} tone={status.tone} />
          <Title>{place.name}</Title>
          {place.englishName ? <EnglishName>{place.englishName}</EnglishName> : null}
          <Description>{place.touristSummary ?? place.description ?? place.address}</Description>
          <Section>
            <SectionTitle>{t('placeDetail.liveStatus')}</SectionTitle>
            <OperatingLine numberOfLines={2}>
              <OperatingStatus $tone={operatingSummary.tone}>
                {operatingSummary.statusText}
              </OperatingStatus>
              {operatingSummary.detailText ? ` · ${operatingSummary.detailText}` : ''}
            </OperatingLine>
          </Section>
          <PlaceCouponCta
            onViewMyCoupons={() => navigation.navigate('CouponBox')}
            placeId={route.params.placeId}
          />
          <VerificationAction>
            <Button
              label={t('visitVerification.session.start')}
              onPress={() => navigation.navigate('VisitVerificationSession', {
                mode: 'place',
                placeId: route.params.placeId,
              })}
            />
          </VerificationAction>
          <Button label={t('placeDetail.back')} onPress={navigation.goBack} />
        </Surface>
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.ScrollView.attrs({
  contentContainerStyle: { flexGrow: 1 },
})`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled(AppText)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const EnglishName = styled(AppText)`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const Description = styled(AppText)`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.none}px;
`;

const SectionTitle = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Body = styled(AppText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const OperatingLine = styled(Body)``;

const OperatingStatus = styled(AppText)<{ $tone: 'positive' | 'neutral' | 'warning' }>`
  color: ${({ $tone, theme }) => $tone === 'positive'
    ? theme.colors.success
    : $tone === 'warning'
      ? theme.colors.warning
      : theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const VerificationAction = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
