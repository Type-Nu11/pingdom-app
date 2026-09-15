import { PRETENDARD_FONT_FAMILY } from '../fonts';
import type { ResolvedColorScheme } from './appearance';
import { darkColors, lightColors, type ThemeColors } from './colors';
import { darkLiquidGlass, lightLiquidGlass, type LiquidGlassTheme } from './liquidGlass';
import { radius } from './radius';
import { spacing } from './spacing';
import { createTypography } from './typography';

export type AppTheme = {
  colorScheme: ResolvedColorScheme;
  colors: ThemeColors;
  liquidGlass: LiquidGlassTheme;
  radius: typeof radius;
  spacing: typeof spacing;
  typography: ReturnType<typeof createTypography>;
};

export function createTheme(fontFamily: string, colorScheme: ResolvedColorScheme = 'light'): AppTheme {
  return {
    colorScheme,
    colors: colorScheme === 'dark' ? darkColors : lightColors,
    liquidGlass: colorScheme === 'dark' ? darkLiquidGlass : lightLiquidGlass,
    radius,
    spacing,
    typography: createTypography(fontFamily),
  };
}

export const lightTheme = createTheme(PRETENDARD_FONT_FAMILY, 'light');
export const darkTheme = createTheme(PRETENDARD_FONT_FAMILY, 'dark');
export const theme = lightTheme;
