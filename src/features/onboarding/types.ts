export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'vi' | 'th';
export type Country = 'US' | 'CN' | 'JP' | 'TH' | 'VN' | 'KR';
export type Gender = 'male' | 'female' | 'other';

export type OnboardingData = {
  language: Language;
  country: Country;
  birthYear: number;
  gender: Gender;
};
