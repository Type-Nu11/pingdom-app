import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import styled from 'styled-components/native';

import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingHeading from '../../components/OnboardingHeading';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 7;
const ITEM_HEIGHT = 60;
const VISIBLE = 5;
const PAD = 2;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, index) => 1940 + index);
const DEFAULT_YEAR = 2000;
const DEFAULT_INDEX = YEARS.indexOf(DEFAULT_YEAR);

export type BirthYearSelectionScreenProps = Readonly<{
  onBack: () => void;
  onNext: (birthYear: number) => void;
}>;

export default function BirthYearSelectionScreen({ onBack, onNext }: BirthYearSelectionScreenProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);
  const progressText = t('selectLanguage.progress', { current: CURRENT_STEP, total: TOTAL_STEPS });

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedIndex(Math.max(0, Math.min(index, YEARS.length - 1)));
  }, []);

  return (
    <Screen testID="birth-year-screen">
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        onBack={onBack}
        progressLabel={progressText}
        progressValueText={progressText}
        totalSteps={TOTAL_STEPS}
      />
      <Body>
        <OnboardingHeading subtitle={t('selectAge.subtitle')} title={t('selectAge.title')} />
        <WheelOuter>
          <WheelInner>
            <SelectionBox pointerEvents="none" />
            <Wheel
              contentContainerStyle={{ paddingVertical: PAD * ITEM_HEIGHT }}
              contentOffset={{ x: 0, y: DEFAULT_INDEX * ITEM_HEIGHT }}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              testID="birth-year-wheel"
            >
              {YEARS.map((year, index) => (
                <Item key={year}>
                  <Year $distance={Math.abs(index - selectedIndex)} $below={index > selectedIndex}>
                    {year}
                  </Year>
                </Item>
              ))}
            </Wheel>
          </WheelInner>
        </WheelOuter>
        <OnboardingCtaButton
          label={t('selectAge.button')}
          onPress={() => onNext(YEARS[selectedIndex])}
          testID="birth-year-continue"
        />
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
  gap: 18px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xl + theme.spacing.xs}px;
`;

const WheelOuter = styled.View`
  flex: 1;
  justify-content: center;
  padding: 13px 18px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.fillNeutral};
`;

const WheelInner = styled.View`
  height: ${WHEEL_HEIGHT}px;
  overflow: hidden;
`;

const SelectionBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: ${(WHEEL_HEIGHT - ITEM_HEIGHT) / 2}px;
  height: ${ITEM_HEIGHT}px;
  z-index: 1;
  border-width: 2px;
  border-radius: 16px;
  border-color: ${({ theme }) => theme.colors.selectedBorder};
`;

const Wheel = styled.ScrollView`
  height: ${WHEEL_HEIGHT}px;
`;

const Item = styled.View`
  height: ${ITEM_HEIGHT}px;
  align-items: center;
  justify-content: center;
`;

const Year = styled.Text<{ $below: boolean; $distance: number }>`
  font-size: ${({ $distance }) => ($distance === 0 ? 32 : 28)}px;
  line-height: ${({ $distance }) => ($distance === 0 ? 38 : 34)}px;
  font-weight: 700;
  text-align: center;
  color: ${({ $below, $distance, theme }) => {
    if ($distance === 0) return theme.colors.primary;
    if ($distance === 1) return $below ? theme.colors.textAlternative : theme.colors.textMuted;
    if ($distance === 2) return theme.colors.textAlternative;
    return theme.colors.textDisabled;
  }};
`;
