import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

type Props = Readonly<{
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  testID?: string;
}>;

export default function OnboardingCtaButton({
  disabled = false,
  label,
  loading = false,
  onPress,
  testID,
}: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  return (
    <Button
      $disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
    >
      {loading ? <ActivityIndicator color={colors.textInverse} /> : <Label $disabled={disabled}>{label}</Label>}
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
