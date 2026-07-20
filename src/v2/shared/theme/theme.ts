import { colors } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  radius,
  spacing,
  typography,
} as const;

export type AppTheme = typeof theme;
