export const lightColors = {
  background: '#FFFFFF', backgroundAssistive: '#F8F8F8', backgroundNeutral: '#F2F2F3',
  border: '#E4E4E5', borderEmphasis: '#767680', calendarSaturday: '#008BFF', calendarSunday: '#FF383C',
  danger: '#EE2B2B', dangerSoft: '#FFF0F0', disabled: '#D1D4D5', focus: '#FF4A75',
  info: '#168CFF', infoSoft: '#E8F4FF', inputBackground: '#F8F8F8', onDisabled: '#767680',
  onPrimary: '#21000A', overlay: 'rgba(17, 17, 20, 0.48)', primary: '#FF1956',
  primaryAssistive: '#FFC9D3', primaryPressed: '#E9164E', primaryRange: 'rgba(255, 201, 211, 0.48)',
  primarySelected: 'rgba(255, 25, 86, 0.08)', primarySoft: '#FFF0F4', scrim: 'rgba(0, 0, 0, 0.62)',
  selectedBorder: '#FE5E84', selectedSurface: '#FAEDF0', selectedTabSurface: 'rgba(228, 228, 229, 0.56)',
  shadow: 'rgba(0, 0, 0, 0.16)', success: '#1F9D55', successSoft: '#EAF8F0', surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF', surfaceMuted: '#F6F6F7', surfacePressed: '#EDEDEF', text: '#3B3B40',
  textAlternative: '#5E5E66', textDisabled: '#9C9CA3', textInverse: '#FFFFFF', textMuted: '#75757F',
  textSecondary: '#5E5E66', textStrong: '#0C0C0D', warning: '#C77800', warningSoft: '#FFF5E5',
} as const;

export type ThemeColors = { [Key in keyof typeof lightColors]: string };

// Figma Dark Theme (7963:8055): semantic roles mapped to the published variables.
export const darkColors = {
  background: '#0F0F11', backgroundAssistive: '#18181B', backgroundNeutral: '#08080A',
  border: '#34343A', borderEmphasis: '#7D7D88', calendarSaturday: '#66B8FF', calendarSunday: '#FF7D86',
  danger: '#FF5A5A', dangerSoft: '#3B1D22', disabled: '#38383F', focus: '#FF1956',
  info: '#3FA3FF', infoSoft: '#162B3E', inputBackground: '#1C1C20', onDisabled: '#A4A4AD',
  onPrimary: '#21000A', overlay: 'rgba(0, 0, 0, 0.68)', primary: '#FF1956',
  primaryAssistive: '#3A1422', primaryPressed: '#FF4A75', primaryRange: 'rgba(255, 25, 86, 0.18)',
  primarySelected: 'rgba(255, 25, 86, 0.12)', primarySoft: '#3A1422', scrim: 'rgba(0, 0, 0, 0.72)',
  selectedBorder: '#FF4A75', selectedSurface: '#3A1422', selectedTabSurface: 'rgba(38, 38, 43, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.48)', success: '#3FD957', successSoft: '#173326', surface: '#16161A',
  surfaceElevated: '#26262B', surfaceMuted: '#1C1C20', surfacePressed: '#2E2E33', text: '#F4F4F5',
  textAlternative: '#A9A9B2', textDisabled: '#3C3C41', textInverse: '#FFFFFF', textMuted: '#85858F',
  textSecondary: '#A9A9B2', textStrong: '#FFFFFF', warning: '#FFD43B', warningSoft: '#3A2A16',
} as const satisfies ThemeColors;

// Transitional alias while fixed light consumers are migrated to useTheme.
export const colors = lightColors;
