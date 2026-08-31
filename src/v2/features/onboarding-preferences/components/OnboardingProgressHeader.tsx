import React from 'react';
import styled from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';

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
        <BackIcon height={44} width={44} />
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
  width: 44px;
`;

const BackButton = styled.Pressable`
  width: 44px;
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
    $active ? theme.colors.primary : theme.colors.border};
`;
