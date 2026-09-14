import { PRETENDARD_FONT_FAMILY } from '../fonts';

export function createTypography(fontFamily: string) {
  return {
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
  } as const;
}

export const typography = createTypography(PRETENDARD_FONT_FAMILY);
