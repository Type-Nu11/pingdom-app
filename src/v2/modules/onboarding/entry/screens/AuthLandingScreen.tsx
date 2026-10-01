import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingGlow from '../../components/OnboardingGlow';
import OnboardingHero from '../../components/OnboardingHero';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';
import type { AuthEntryVariant } from '../model/onboardingEntry';

export type AuthLandingScreenProps = Readonly<{
  entryVariant: AuthEntryVariant;
  onBack: () => void;
  onLogin: () => void;
  onSignup: () => void;
}>;

// Existing-account login is offered for every selected country; the variant
// only picks the marketing copy.
export default function AuthLandingScreen({
  entryVariant,
  onBack,
  onLogin,
  onSignup,
}: AuthLandingScreenProps) {
  const { t } = useTranslation();
  const copy = entryVariant === 'kr'
    ? {
      button: t('auth.koreanEntry.start'),
      subtitle: t('auth.koreanEntry.subtitle'),
      title: t('auth.koreanEntry.title'),
    }
    : {
      button: t('loginForeign.button'),
      subtitle: t('loginForeign.subtitle'),
      title: t('loginForeign.title'),
    };

  return (
    <Screen testID="auth-landing-screen">
      <OnboardingGlow />
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={0}
        onBack={onBack}
        progressLabel=""
        progressValueText=""
        totalSteps={0}
      />
      <Body>
        <OnboardingHero
          logoAccessibilityLabel={t('selectLanguage.logoAccessibilityLabel')}
          subtitle={copy.subtitle}
          title={copy.title}
        />
        <BottomGroup>
          <LoginRow>
            <LoginText>{t('auth.koreanEntry.existingAccount')}</LoginText>
            <LoginLink accessibilityRole="button" onPress={onLogin} testID="auth-landing-login">
              <LoginLinkLabel>{t('auth.koreanEntry.login')}</LoginLinkLabel>
            </LoginLink>
          </LoginRow>
          <OnboardingCtaButton label={copy.button} onPress={onSignup} testID="auth-landing-signup" />
        </BottomGroup>
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
  padding: 0 28px 36px;
`;

const BottomGroup = styled.View`
  align-items: center;
  gap: 18px;
`;

const LoginRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LoginText = styled.Text`
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
`;

const LoginLink = styled.Pressable``;

const LoginLinkLabel = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  text-decoration-line: underline;
`;
