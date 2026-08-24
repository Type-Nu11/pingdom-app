import React from 'react';
import { SvgXml } from 'react-native-svg';
import styled from 'styled-components/native';

const BACK_ICON = '<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

type Props = Readonly<{
  backLabel: string;
  currentStep: number;
  onBack: () => void;
  progressLabel: string;
  progressValueText: string;
  totalSteps: number;
}>;

export default function OnboardingProgressHeader({
  backLabel,
  currentStep,
  onBack,
  progressLabel,
  progressValueText,
  totalSteps,
}: Props) {
  return (
    <Header>
      <BackButton
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
      >
        <SvgXml aria-hidden height={21} width={12} xml={BACK_ICON} />
      </BackButton>

      <Progress
        accessibilityLabel={progressLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: totalSteps,
          min: 1,
          now: currentStep,
          text: progressValueText,
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

      <HeaderSide />
    </Header>
  );
}

const Header = styled.View`
  height: 105px;
  padding-top: 80px;
  padding-right: 24px;
  padding-left: 24px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

const HeaderSide = styled.View`
  width: 40px;
`;

const BackButton = styled.Pressable`
  width: 40px;
  align-items: flex-start;
  justify-content: center;
`;

const Progress = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const ProgressSegment = styled.View<{ $active: boolean; $current: boolean }>`
  width: ${({ $current }) => ($current ? 26 : 7)}px;
  height: 7px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surfacePressed};
`;
