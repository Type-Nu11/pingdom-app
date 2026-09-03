import React from 'react';
import { useTheme } from 'styled-components/native';

import StarIcon from '../assets/icons/star.svg';

type FavoriteIconProps = {
  selected: boolean;
  size?: number;
};

export function FavoriteIcon({ selected, size = 24 }: FavoriteIconProps) {
  const theme = useTheme();
  return (
    <StarIcon
      color={selected ? theme.colors.primary : theme.colors.textStrong}
      fill={selected ? theme.colors.primary : 'none'}
      height={size}
      testID="favorite-icon"
      width={Math.round((size * 25) / 24)}
    />
  );
}
