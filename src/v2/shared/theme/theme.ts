import { colors } from './colors';
import { liquidGlass } from './liquidGlass';
import { radius } from './radius';
import { spacing } from './spacing';
import { createTypography, typography } from './typography';

export const theme = {
  colors,
  liquidGlass,
  radius,
  spacing,
  typography,
} as const;

export function createTheme(fontFamily: string): AppTheme {
  return {
    ...theme,
    typography: createTypography(fontFamily),
  };
}

export type AppTheme = typeof theme;
