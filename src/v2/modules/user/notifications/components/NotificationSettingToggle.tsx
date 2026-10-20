import { Text as AppText } from '../../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

import { SettingToggle } from '../../../../shared/components';

export type NotificationSettingToggleProps = {
  description?: string;
  disabled?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  label: string;
  onValueChange?: (value: boolean) => void;
  testID?: string;
  value?: boolean;
};

/** Figma Setting/ToggleRow (5939:24205): label, optional description and Setting/Toggle. */
export default function NotificationSettingToggle({
  description,
  disabled = false,
  errorMessage,
  isLoading = false,
  label,
  onValueChange,
  testID,
  value,
}: NotificationSettingToggleProps) {
  return (
    <Container>
      <Row>
        <Copy>
          <Label>{label}</Label>
          {description ? <Description>{description}</Description> : null}
        </Copy>
        <SettingToggle
          accessibilityHint={errorMessage ?? description}
          accessibilityLabel={label}
          disabled={disabled}
          isLoading={isLoading}
          onValueChange={onValueChange}
          testID={testID}
          value={value}
        />
      </Row>
      {errorMessage ? (
        <ErrorMessage accessibilityRole="alert" accessibilityLiveRegion="polite" testID={`${testID}-error`}>{errorMessage}</ErrorMessage>
      ) : null}
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: 12px 0;
`;

const Copy = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Label = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNormal};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight}px;
`;

const Description = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelAssistive};
  font-size: ${({ theme }) => theme.typography.captionRegular.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.captionRegular.fontWeight};
  line-height: ${({ theme }) => theme.typography.captionRegular.lineHeight}px;
`;

const ErrorMessage = styled(AppText)`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
