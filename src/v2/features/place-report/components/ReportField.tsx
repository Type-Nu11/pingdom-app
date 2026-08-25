import React from 'react';
import { TextInput as NativeTextInput, type TextInputProps } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

type Props = TextInputProps & Readonly<{
  error?: string;
  label: string;
}>;

export default function ReportField({ error, label, placeholderTextColor, ...props }: Props) {
  const theme = useTheme();
  return (
    <Field>
      <Label>{label}</Label>
      <Control
        {...props}
        $hasError={Boolean(error)}
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={placeholderTextColor ?? theme.colors.textMuted}
      />
      {error ? <ErrorText accessibilityLiveRegion="polite">{error}</ErrorText> : null}
    </Field>
  );
}

const Field = styled.View`
  width: 100%;
  gap: 4px;
`;
const Label = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
`;
const Control = styled(NativeTextInput)<{ $hasError: boolean }>`
  width: 100%;
  min-height: 40px;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ $hasError, theme }) =>
    $hasError ? theme.colors.danger : theme.colors.border};
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
`;
const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
