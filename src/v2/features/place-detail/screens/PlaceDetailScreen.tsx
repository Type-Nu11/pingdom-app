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
import { getOperatingStatusPresentation } from '../model/placePresentation';

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
  const status = getOperatingStatusPresentation(place.operatingStatus);

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Content>
        <Surface padding="lg">
          <StatusBadge label={t(status.labelKey)} tone={status.tone} />
          <Title>{place.name}</Title>
          {place.englishName ? <EnglishName>{place.englishName}</EnglishName> : null}
          <Description>{place.touristSummary ?? place.description ?? place.address}</Description>
          <Section>
            <SectionTitle>{t('placeDetail.liveStatus')}</SectionTitle>
            <Body>{place.currentlyOperating ? '영업 중' : '영업 종료'}</Body>
          </Section>
          {place.regularHours.length ? (
            <Section>
              <SectionTitle>운영시간</SectionTitle>
              {place.regularHours.map((hours, index) => (
                <Body key={`${hours.dayOfWeek ?? 'day'}-${index}`}>
                  {[hours.dayOfWeek, hours.opensAt, hours.closesAt].filter(Boolean).join(' ')}
                </Body>
              ))}
            </Section>
          ) : null}
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
