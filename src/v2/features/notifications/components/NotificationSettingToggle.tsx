import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

export type NotificationSettingToggleProps = {
  description?: string;
  errorMessage?: string;
  isLoading?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  testID?: string;
  value: boolean;
};

export default function NotificationSettingToggle({
  description,
  errorMessage,
  isLoading = false,
  label,
  onValueChange,
  testID,
  value,
}: NotificationSettingToggleProps) {
  const theme = useTheme();

  return (
    <Container>
      <Row>
        <Copy>
          <Label>{label}</Label>
          {description ? <Description>{description}</Description> : null}
        </Copy>
        <Toggle
          $enabled={value}
          accessibilityHint={errorMessage}
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ busy: isLoading, checked: value, disabled: isLoading }}
          disabled={isLoading}
          hitSlop={8}
          onPress={() => onValueChange(!value)}
          testID={testID}
        >
          <Thumb $enabled={value}>
            {isLoading ? (
              <ActivityIndicator
                color={value ? theme.colors.primary : theme.colors.textMuted}
                size="small"
              />
            ) : null}
          </Thumb>
        </Toggle>
      </Row>
      {errorMessage ? (
        <ErrorMessage accessibilityLiveRegion="polite">{errorMessage}</ErrorMessage>
      ) : null}
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
`;

const Row = styled.View`
  min-height: 61px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Copy = styled.View`
  flex: 1;
  gap: 2px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const Toggle = styled.Pressable<{ $enabled: boolean }>`
  width: 58px;
  height: 36px;
  flex-shrink: 0;
  justify-content: center;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $enabled, theme }) => (
    $enabled ? theme.colors.primary : theme.colors.disabled
  )};
`;

const Thumb = styled.View<{ $enabled: boolean }>`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  align-self: ${({ $enabled }) => ($enabled ? 'flex-end' : 'flex-start')};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
  shadow-color: #000;
  shadow-offset: 0 1px;
  shadow-opacity: 0.15;
  shadow-radius: 2px;
  elevation: 2;
`;

const ErrorMessage = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
