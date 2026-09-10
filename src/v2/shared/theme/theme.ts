import { colors } from './colors';
import { liquidGlass } from './liquidGlass';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  liquidGlass,
  radius,
  spacing,
  typography,
} as const;

export type AppTheme = typeof theme;
