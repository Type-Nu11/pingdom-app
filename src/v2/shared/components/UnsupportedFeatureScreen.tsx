import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { HeaderBackButton } from './HeaderBackButton';
import StateLayout from './StateLayout';

export type UnsupportedFeatureScreenProps = {
  onBack: () => void;
};

export default function UnsupportedFeatureScreen({ onBack }: UnsupportedFeatureScreenProps) {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-unsupported-feature-screen">
      <Header>
        <HeaderBackButton
          accessibilityLabel={t('common.navigation.back')}
          onPress={onBack}
        />
      </Header>
      <StateLayout
        description={t('common.unsupportedFeature.description')}
        fill
        title={t('common.unsupportedFeature.title')}
      />
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  height: 56px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;
