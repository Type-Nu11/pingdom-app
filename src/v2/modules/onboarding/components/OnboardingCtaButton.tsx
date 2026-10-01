import React from 'react';
import styled from 'styled-components/native';

type Props = Readonly<{
  disabled?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}>;

export default function OnboardingCtaButton({ disabled = false, label, onPress, testID }: Props) {
  return (
    <Button
      $disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <Label $disabled={disabled}>{label}</Label>
    </Button>
  );
}

const Button = styled.Pressable<{ $disabled: boolean }>`
  width: 100%;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $disabled, theme }) => ($disabled ? theme.colors.disabled : theme.colors.primary)};
`;

const Label = styled.Text<{ $disabled: boolean }>`
  color: ${({ $disabled, theme }) => ($disabled ? theme.colors.onDisabled : theme.colors.textInverse)};
  font-size: ${({ theme }) => theme.typography.headline1Bold.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline1Bold.fontWeight};
  line-height: ${({ theme }) => theme.typography.headline1Bold.lineHeight}px;
`;
