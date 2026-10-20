import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

import { textStyleCss } from '../../../shared/theme/typography';

export type PhotoCountBadgeProps = {
  label: string;
  testID?: string;
  /** `thumbnail`: the feed card's `+N`. `gallery`: the detail photo's `n/total`. */
  variant: 'gallery' | 'thumbnail';
};

// Figma photo badges, pinned to the photo's bottom-right corner with a
// `Static/White` caption. `MoreBadge` (8082:37110): 20px tall, 6px inside the
// 80px thumbnail, 8px corners on a 60% `Static/Black` scrim. `Counter`
// (8241:47058): 8px/3px padded `Overlay/Dim` pill 12px inside the gallery photo.
export default function PhotoCountBadge({ label, testID, variant }: PhotoCountBadgeProps) {
  return (
    <Badge $variant={variant} pointerEvents="none" testID={testID}>
      <Label $variant={variant}>{label}</Label>
    </Badge>
  );
}

type VariantProps = { $variant: PhotoCountBadgeProps['variant'] };

const Badge = styled.View<VariantProps>`
  position: absolute;
  right: ${({ $variant }) => ($variant === 'thumbnail' ? 6 : 12)}px;
  bottom: ${({ $variant }) => ($variant === 'thumbnail' ? 6 : 12)}px;
  height: ${({ $variant }) => ($variant === 'thumbnail' ? 20 : 22)}px;
  justify-content: center;
  padding: 0 ${({ $variant }) => ($variant === 'thumbnail' ? 6 : 8)}px;
  border-radius: ${({ $variant, theme }) => ($variant === 'thumbnail' ? 8 : theme.radius.full)}px;
  background-color: ${({ $variant, theme }) => ($variant === 'thumbnail' ? theme.colors.overlayStrong : theme.colors.overlayDim)};
`;

const Label = styled(AppText)<VariantProps>`
  color: ${({ theme }) => theme.colors.textInverse};
  ${({ $variant, theme }) => textStyleCss($variant === 'thumbnail' ? theme.typography.captionBold : theme.typography.captionMedium)}
`;
