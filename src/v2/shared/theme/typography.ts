import { PRETENDARD_FONT_FAMILY } from '../fonts';

export function createTypography(fontFamily: string) {
  return {
    navigationTitle: {
      fontFamily,
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 23.4,
    },
    onboardingAction: {
      fontFamily,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 26,
    },
    display: {
      fontFamily,
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    title: {
      fontFamily,
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 30,
    },
    body: {
      fontFamily,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    label: {
      fontFamily,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 22,
    },
    caption: {
      fontFamily,
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    // Figma text styles (`Headline1/Bold`, `Label/Medium`, ...): every style in
    // the published library uses a 1.3 line-height multiplier.
    headline1Bold: { fontFamily, fontSize: 20, fontWeight: '700', lineHeight: 26 },
    headline2Bold: { fontFamily, fontSize: 18, fontWeight: '700', lineHeight: 23.4 },
    headline2Medium: { fontFamily, fontSize: 18, fontWeight: '500', lineHeight: 23.4 },
    bodyRegular: { fontFamily, fontSize: 16, fontWeight: '400', lineHeight: 20.8 },
    bodyMedium: { fontFamily, fontSize: 16, fontWeight: '500', lineHeight: 20.8 },
    labelBold: { fontFamily, fontSize: 14, fontWeight: '700', lineHeight: 18.2 },
    labelMedium: { fontFamily, fontSize: 14, fontWeight: '500', lineHeight: 18.2 },
    labelRegular: { fontFamily, fontSize: 14, fontWeight: '400', lineHeight: 18.2 },
    captionBold: { fontFamily, fontSize: 12, fontWeight: '700', lineHeight: 15.6 },
    captionMedium: { fontFamily, fontSize: 12, fontWeight: '500', lineHeight: 15.6 },
    captionRegular: { fontFamily, fontSize: 12, fontWeight: '400', lineHeight: 15.6 },
  } as const;
}

export const typography = createTypography(PRETENDARD_FONT_FAMILY);

export type TypographyToken = { fontSize: number; fontWeight: string; lineHeight: number };

// Size/weight/line-height declarations for a styled-components template. The
// family is left to the shared `Text`, which injects the active app font.
export function textStyleCss({ fontSize, fontWeight, lineHeight }: TypographyToken): string {
  return `font-size: ${fontSize}px; font-weight: ${fontWeight}; line-height: ${lineHeight}px;`;
}
