export type TranslationPlan = {
  sourceLanguage: string;
  targetLanguage: string;
  requiresDownload: boolean;
  shouldTranslate: boolean;
};

export type TranslationResult = {
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
};
