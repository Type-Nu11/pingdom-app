import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import type { V2ScreenProps } from '../../../app/navigation/types';
import { Button, Surface } from '../../../shared/components';

export default function PlaceDetailScreen({ navigation, route }: V2ScreenProps<'PlaceDetail'>) {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Surface padding="lg">
        <Title>{t('placeDetail.title')}</Title>
        <Description>{t('placeDetail.placeId', { placeId: route.params.placeId })}</Description>
        <Button label={t('placeDetail.back')} onPress={navigation.goBack} />
      </Surface>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const Description = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
