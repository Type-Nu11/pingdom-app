// Deliberately curated subset of ML Kit's languages, independent of UI locales.
export const translationLanguages = [
  { code: 'ko', name: '한국어', translate: '번역', original: '원문 보기' },
  { code: 'en', name: 'English', translate: 'Translate', original: 'Show original' },
  { code: 'ja', name: '日本語', translate: '翻訳', original: '原文を表示' },
  { code: 'zh', name: '中文（简体）', translate: '翻译', original: '显示原文' },
  { code: 'th', name: 'ไทย', translate: 'แปล', original: 'แสดงต้นฉบับ' },
  { code: 'vi', name: 'Tiếng Việt', translate: 'Dịch', original: 'Xem bản gốc' },
  { code: 'es', name: 'Español', translate: 'Traducir', original: 'Ver original' },
  { code: 'pt', name: 'Português', translate: 'Traduzir', original: 'Ver original' },
  { code: 'fr', name: 'Français', translate: 'Traduire', original: 'Voir l’original' },
  { code: 'ms', name: 'Bahasa Melayu', translate: 'Terjemah', original: 'Lihat asal' },
  { code: 'ta', name: 'தமிழ்', translate: 'மொழிபெயர்', original: 'அசலைக் காட்டு' },
] as const;
export type TranslationLanguage = typeof translationLanguages[number]['code'];
export const isTranslationLanguage = (value: unknown): value is TranslationLanguage =>
  translationLanguages.some((language) => language.code === value);
const countryDefaults: Record<string, TranslationLanguage | undefined> = {
  KR: 'ko',
  US: 'en', GB: 'en', CN: 'zh', JP: 'ja', TH: 'th', VN: 'vi', AR: 'es', ES: 'es', BR: 'pt', PT: 'pt',
};
// CA/SG and unknown country: explicit choice, never equate country with language.
export function recommendedTranslationLanguage(country?: string): TranslationLanguage | null {
  return countryDefaults[country?.trim().toUpperCase() ?? ''] ?? null;
}
export function missingModels(installed: readonly string[], target: TranslationLanguage): string[] {
  if (target === 'ko') return []; // Server original; no translation model is needed.
  // English is built in; other models translate to/from English internally.
  return ['ko', target].filter((code) => code !== 'en' && !installed.includes(code));
}
