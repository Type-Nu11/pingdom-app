import { useTheme } from 'styled-components/native';

/**
 * Colours for the 44dp glass header buttons drawn by back.svg / settings.svg: Glass/FillSoft
 * circle, Label/Alternative glyph and the dark-only 1px Glass/Stroke (transparent in light).
 */
export function useHeaderGlassIconColors() {
  const { colors, liquidGlass } = useTheme();
  return { color: colors.textAlternative, fill: liquidGlass.navigation.softTint, stroke: colors.glassStroke };
}
