import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, initializeI18n } from '..';
import { resources } from '../resources';
import { createTestI18n } from '../../testing/testProviders';
import {
  configureI18nResources,
  LANGUAGE_STORAGE_KEY,
  resetI18nForTests,
  setLanguage,
  syncProfileLanguage,
} from '../../../shared/i18n';

const { createHash } = jest.requireActual('node:crypto');

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => (
    child && typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]
  )).sort();
}

beforeEach(() => {
  resetI18nForTests();
  configureI18nResources(resources);
});

test('preserves assembled translations outside reviewed feature copy changes', () => {
  // Preserve the migration baseline with the reviewed #346 voice input, automatic voice submission, and recovery feedback.
  const baseline = JSON.parse(JSON.stringify(resources));
  for (const language of ['ko', 'en']) {
    delete baseline[language].translation.visitVerification.uploading;
    delete baseline[language].translation.visitVerification.errors;
    const voiceAssistant = baseline[language].translation.voiceAssistant;
    delete voiceAssistant.command;
    delete voiceAssistant.shortLabel;
    delete voiceAssistant.brand;
    voiceAssistant.placeholder = language === 'ko' ? '요청을 입력해 주세요' : 'Type your request';
  }
  expect(createHash('sha256').update(JSON.stringify(baseline)).digest('hex'))
    .toBe('f2dc1044fdfdba80886ded680f6c6b25b694134c843365c57988f7f1b3f4b478');
});

test('Korean and English key sets remain equal', () => {
  expect(keys(resources.ko.translation)).toEqual(keys(resources.en.translation));
});

test('hydrates stored language once and includes all domain bundles before resolving', async () => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'ko');
  const read = jest.spyOn(AsyncStorage, 'getItem');
  const first = initializeI18n('en');
  expect(initializeI18n('en')).toBe(first);
  await first;
  expect(read.mock.calls.filter(([key]) => key === LANGUAGE_STORAGE_KEY)).toHaveLength(1);
  expect(i18n.resolvedLanguage).toBe('ko');
  expect(i18n.getResourceBundle('ko', 'translation')).toEqual(resources.ko.translation);
  await syncProfileLanguage('en');
  expect(i18n.resolvedLanguage).toBe('ko');
});

test('profile hydration, explicit language persistence, and fallback are preserved', async () => {
  await initializeI18n('ko');
  expect(i18n.resolvedLanguage).toBe('ko');
  await setLanguage('en');
  expect(await AsyncStorage.getItem('language')).toBe('en');
  await syncProfileLanguage('ko');
  expect(i18n.resolvedLanguage).toBe('en');
  expect(i18n.options.fallbackLng).toEqual(['en']);
  expect(i18n.t('__missing_357__')).toBe(resources.en.translation.common.missingTranslation);
});

test.each(['en', 'ko'] as const)('test and application instances share the complete %s bundle', async (language) => {
  await initializeI18n(language);
  const instance = await createTestI18n(language);
  expect(instance.getResourceBundle(language, 'translation')).toEqual(i18n.getResourceBundle(language, 'translation'));
  expect(instance.options.fallbackLng).toEqual(i18n.options.fallbackLng);
});

test('resource registration is idempotent after initialization', async () => {
  await initializeI18n('en');
  configureI18nResources(resources);
  configureI18nResources(resources);
  expect(i18n.getResourceBundle('en', 'translation')).toEqual(resources.en.translation);
});
