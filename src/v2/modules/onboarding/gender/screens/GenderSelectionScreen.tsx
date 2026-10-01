import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import CheckGenderIcon from '../../../../../assets/v2/icons/checkgender.svg';
import FemaleIcon from '../../../../../assets/v2/icons/female.svg';
import MaleIcon from '../../../../../assets/v2/icons/male.svg';
import OtherIcon from '../../../../../assets/v2/icons/other.svg';
import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingHeading from '../../components/OnboardingHeading';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

const CURRENT_STEP = 5;
const TOTAL_STEPS = 7;

export type OnboardingGender = 'male' | 'female' | 'other';

const GENDERS: ReadonlyArray<OnboardingGender> = ['male', 'female', 'other'];

export type GenderSelectionScreenProps = Readonly<{
  onBack: () => void;
  onNext: (gender: OnboardingGender) => void;
}>;

function GenderIcon({ code, selected }: Readonly<{ code: OnboardingGender; selected: boolean }>) {
  const { colors } = useTheme();
  const color = selected ? colors.textInverse : colors.labelNeutral;

  return (
    <IconCircle $selected={selected}>
      {code === 'male' ? <MaleIcon color={color} height={22} width={22} /> : null}
      {code === 'female' ? <FemaleIcon color={color} height={22} width={15} /> : null}
      {code === 'other' ? <OtherIcon color={color} height={3} width={22} /> : null}
    </IconCircle>
  );
}

export default function GenderSelectionScreen({ onBack, onNext }: GenderSelectionScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<OnboardingGender>('male');
  const progressText = t('selectLanguage.progress', { current: CURRENT_STEP, total: TOTAL_STEPS });

  return (
    <Screen testID="gender-selection-screen">
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        onBack={onBack}
        progressLabel={progressText}
        progressValueText={progressText}
        totalSteps={TOTAL_STEPS}
      />
      <Body>
        <OnboardingHeading subtitle={t('selectGender.subtitle')} title={t('selectGender.title')} />
        <Options>
          {GENDERS.map((code) => {
            const isSelected = selected === code;
            return (
              <Card
                key={code}
                $selected={isSelected}
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(code)}
                testID={`gender-option-${code}`}
              >
                <CardLeft>
                  <GenderIcon code={code} selected={isSelected} />
                  <CardText $selected={isSelected}>{t(`selectGender.${code}`)}</CardText>
                </CardLeft>
                <Checkbox $selected={isSelected}>
                  {isSelected ? <CheckGenderIcon height={11} width={16} /> : null}
                </Checkbox>
              </Card>
            );
          })}
        </Options>
        <Spacer />
        <OnboardingCtaButton label={t('selectGender.button')} onPress={() => onNext(selected)} testID="gender-continue" />
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

const Options = styled.View`
  gap: 20px;
`;

const Card = styled.Pressable<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-width: 2px;
  border-radius: 20px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.selectedBorder : 'transparent')};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.fillNeutral)};
`;

const CardLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const IconCircle = styled.View<{ $selected: boolean }>`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.surface)};
`;

const CardText = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.textInverse : theme.colors.labelStrong)};
  font-size: ${({ theme }) => theme.typography.headline1Bold.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline1Bold.fontWeight};
`;

const Checkbox = styled.View<{ $selected: boolean }>`
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-radius: 14px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.secondaryNormal)};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : 'transparent')};
`;

const Spacer = styled.View`
  flex: 1;
`;
