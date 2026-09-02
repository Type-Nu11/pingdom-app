import React from 'react';
import styled, { useTheme } from 'styled-components/native';

import type { StatusTone } from '../model';

/** The badge speaks the same tone vocabulary as the shared status selectors. */
export type StatusBadgeTone = StatusTone;

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
};

export default function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const theme = useTheme();
  const palette = getBadgePalette(theme, tone);

  return (
    <Container
      $backgroundColor={palette.background}
      accessibilityLabel={label}
      accessible
    >
      <Dot $color={palette.content} />
      <Label $color={palette.content}>{label}</Label>
    </Container>
  );
}

function getBadgePalette(theme: ReturnType<typeof useTheme>, tone: StatusBadgeTone) {
  if (tone === 'success') {
    return { background: theme.colors.successSoft, content: theme.colors.success };
  }

  if (tone === 'warning') {
    return { background: theme.colors.warningSoft, content: theme.colors.warning };
  }

  if (tone === 'error') {
    return { background: theme.colors.dangerSoft, content: theme.colors.danger };
  }

  return { background: theme.colors.surfaceMuted, content: theme.colors.text };
}

const Container = styled.View<{ $backgroundColor: string }>`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

const Dot = styled.View<{ $color: string }>`
  width: ${({ theme }) => theme.spacing.sm}px;
  height: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $color }) => $color};
`;

const Label = styled.Text<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;
