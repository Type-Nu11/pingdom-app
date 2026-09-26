import React, { type ReactNode } from 'react';
import styled from 'styled-components/native';

import Button from './Button';
import { Text } from './Typography';

export type StateLayoutProps = {
  actionLabel?: string;
  actionBusy?: boolean;
  description?: string;
  fill?: boolean;
  onAction?: () => void;
  title?: string;
  visual?: ReactNode;
};

export default function StateLayout({
  actionLabel,
  actionBusy,
  description,
  fill = false,
  onAction,
  title,
  visual,
}: StateLayoutProps) {
  return (
    <Container $fill={fill} accessibilityLiveRegion="polite">
      {visual}
      {title ? <Title accessibilityRole="header">{title}</Title> : null}
      {description ? <Description>{description}</Description> : null}
      {actionLabel && onAction ? (
        <Action>
          <Button loading={actionBusy} label={actionLabel} onPress={onAction} variant="secondary" />
        </Action>
      ) : null}
    </Container>
  );
}

const Container = styled.View<{ $fill: boolean }>`
  flex: ${({ $fill }) => ($fill ? 1 : 0)};
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
  text-align: center;
`;

const Description = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  text-align: center;
`;

const Action = styled.View`
  max-width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;
