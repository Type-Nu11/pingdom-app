import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import type { V2ScreenProps } from '../../../app/navigation/types';
import {
  ApiErrorState,
  Button,
  LoadingState,
  StatusBadge,
  Surface,
} from '../../../shared/components';
import { usePlaceDetail } from '../hooks/usePlaceDetail';
import {
  getOperatingStatusPresentation,
  getSupportLevelLabelKey,
  getTrustConfidenceLabelKey,
} from '../model/placePresentation';

export default function PlaceDetailScreen({ navigation, route }: V2ScreenProps<'PlaceDetail'>) {
  const { t } = useTranslation();
  const placeQuery = usePlaceDetail(route.params.placeId);

  if (placeQuery.isPending) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('placeDetail.loading')} fill />
      </Screen>
    );
  }

  if (placeQuery.isError) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ApiErrorState
          error={placeQuery.error}
          fill
          onBack={navigation.goBack}
          onRetry={() => void placeQuery.refetch()}
        />
      </Screen>
    );
  }

  const place = placeQuery.data;
  const status = getOperatingStatusPresentation(place.liveStatus.operatingStatus);
  const waitTime = place.liveStatus.waitTimeMinutes === null
    ? t('placeDetail.unknownValue')
    : t('placeDetail.waitMinutes', { count: place.liveStatus.waitTimeMinutes });

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Content>
        <Surface padding="lg">
          <StatusBadge label={t(status.labelKey)} tone={status.tone} />
          <Title>{place.name}</Title>
          {place.englishName ? <EnglishName>{place.englishName}</EnglishName> : null}
          <Description>{place.touristSummary ?? place.address}</Description>
          <Section>
            <SectionTitle>{t('placeDetail.liveStatus')}</SectionTitle>
            <Body>{t('placeDetail.waitTime', { value: waitTime })}</Body>
            <Body>
              {t('placeDetail.couponUsage', {
                value: t(getSupportLevelLabelKey(place.liveStatus.couponUsageStatus)),
              })}
            </Body>
          </Section>
          <Section>
            <SectionTitle>{t('placeDetail.touristSupport')}</SectionTitle>
            <Body>
              {t('placeDetail.englishMenu', {
                value: t(getSupportLevelLabelKey(place.touristSupport.englishMenu)),
              })}
            </Body>
            <Body>
              {t('placeDetail.languages', {
                value: place.touristSupport.supportedLanguages.length > 0
                  ? place.touristSupport.supportedLanguages.join(', ')
                  : t('placeDetail.unknownValue'),
              })}
            </Body>
          </Section>
          <Section>
            <SectionTitle>{t('placeDetail.trust')}</SectionTitle>
            <Body>
              {t('placeDetail.trustScore', {
                confidence: t(getTrustConfidenceLabelKey(place.trustSummary.confidence)),
                score: place.trustSummary.score,
              })}
            </Body>
          </Section>
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

const Title = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const EnglishName = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const Description = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.none}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Body = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;
