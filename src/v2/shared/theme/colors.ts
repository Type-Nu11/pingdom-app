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

export const darkColors = {
  background: '#111114', backgroundAssistive: '#18181C', backgroundNeutral: '#242429',
  border: '#3A3A42', borderEmphasis: '#7D7D88', calendarSaturday: '#66B8FF', calendarSunday: '#FF7D86',
  danger: '#FF8585', dangerSoft: '#3B1D22', disabled: '#38383F', focus: '#FF6B91',
  info: '#70BAFF', infoSoft: '#162B3E', inputBackground: '#202025', onDisabled: '#A4A4AD',
  onPrimary: '#21000A', overlay: 'rgba(0, 0, 0, 0.68)', primary: '#FF6B91',
  primaryAssistive: '#5A2637', primaryPressed: '#FF86A5', primaryRange: 'rgba(255, 107, 145, 0.24)',
  primarySelected: 'rgba(255, 107, 145, 0.18)', primarySoft: '#3B1D29', scrim: 'rgba(0, 0, 0, 0.72)',
  selectedBorder: '#FF86A5', selectedSurface: '#3B222C', selectedTabSurface: 'rgba(92, 92, 102, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.48)', success: '#6DD69A', successSoft: '#173326', surface: '#1B1B20',
  surfaceElevated: '#25252B', surfaceMuted: '#242429', surfacePressed: '#303037', text: '#E2E2E7',
  textAlternative: '#C0C0C8', textDisabled: '#8A8A94', textInverse: '#FFFFFF', textMuted: '#ABABB4',
  textSecondary: '#C0C0C8', textStrong: '#FAFAFC', warning: '#FFC46B', warningSoft: '#3A2A16',
} as const satisfies ThemeColors;

// Transitional alias while fixed light consumers are migrated to useTheme.
export const colors = lightColors;
