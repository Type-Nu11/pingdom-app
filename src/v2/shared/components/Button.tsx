import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  type PressableProps,
  type View,
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'medium' | 'large' | 'onboarding';
export type ButtonShape = 'rounded' | 'pill';

export type ButtonProps = Omit<PressableProps, 'children' | 'disabled' | 'style'> & {
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  loading?: boolean;
  shape?: ButtonShape;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const Button = forwardRef<View, ButtonProps>(function Button(
  {
    accessibilityLabel,
    disabled = false,
    fullWidth = false,
    label,
    loading = false,
    onPressIn,
    onPressOut,
    shape = 'rounded',
    size = 'large',
    variant = 'primary',
    ...pressableProps
  },
  ref,
) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const palette = getButtonPalette(theme, variant, pressed, isDisabled);

  const handlePressIn = (event: GestureResponderEvent) => {
    setPressed(true);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    onPressOut?.(event);
  };

  return (
    <Container
      {...pressableProps}
      ref={ref}
      $backgroundColor={palette.background}
      $borderColor={palette.border}
      $fullWidth={fullWidth}
      $shape={shape}
      $size={size}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {loading ? (
        <ActivityIndicator color={palette.content} />
      ) : (
        <Label $color={palette.content} $size={size}>{label}</Label>
      )}
    </Container>
  );
});

function getButtonPalette(
  theme: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
  pressed: boolean,
  disabled: boolean,
) {
  if (disabled) {
    return {
      background: theme.colors.disabled,
      border: theme.colors.disabled,
      content: theme.colors.onDisabled,
    };
  }

  if (variant === 'secondary') {
    return {
      background: pressed ? theme.colors.primarySoft : theme.colors.surface,
      border: theme.colors.primary,
      content: theme.colors.primary,
    };
  }

  if (variant === 'ghost') {
    return {
      background: pressed ? theme.colors.surfacePressed : theme.colors.surface,
      border: pressed ? theme.colors.surfacePressed : theme.colors.surface,
      content: theme.colors.textStrong,
    };
  }

  return {
    background: pressed ? theme.colors.primaryPressed : theme.colors.primary,
    border: pressed ? theme.colors.primaryPressed : theme.colors.primary,
    content: theme.colors.onPrimary,
  };
}

type ContainerProps = {
  $backgroundColor: string;
  $borderColor: string;
  $fullWidth: boolean;
  $shape: ButtonShape;
  $size: ButtonSize;
};

const Container = styled.Pressable<ContainerProps>`
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-height: ${({ $size, theme }) =>
    $size === 'onboarding'
      ? theme.spacing.xxl + theme.spacing.md
      : $size === 'large'
        ? theme.spacing.xxl
        : theme.spacing.xl + theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.none}px ${({ theme }) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};
  border-radius: ${({ $shape, theme }) =>
    $shape === 'pill' ? theme.radius.full : theme.radius.md}px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

const Label = styled.Text<{ $color: string; $size: ButtonSize }>`
  color: ${({ $color }) => $color};
  font-size: ${({ $size, theme }) =>
    $size === 'onboarding'
      ? theme.typography.onboardingAction.fontSize
      : theme.typography.label.fontSize}px;
  font-weight: ${({ $size, theme }) =>
    $size === 'onboarding'
      ? theme.typography.onboardingAction.fontWeight
      : theme.typography.label.fontWeight};
  line-height: ${({ $size, theme }) =>
    $size === 'onboarding'
      ? theme.typography.onboardingAction.lineHeight
      : theme.typography.label.lineHeight}px;
`;

export default Button;
