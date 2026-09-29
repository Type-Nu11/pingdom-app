import type { SupportedLanguage } from '../../v2/shared/i18n';

// Legacy exception (#389): derived from V2 so new languages need no V1 edit. Removal: #396.
export type Language = SupportedLanguage;
export type Country = 'US' | 'CN' | 'JP' | 'TH' | 'VN' | 'KR';
export type Gender = 'male' | 'female' | 'other';

export type OnboardingData = {
  language: Language;
  country: Country;
  birthYear: number;
  gender: Gender;
};
