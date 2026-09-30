import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import CheckIcon from '../../../../../assets/v2/icons/check.svg';
import { setLanguage, type SupportedLanguage } from '../../../../shared/i18n';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';
import {
  INITIAL_SELECTED_LANGUAGE,
  filterLanguageOptions,
  getLanguageOptions,
} from '../model/languageSelection';

const CURRENT_STEP = 2;
const TOTAL_STEPS = 7;

// Outline of assets/v2/icons/header/search.svg as the SVG transformer emits
// it, drawn inline so the stroke follows the theme instead of a fixed color.
const SEARCH_ICON_PATH = 'm19 19-4.343-4.343m0 0A8 8 0 1 0 3.343 3.343a8 8 0 0 0 11.314 11.314';

const listContent = { flexGrow: 1, gap: 26, paddingBottom: 8 } as const;

export type LanguageSelectionScreenProps = Readonly<{
  languages?: readonly SupportedLanguage[];
  onBack: () => void;
  onNext: (language: SupportedLanguage) => void;
}>;

export default function LanguageSelectionScreen({
  languages,
  onBack,
  onNext,
}: LanguageSelectionScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<SupportedLanguage>(INITIAL_SELECTED_LANGUAGE);
  const [query, setQuery] = useState('');
  const progressText = t('selectLanguage.progress', {
    current: CURRENT_STEP,
    total: TOTAL_STEPS,
  });
  const options = filterLanguageOptions(getLanguageOptions(languages), query, (key) => t(key));

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
        <Heading>
          <Title>{t('selectLanguage.title')}</Title>
          <Subtitle>{t('selectLanguage.subtitle')}</Subtitle>
        </Heading>

        <SearchBox>
          <Svg fill="none" height={18} viewBox="0 0 20 20" width={18}>
            <Path
              d={SEARCH_ICON_PATH}
              stroke={colors.labelNeutral}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </Svg>
          <SearchInput
            onChangeText={setQuery}
            placeholder={t('selectLanguage.search')}
            placeholderTextColor={colors.textAlternative}
            testID="language-search-input"
            value={query}
          />
        </SearchBox>

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
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(option.code)}
                testID={`language-option-${option.code}`}
              >
                <OptionLabel>{t(option.labelKey)}</OptionLabel>
                {isSelected ? (
                  <CheckCircle testID={`language-option-check-${option.code}`}>
                    <CheckIcon height={10} width={14} />
                  </CheckCircle>
                ) : null}
              </Option>
            );
          })}
        </List>

        <ContinueButton onPress={handleContinue} testID="language-continue">
          <ContinueLabel>{t('selectLanguage.button')}</ContinueLabel>
        </ContinueButton>
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
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xl + theme.spacing.xs}px;
`;

const Heading = styled.View`
  margin-bottom: 18px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.labelStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: 41.6px;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: 20.8px;
`;

const SearchBox = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: ${({ theme }) => theme.spacing.md}px 20px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.fillAlternative};
`;

const SearchInput = styled.TextInput`
  flex: 1;
  padding: 0;
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.headline2Medium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline2Medium.fontWeight};
`;

const List = styled.ScrollView`
  flex: 1;
`;

const Option = styled.Pressable<{ $selected: boolean }>`
  height: 56px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: 16px;
  background-color: ${({ $selected, theme }) =>
    ($selected ? theme.colors.primarySelected : 'transparent')};
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

const ContinueButton = styled.Pressable`
  height: 64px;
  margin-top: 12px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const ContinueLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textInverse};
  font-size: ${({ theme }) => theme.typography.onboardingAction.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.onboardingAction.fontWeight};
`;
