import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import FlagCN from '../../../../../assets/v2/flags/cn.svg';
import FlagJP from '../../../../../assets/v2/flags/jp.svg';
import FlagKR from '../../../../../assets/v2/flags/kr.svg';
import FlagTH from '../../../../../assets/v2/flags/th.svg';
import FlagUS from '../../../../../assets/v2/flags/us.svg';
import FlagVN from '../../../../../assets/v2/flags/vn.svg';
import CheckIcon from '../../../../../assets/v2/icons/check.svg';
import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingHeading from '../../components/OnboardingHeading';
import OnboardingSearchBox from '../../components/OnboardingSearchBox';
import type { OnboardingCountry } from '../../entry/model/onboardingEntry';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';
import { COUNTRY_OPTIONS, INITIAL_SELECTED_COUNTRY } from '../model/countries';

const CURRENT_STEP = 3;
const TOTAL_STEPS = 7;

const FLAGS: Record<OnboardingCountry, React.FC<{ height?: number; width?: number }>> = {
  CN: FlagCN,
  JP: FlagJP,
  KR: FlagKR,
  TH: FlagTH,
  US: FlagUS,
  VN: FlagVN,
};

const listContent = { flexGrow: 1, gap: 18, paddingBottom: 8 } as const;

export type CountrySelectionScreenProps = Readonly<{
  onBack: () => void;
  onNext: (country: OnboardingCountry) => void;
}>;

export default function CountrySelectionScreen({ onBack, onNext }: CountrySelectionScreenProps) {
  const { i18n, t } = useTranslation();
  const [selected, setSelected] = useState<OnboardingCountry>(INITIAL_SELECTED_COUNTRY);
  const [query, setQuery] = useState('');
  const progressText = t('selectLanguage.progress', { current: CURRENT_STEP, total: TOTAL_STEPS });

  const collator = new Intl.Collator(i18n.language);
  const needle = query.trim().toLowerCase();
  const options = COUNTRY_OPTIONS
    .map((option) => ({ ...option, label: t(option.labelKey) }))
    .sort((a, b) => collator.compare(a.label, b.label))
    .filter((option) => option.label.toLowerCase().includes(needle));

  return (
    <Screen testID="country-selection-screen">
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        onBack={onBack}
        progressLabel={progressText}
        progressValueText={progressText}
        totalSteps={TOTAL_STEPS}
      />
      <Body>
        <OnboardingHeading subtitle={t('selectCountry.subtitle')} title={t('selectCountry.title')} />
        <OnboardingSearchBox
          onChangeText={setQuery}
          placeholder={t('selectCountry.search')}
          testID="country-search-input"
          value={query}
        />
        <List contentContainerStyle={listContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {options.map(({ code, label }) => {
            const Flag = FLAGS[code];
            const isSelected = selected === code;
            return (
              <Option
                key={code}
                $selected={isSelected}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(code)}
                testID={`country-option-${code}`}
              >
                <OptionLeft>
                  <Flag height={32} width={32} />
                  <OptionLabel>{label}</OptionLabel>
                </OptionLeft>
                {isSelected ? (
                  <CheckCircle testID={`country-option-check-${code}`}>
                    <CheckIcon height={10} width={14} />
                  </CheckCircle>
                ) : null}
              </Option>
            );
          })}
        </List>
        <ButtonSpacing>
          <OnboardingCtaButton label={t('selectCountry.button')} onPress={() => onNext(selected)} testID="country-continue" />
        </ButtonSpacing>
      </Body>
    </Screen>
  );
}

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const Body = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xl + theme.spacing.xs}px;
`;

const List = styled.ScrollView`
  flex: 1;
`;

const Option = styled.Pressable<{ $selected: boolean }>`
  height: 62px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: 16px;
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primarySelected : 'transparent')};
`;

const OptionLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 13px;
`;

const OptionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.headline1Bold.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline1Bold.fontWeight};
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
  margin-top: 20px;
`;
