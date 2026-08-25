import React from 'react';
import type { PressableProps } from 'react-native';
import styled from 'styled-components/native';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
};

export default function PlaceReportEntryButton({ label, ...pressableProps }: Props) {
  return (
    <EntryButton
      {...pressableProps}
      accessibilityLabel={pressableProps.accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      <EntryButtonText>{label}</EntryButtonText>
    </EntryButton>
  );
}

const EntryButton = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const EntryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
