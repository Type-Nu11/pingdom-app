import React from 'react';
import styled from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/place/report_back.svg';

type Props = Readonly<{
  currentStep: 1 | 2 | 3;
  onBack: () => void;
  backLabel: string;
  progressLabel: string;
  progressValueText: string;
}>;

export default function ReportStepHeader({
  backLabel,
  currentStep,
  onBack,
  progressLabel,
  progressValueText,
}: Props) {
  return (
    <Header>
      <BackButton
        accessibilityLabel={backLabel}
        accessibilityRole="button"
        hitSlop={12}
        onPress={onBack}
      >
        <BackIcon aria-hidden height={21} width={12} />
      </BackButton>
      <Progress
        accessibilityLabel={progressLabel}
        accessibilityRole="progressbar"
        accessibilityValue={{ max: 3, min: 1, now: currentStep, text: progressValueText }}
        accessible
      >
        {[1, 2, 3].map((step) => (
          <ProgressDot key={step} $current={step === currentStep} />
        ))}
      </Progress>
      <HeaderSide />
    </Header>
  );
}

const Header = styled.View`
  width: 100%;
  height: 44px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const BackButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
  shadow-color: #000000;
  shadow-offset: 0 4px;
  shadow-opacity: 0.06;
  shadow-radius: 10px;
  elevation: 2;
`;
const HeaderSide = styled.View`width: 44px;`;
const Progress = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;
const ProgressDot = styled.View<{ $current: boolean }>`
  width: ${({ $current }) => ($current ? 24 : 8)}px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $current, theme }) =>
    $current ? theme.colors.primary : theme.colors.border};
`;
