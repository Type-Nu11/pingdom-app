import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import Button from '../../../shared/components/Button';
import {
  TRAVEL_PURPOSE_OPTIONS,
  type OnboardingPreferenceIconId,
  type TravelPurpose,
  type TravelPurposeSelection,
} from '../model/onboardingPreference';

const DEFAULT_CURRENT_STEP = 5;
const DEFAULT_TOTAL_STEPS = 6;

const ICON_GLYPHS = {
  art_svg: '🖼️',
  beati_svg: '💄',
  cafe_svg: '☕',
  etc_svg: '✨',
  fashion_svg: '👗',
  food_svg: '🍜',
  hotplace: '🌙',
  maping_svg: '📍',
  music_svg: '🎤',
  popup_svg: '🎪',
} as const satisfies Record<OnboardingPreferenceIconId, string>;

export type TravelPurposeSelectionScreenProps = Readonly<{
  currentStep?: number;
  errorMessage?: string | null;
  isContinuing?: boolean;
  onBack: () => void;
  onChange: (selectedPurposes: TravelPurposeSelection) => void;
  onContinue: () => void;
  selectedPurposes: TravelPurposeSelection;
  totalSteps?: number;
}>;

export default function TravelPurposeSelectionScreen({
  currentStep = DEFAULT_CURRENT_STEP,
  errorMessage = null,
  isContinuing = false,
  onBack,
  onChange,
  onContinue,
  selectedPurposes,
  totalSteps = DEFAULT_TOTAL_STEPS,
}: TravelPurposeSelectionScreenProps) {
  const { t } = useTranslation();
  const selectedPurposeSet = new Set(selectedPurposes);

  const togglePurpose = (purpose: TravelPurpose) => {
    const nextSelection = selectedPurposeSet.has(purpose)
      ? selectedPurposes.filter((selectedPurpose) => selectedPurpose !== purpose)
      : [...selectedPurposes, purpose];

    onChange(nextSelection);
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="travel-purpose-screen">
      <TopBar>
        <BackButton
          accessibilityLabel={t('onboarding.travelPurposeScreen.back')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <BackArrow aria-hidden>‹</BackArrow>
        </BackButton>
        <Progress
          accessibilityLabel={t('onboarding.travelPurposeScreen.progress')}
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: totalSteps,
            min: 1,
            now: currentStep,
            text: t('onboarding.travelPurposeScreen.progressValue', {
              current: currentStep,
              total: totalSteps,
            }),
          }}
          accessible
        >
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            return (
              <ProgressSegment
                key={step}
                $active={step <= currentStep}
                $current={step === currentStep}
              />
            );
          })}
        </Progress>
        <TopBarSpacer />
      </TopBar>

      <ContentScroll testID="travel-purpose-scroll-view">
        <Content>
          <Heading>
            <Title>{t('onboarding.travelPurposeScreen.title')}</Title>
            <Description>{t('onboarding.travelPurposeScreen.description')}</Description>
          </Heading>

          <Options accessibilityRole="list">
            {TRAVEL_PURPOSE_OPTIONS.map((option) => {
              const label = t(option.labelKey);
              const selected = selectedPurposeSet.has(option.value);

              return (
                <Option
                  key={option.value}
                  $selected={selected}
                  accessibilityLabel={label}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => togglePurpose(option.value)}
                  testID={`travel-purpose-option-${option.value}`}
                >
                  <OptionIcon aria-hidden>{ICON_GLYPHS[option.iconId]}</OptionIcon>
                  <OptionLabel>{label}</OptionLabel>
                  {selected ? (
                    <CheckCircle aria-hidden>
                      <CheckMark>✓</CheckMark>
                    </CheckCircle>
                  ) : null}
                </Option>
              );
            })}
          </Options>

          {errorMessage ? (
            <ErrorMessage accessibilityLiveRegion="polite" testID="travel-purpose-error">
              {errorMessage}
            </ErrorMessage>
          ) : null}
        </Content>
      </ContentScroll>

      <Footer>
        <Button
          disabled={selectedPurposes.length === 0}
          fullWidth
          label={t('onboarding.travelPurposeScreen.continue')}
          loading={isContinuing}
          onPress={onContinue}
          shape="pill"
        />
      </Footer>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.none}px ${({ theme }) => theme.spacing.md}px;
`;

const BackButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xxl}px;
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: flex-start;
  justify-content: center;
`;

const BackArrow = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const TopBarSpacer = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
`;

const Progress = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ProgressSegment = styled.View<{ $active: boolean; $current: boolean }>`
  width: ${({ $current, theme }) => ($current ? theme.spacing.xl : theme.spacing.sm)}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surfacePressed};
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Heading = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Options = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ErrorMessage = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const Option = styled.Pressable<{ $selected: boolean }>`
  min-height: ${({ theme }) => theme.spacing.xxl + theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primarySoft : theme.colors.background};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primarySoft : theme.colors.background};
`;

const OptionIcon = styled.Text`
  width: ${({ theme }) => theme.spacing.xl}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
  text-align: center;
`;

const OptionLabel = styled.Text`
  flex: 1;
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const CheckCircle = styled.View`
  width: ${({ theme }) => theme.spacing.xl}px;
  height: ${({ theme }) => theme.spacing.xl}px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const CheckMark = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;
