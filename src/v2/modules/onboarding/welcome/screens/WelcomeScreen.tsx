import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingGlow from '../../components/OnboardingGlow';
import OnboardingHero from '../../components/OnboardingHero';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

const CURRENT_STEP = 1;
const TOTAL_STEPS = 7;

export type WelcomeScreenProps = Readonly<{
  onNext: () => void;
}>;

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const progressText = t('selectLanguage.progress', { current: CURRENT_STEP, total: TOTAL_STEPS });

  return (
    <Screen testID="welcome-screen">
      <OnboardingGlow />
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        progressLabel={progressText}
        progressValueText={progressText}
        topGap={10}
        totalSteps={TOTAL_STEPS}
      />
      <Body>
        <OnboardingHero
          heroTop={176}
          logoAccessibilityLabel={t('selectLanguage.logoAccessibilityLabel')}
          subtitle={t('loginForeign.subtitle')}
          title={t('loginForeign.title')}
        />
        <OnboardingCtaButton label={t('loginForeign.button')} onPress={onNext} testID="welcome-start" />
      </Body>
    </Screen>
  );
}

const Screen = styled.View`
  flex: 1;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const Body = styled.View`
  flex: 1;
  padding: 0 24px 46px;
`;
