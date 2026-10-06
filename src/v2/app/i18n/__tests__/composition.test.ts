import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, initializeI18n } from '..';
import { resources } from '../resources';
import { createTestI18n } from '../../testing/testProviders';
import {
  configureI18nResources,
  LANGUAGE_STORAGE_KEY,
  resetI18nForTests,
  setLanguage,
  supportedLanguages,
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
  // Preserve the migration baseline with the reviewed #346 voice input, automatic voice submission,
  // recovery feedback, and #338 community list/detail/write copy.
  const baseline = JSON.parse(JSON.stringify(resources));
  const addedLanguages = supportedLanguages.filter((language) => language !== 'ko' && language !== 'en');
  // Catalogs added after ko/en (#389 ja, #413 zh-CN/zh-TW, ...) have their key parity checked separately.
  for (const added of addedLanguages) delete baseline[added];
  for (const language of ['ko', 'en']) {
    // #392 adds the reviewed menu price conversion copy.
    delete baseline[language].translation.placeMenu.exchange;
    // #393 adds the reviewed first-run tutorial catalog.
    delete baseline[language].translation.mapTutorial;
    // #390 reviews only shared error presentation and uncertain reservation outcomes.
    const apiError = baseline[language].translation.common.apiError;
    for (const key of ['timeout', 'server', 'rateLimited', 'mutationUnknown']) delete apiError[key];
    apiError.authentication.description = language === 'ko'
      ? '로그인 정보 또는 요청 키가 만료되었습니다. 다시 로그인해 주세요.'
      : 'Your session or request key is no longer valid. Please sign in again.';
    baseline[language].translation.reservation.create.submitNetworkError = language === 'ko'
      ? '네트워크 문제예요. 연결을 확인하고 다시 시도해 주세요.'
      : 'Network problem. Check your connection and try again.';
    delete baseline[language].translation.visitVerification.uploading;
    delete baseline[language].translation.visitVerification.errors;
    // #398 adds the accessibility label for the extra review reason count.
    // #398 adds inline review expansion copy to the place detail info tab.
    delete baseline[language].translation.map.detail.viewAllReviews;
    delete baseline[language].translation.map.detail.collapseReviews;
    delete baseline[language].translation.visitVerification.reasonMoreCount;
    // #398 aligns the recommendation-reason screen copy with the reviewed Figma design.
    delete baseline[language].translation.visitVerification.reasonSelectedSuffix;
    baseline[language].translation.visitVerification.reasonHelp = language === 'ko' ? '최대 5개 선택' : 'Select up to 5';
    baseline[language].translation.visitVerification.reviewPlaceholder = language === 'ko'
      ? '다른 사람들에게 이 장소의 좋은 점을 알려주세요.'
      : 'Tell others what you liked about this place.';
    const voiceAssistant = baseline[language].translation.voiceAssistant;
    delete voiceAssistant.command;
    delete voiceAssistant.shortLabel;
    delete voiceAssistant.brand;
    voiceAssistant.placeholder = language === 'ko' ? '요청을 입력해 주세요' : 'Type your request';
    delete baseline[language].translation.community;
    delete baseline[language].translation.map.navigation.community;
    // #389 moves the reservation sheet distance copy out of the component.
    delete baseline[language].translation.reservation.list.distanceFar;
    delete baseline[language].translation.reservation.list.distanceNear;
    // Each added language also adds its option label to the language pickers.
    for (const added of addedLanguages) delete baseline[language].translation.selectLanguage.options[added];
    delete baseline[language].translation.settings.language.japanese;
    // #396 language pickers show each language's own name, so these labels were removed.
    const { description, ...languageRest } = baseline[language].translation.settings.language;
    baseline[language].translation.settings.language = {
      description,
      english: language === 'ko' ? '영어' : 'English',
      korean: language === 'ko' ? '한국어' : 'Korean',
      ...languageRest,
    };
    // #389 moves the My Trip weekday header out of the component.
    delete baseline[language].translation.myPage.travel.weekdays;
    // #399 adds the profile photo picker, retry, and permission copy.
    for (const key of [
      'avatarCameraPermissionDenied',
      'avatarCancel',
      'avatarFileTooLarge',
      'avatarFromCamera',
      'avatarFromLibrary',
      'avatarOpenSettings',
      'avatarRetry',
      'avatarSheetTitle',
      'avatarTypeUnsupported',
    ]) {
      delete baseline[language].translation.myPage.profileEdit[key];
    }
    // #399 extends the existing permission message with a Settings hint.
    baseline[language].translation.myPage.profileEdit.avatarPermissionDenied = ({
      en: 'Photo library access is required to change your profile image.',
      ja: 'プロフィール画像を変更するには、写真ライブラリへのアクセスが必要です。',
      ko: '프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다.',
    } as Record<string, string>)[language];
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

test.each([...supportedLanguages])('test and application instances share the complete %s bundle', async (language) => {
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

describe('#389 Japanese language preference', () => {
  test('explicit ja selection applies immediately, persists, and survives a restart', async () => {
    await initializeI18n('ko');
    await setLanguage('ja');
    expect(i18n.resolvedLanguage).toBe('ja');
    expect(i18n.t('settings.title')).toBe('設定');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja');

    resetI18nForTests();
    await initializeI18n('ko');
    expect(i18n.resolvedLanguage).toBe('ja');
    await syncProfileLanguage('en');
    expect(i18n.resolvedLanguage).toBe('ja');
  });

  test('a Japanese profile applies only while there is no stored choice', async () => {
    await initializeI18n('ja');
    expect(i18n.resolvedLanguage).toBe('ja');

    resetI18nForTests();
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'ko');
    await initializeI18n('ja');
    expect(i18n.resolvedLanguage).toBe('ko');
    await syncProfileLanguage('ja-JP');
    expect(i18n.resolvedLanguage).toBe('ko');
  });

  test('a later profile refetch with ja-JP is normalized and applied without a stored choice', async () => {
    await initializeI18n('en');
    await syncProfileLanguage('ja-JP');
    expect(i18n.resolvedLanguage).toBe('ja');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  test('keeps ja active when persistence fails and does not restore it after restart', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('quota'));
    await initializeI18n('en');
    await setLanguage('ja');
    expect(i18n.resolvedLanguage).toBe('ja');
    expect(warn).toHaveBeenCalledWith('[V2 i18n] Failed to persist language.');

    resetI18nForTests();
    await initializeI18n('ko');
    expect(i18n.resolvedLanguage).toBe('ko');
  });

  test('missing Japanese keys keep the existing fallback policy instead of hiding gaps', async () => {
    await initializeI18n('ja');
    expect(i18n.options.fallbackLng).toEqual(['en']);
    expect(i18n.t('__missing_389__')).toBe(resources.en.translation.common.missingTranslation);
    expect(i18n.getResourceBundle('ja', 'translation')).toEqual(resources.ja.translation);
  });

  test('Japanese has a single plural category, so _other is used for every count', async () => {
    await initializeI18n('ja');
    expect(i18n.t('map.detail.reviewCount', { count: 1 })).toBe('レビュー1件');
    expect(i18n.t('map.detail.reviewCount', { count: 2 })).toBe('レビュー2件');
    expect(i18n.t('map.decision.resultsFor', { query: 'カフェ' })).toBe('「カフェ」の検索結果');
  });

  test('reservation distance copy keeps ko/en output and has no mixed-language ja text', async () => {
    const values = { kilometers: '0.4', meters: 350 };
    expect((await createTestI18n('en')).t('reservation.list.distanceNear', values)).toBe('350 m away');
    expect((await createTestI18n('ko')).t('reservation.list.distanceNear', values)).toBe('여기서 0.4km');
    expect((await createTestI18n('ja')).t('reservation.list.distanceNear', values)).toBe('ここから350m');
    expect((await createTestI18n('ja')).t('reservation.list.distanceFar', { kilometers: '2.5', meters: 2500 }))
      .toBe('ここから2.5km');
  });
});

describe('#413 Chinese language preference', () => {
  test.each([
    ['zh-CN', '设置', 'zh-TW'],
    ['zh-TW', '設定', 'zh-CN'],
  ] as const)('explicit %s selection applies immediately, persists, and survives a restart and profile refetch', async (language, title, other) => {
    await initializeI18n('ko');
    await setLanguage(language);
    expect(i18n.resolvedLanguage).toBe(language);
    expect(i18n.t('settings.title')).toBe(title);
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);

    // Relaunch with a profile that carries the other variant, then refetch it after login.
    resetI18nForTests();
    await initializeI18n(other);
    expect(i18n.resolvedLanguage).toBe(language);
    await syncProfileLanguage(other);
    await syncProfileLanguage('ko');
    expect(i18n.resolvedLanguage).toBe(language);
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);
  });

  test('switching between the variants stores the last explicit choice only', async () => {
    await initializeI18n('en');
    await setLanguage('zh-CN');
    await setLanguage('zh-TW');
    expect(i18n.resolvedLanguage).toBe('zh-TW');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh-TW');
    expect(i18n.t('settings.language.title')).toBe(resources['zh-TW'].translation.settings.language.title);
  });

  test('a Chinese profile applies only while there is no stored choice', async () => {
    await initializeI18n('zh-Hant-TW');
    expect(i18n.resolvedLanguage).toBe('zh-TW');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
    await syncProfileLanguage('zh-Hans');
    expect(i18n.resolvedLanguage).toBe('zh-CN');

    resetI18nForTests();
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'ja');
    await initializeI18n('zh-CN');
    expect(i18n.resolvedLanguage).toBe('ja');
    await syncProfileLanguage('zh-TW');
    expect(i18n.resolvedLanguage).toBe('ja');
  });

  test('missing Chinese keys keep the English fallback policy and never fall back across variants', async () => {
    await initializeI18n('zh-TW');
    expect(i18n.options.fallbackLng).toEqual(['en']);
    expect(i18n.t('__missing_413__')).toBe(resources.en.translation.common.missingTranslation);
    expect(i18n.getResourceBundle('zh-TW', 'translation')).toEqual(resources['zh-TW'].translation);
    expect(i18n.getResourceBundle('zh-CN', 'translation')).toEqual(resources['zh-CN'].translation);
    expect(i18n.t('map.detail.reviewCount', { count: 1 })).toBe('1 則評論');
    expect(i18n.t('map.decision.resultsFor', { query: '咖啡' })).toBe('「咖啡」的搜尋結果');
  });
});

describe('#414 Vietnamese language preference', () => {
  test('explicit vi selection applies immediately, persists, and survives a restart and profile refetch', async () => {
    await initializeI18n('ko');
    await setLanguage('vi');
    expect(i18n.resolvedLanguage).toBe('vi');
    expect(i18n.t('settings.title')).toBe('Cài đặt');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('vi');

    resetI18nForTests();
    await initializeI18n('ko');
    expect(i18n.resolvedLanguage).toBe('vi');
    await syncProfileLanguage('en');
    expect(i18n.resolvedLanguage).toBe('vi');
  });

  test('a Vietnamese profile applies only while there is no stored choice', async () => {
    await initializeI18n('en');
    await syncProfileLanguage('vi-VN');
    expect(i18n.resolvedLanguage).toBe('vi');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();

    resetI18nForTests();
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'ko');
    await initializeI18n('vi');
    expect(i18n.resolvedLanguage).toBe('ko');
    await syncProfileLanguage('vi-VN');
    expect(i18n.resolvedLanguage).toBe('ko');
  });

  test('Vietnamese has a single plural category and keeps the English fallback for missing keys', async () => {
    await initializeI18n('vi');
    expect(i18n.options.fallbackLng).toEqual(['en']);
    expect(i18n.t('__missing_414__')).toBe(resources.en.translation.common.missingTranslation);
    expect(i18n.getResourceBundle('vi', 'translation')).toEqual(resources.vi.translation);
    expect(i18n.t('map.detail.reviewCount', { count: 1 })).toBe('1 đánh giá');
    expect(i18n.t('map.detail.reviewCount', { count: 2 })).toBe('2 đánh giá');
    expect(i18n.t('map.decision.resultsFor', { query: 'cà phê' })).toBe('Kết quả cho “cà phê”');
  });
});
