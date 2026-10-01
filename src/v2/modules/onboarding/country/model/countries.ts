import type { OnboardingCountry } from '../../entry/model/onboardingEntry';

export const INITIAL_SELECTED_COUNTRY: OnboardingCountry = 'US';

// Keys match `countries.*` in the i18n catalog.
export const COUNTRY_OPTIONS: ReadonlyArray<Readonly<{ code: OnboardingCountry; labelKey: string }>> = [
  { code: 'US', labelKey: 'countries.us' },
  { code: 'CN', labelKey: 'countries.cn' },
  { code: 'JP', labelKey: 'countries.jp' },
  { code: 'TH', labelKey: 'countries.th' },
  { code: 'VN', labelKey: 'countries.vn' },
  { code: 'KR', labelKey: 'countries.kr' },
];
