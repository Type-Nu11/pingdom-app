import React, { forwardRef, useState } from 'react';
import {
  TextInput as NativeTextInput,
  type TextInputProps,
} from 'react-native';
import styled, { useTheme } from 'styled-components/native';

export type InputProps = Omit<TextInputProps, 'editable' | 'style'> & {
  disabled?: boolean;
  editable?: boolean;
  error?: string;
  hint?: string;
  label?: string;
};

const Input = forwardRef<NativeTextInput, InputProps>(function Input(
  {
    disabled = false,
    editable = true,
    error,
    hint,
    label,
    onBlur,
    onFocus,
    placeholderTextColor,
    ...textInputProps
  },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const supportingText = error ?? hint;

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <Field>
      {label ? <Label>{label}</Label> : null}
      <Control
        {...textInputProps}
        ref={ref}
        $disabled={disabled}
        $focused={focused}
        $hasError={Boolean(error)}
        accessibilityState={{ disabled }}
        editable={!disabled && editable}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
      />
      {supportingText ? (
        <SupportingText $hasError={Boolean(error)}>{supportingText}</SupportingText>
      ) : null}
    </Field>
  );
});

const Field = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
`;

const Control = styled(NativeTextInput)<{
  $disabled: boolean;
  $focused: boolean;
  $hasError: boolean;
}>`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ $focused, $hasError, theme }) => {
    if ($hasError) return theme.colors.danger;
    if ($focused) return theme.colors.focus;
    return theme.colors.border;
  }};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.surfaceMuted : theme.colors.inputBackground};
  color: ${({ $disabled, theme }) =>
    $disabled ? theme.colors.textDisabled : theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const SupportingText = styled.Text<{ $hasError: boolean }>`
  color: ${({ $hasError, theme }) =>
    $hasError ? theme.colors.danger : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

export default Input;
