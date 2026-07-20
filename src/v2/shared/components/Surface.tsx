import React, { type PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';
import styled from 'styled-components/native';

import type { AppTheme } from '../theme';

export type SurfaceTone = 'default' | 'muted' | 'outlined';
export type SurfacePadding = keyof AppTheme['spacing'];

export type SurfaceProps = PropsWithChildren<
  Omit<ViewProps, 'children' | 'style'> & {
    padding?: SurfacePadding;
    tone?: SurfaceTone;
  }
>;

export default function Surface({
  children,
  padding = 'md',
  tone = 'default',
  ...viewProps
}: SurfaceProps) {
  return (
    <Container {...viewProps} $padding={padding} $tone={tone}>
      {children}
    </Container>
  );
}

const Container = styled.View<{
  $padding: SurfacePadding;
  $tone: SurfaceTone;
}>`
  padding: ${({ $padding, theme }) => theme.spacing[$padding]}px;
  border-width: ${({ $tone }) => ($tone === 'outlined' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $tone, theme }) =>
    $tone === 'muted' ? theme.colors.surfaceMuted : theme.colors.surface};
`;
