import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import CheckIcon from '../../../../../assets/v2/icons/check.svg';
import { setLanguage, type SupportedLanguage } from '../../../../shared/i18n';
import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingHeading from '../../components/OnboardingHeading';
import OnboardingSearchBox from '../../components/OnboardingSearchBox';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';
import {
  INITIAL_SELECTED_LANGUAGE,
  filterLanguageOptions,
  getLanguageOptions,
} from '../model/languageSelection';

const CURRENT_STEP = 2;
const TOTAL_STEPS = 7;

const listContent = { flexGrow: 1, gap: 22, paddingBottom: 8 } as const;

export type LanguageSelectionScreenProps = Readonly<{
  onBack: () => void;
  onNext: (language: SupportedLanguage) => void;
}>;

export default function LanguageSelectionScreen({
  onBack,
  onNext,
}: LanguageSelectionScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SupportedLanguage>(INITIAL_SELECTED_LANGUAGE);
  const [query, setQuery] = useState('');
  const progressText = t('selectLanguage.progress', {
    current: CURRENT_STEP,
    total: TOTAL_STEPS,
  });
  const options = filterLanguageOptions(getLanguageOptions(), query, (key) => t(key));

  const handleContinue = () => {
    void setLanguage(selected);
    onNext(selected);
  };

  return (
    <Screen testID="language-selection-screen">
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        onBack={onBack}
        progressLabel={progressText}
        progressValueText={progressText}
        totalSteps={TOTAL_STEPS}
      />

      <Body>
        <OnboardingHeading subtitle={t('selectLanguage.subtitle')} title={t('selectLanguage.title')} />

        <OnboardingSearchBox
          onChangeText={setQuery}
          placeholder={t('selectLanguage.search')}
          testID="language-search-input"
          value={query}
        />

        <List
          contentContainerStyle={listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => {
            const isSelected = selected === option.code;
            return (
              <Option
                key={option.code}
                $selected={isSelected}
                accessibilityLanguage={option.code}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(option.code)}
                testID={`language-option-${option.code}`}
              >
                <OptionLabel>{option.endonym}</OptionLabel>
                {isSelected ? (
                  <CheckCircle testID={`language-option-check-${option.code}`}>
                    <CheckIcon height={10} width={14} />
                  </CheckCircle>
                ) : null}
              </Option>
            );
          })}
        </List>

        <ButtonSpacing>
          <OnboardingCtaButton label={t('selectLanguage.button')} onPress={handleContinue} testID="language-continue" />
        </ButtonSpacing>
      </Body>
    </Screen>
  );
}

// Text stays on the platform system font, matching the other first-run
// onboarding steps that still render before the V2 preference screens.
const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const Body = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px 51px;
`;

// Figma starts this list 2px closer to the search field than the country list.
const List = styled.ScrollView`
  flex: 1;
  margin-top: -2px;
`;

const Option = styled.Pressable<{ $selected: boolean }>`
  height: 60px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: 16px;
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryTint : 'transparent')};
`;

const OptionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.onboardingAction.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.onboardingAction.fontWeight};
`;

const CheckCircle = styled.View`
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ButtonSpacing = styled.View`
  margin-top: 12px;
`;
