import { createTestI18n } from '../../testing/testProviders';
import { getLanguageEndonym, normalizeSupportedLanguage, supportedLanguages } from '../../../shared/i18n';

test('Thai device/profile locales and native names select the actual Thai catalog', async () => {
  expect(supportedLanguages).toContain('th');
  for (const value of ['th', 'th-TH', 'th_TH', 'Thai', 'ภาษาไทย', '태국어']) {
    expect(normalizeSupportedLanguage(value)).toBe('th');
  }
  expect(getLanguageEndonym('th')).toBe('ภาษาไทย');
  const instance = await createTestI18n('th');
  expect(instance.resolvedLanguage).toBe('th');
  for (const key of ['auth.login.title', 'settings.title', 'routes.walking.request', 'routes.openPlanner', 'routes.setDestination', 'routes.states.empty', 'voiceAssistant.placeholder', 'voiceAssistant.wakeWord.notice']) {
    expect(instance.t(key)).toMatch(/[\u0E00-\u0E7F]/);
    expect(instance.t(key)).not.toBe(instance.t(key, { lng: 'en' }));
  }
});
