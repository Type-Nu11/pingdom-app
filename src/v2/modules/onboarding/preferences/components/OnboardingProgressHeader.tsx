import React from 'react';
import Svg, { Path } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

type Props = Readonly<{
  backLabel: string;
  currentStep: number;
  onBack?: () => void;
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
  const { colors } = useTheme();

  return (
    <Header>
      {onBack ? (
        <BackButton
          accessibilityLabel={backLabel}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <Svg fill="none" height={44} viewBox="16 16 44 44" width={44}>
            <Path
              d="M41 30L33 38L41 46"
              stroke={colors.textAlternative}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </Svg>
        </BackButton>
      ) : (
        <HeaderSide />
      )}

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
  height: 44px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.glassStroke};
  border-radius: 22px;
  background-color: ${({ theme }) => theme.colors.glassFill};
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
    $active ? theme.colors.primary : theme.colors.fillAlternative};
`;
