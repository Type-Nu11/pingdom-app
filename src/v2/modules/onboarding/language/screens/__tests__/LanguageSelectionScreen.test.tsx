import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import {
  LANGUAGE_STORAGE_KEY,
  i18n,
  initializeI18n,
  resetI18nForTests,
  supportedLanguages,
} from '../../../../../shared/i18n';
import LanguageSelectionScreen from '../LanguageSelectionScreen';

describe('LanguageSelectionScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('supportedLanguages 전체를 공통 목록 순서대로 렌더링하고 기본 언어를 선택한다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
    );

    expect(supportedLanguages.map((code) => screen.getByTestId(`language-option-${code}`)))
      .toHaveLength(supportedLanguages.length);
    expect(screen.getByText('English')).toBeVisible();
    expect(screen.getByText('한국어')).toBeVisible();
    expect(screen.getByText('日本語')).toBeVisible();
    expect(screen.queryByText('영어')).toBeNull();
    expect(screen.getByTestId('language-option-en')).toBeSelected();
    expect(screen.getByTestId('language-option-check-en')).toBeVisible();
  });

  test.each(['en', 'ja'] as const)('UI 언어가 %s여도 각 언어를 자체 표기로 보여 준다', async (language) => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
      { language },
    );

    expect(screen.getByText('English')).toBeVisible();
    expect(screen.getByText('한국어')).toBeVisible();
    expect(screen.getByText('日本語')).toBeVisible();
    expect(screen.queryByText('Korean')).toBeNull();
    expect(screen.queryByText('韓国語')).toBeNull();
    expect(screen.getByTestId('language-option-ko').props.accessibilityLanguage).toBe('ko');
  });

  test('선택한 언어로 i18n을 바꾸고 저장한 뒤 다음 단계로 넘긴다', async () => {
    resetI18nForTests();
    await initializeI18n();
    await i18n.changeLanguage('en');
    const onNext = jest.fn();
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={onNext} />,
      { i18n },
    );

    await fireEvent.press(screen.getByTestId('language-option-ja'));
    expect(screen.getByTestId('language-option-ja')).toBeSelected();
    expect(screen.queryByTestId('language-option-check-en')).toBeNull();

    await fireEvent.press(screen.getByTestId('language-continue'));

    expect(onNext).toHaveBeenCalledWith('ja');
    await waitFor(() => expect(i18n.resolvedLanguage).toBe('ja'));
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja');
    });
  });

  test('검색어로 자체 표기와 현재 UI 언어 이름을 모두 거른다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
    );

    await fireEvent.changeText(screen.getByTestId('language-search-input'), '한');
    expect(screen.getByTestId('language-option-ko')).toBeVisible();
    expect(screen.queryByTestId('language-option-en')).toBeNull();
    expect(screen.queryByTestId('language-option-ja')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('language-search-input'), 'eng');
    expect(screen.getByTestId('language-option-en')).toBeVisible();
    expect(screen.queryByTestId('language-option-ko')).toBeNull();

    // UI 언어(ko) 이름 '영어'로도 English를 찾는다.
    await fireEvent.changeText(screen.getByTestId('language-search-input'), '영');
    expect(screen.getByTestId('language-option-en')).toBeVisible();
    expect(screen.queryByTestId('language-option-ja')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('language-search-input'), 'zz');
    expect(screen.queryByTestId(/^language-option-/)).toBeNull();
  });

  test('뒤로 가기는 이전 단계로 넘긴다', async () => {
    const onBack = jest.fn();
    await renderWithProviders(
      <LanguageSelectionScreen onBack={onBack} onNext={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
  test.each(['zh-CN', 'zh-TW'] as const)('#413 %s를 선택하면 그 변형 그대로 적용·저장하고 다음 단계로 넘긴다', async (language) => {
    resetI18nForTests();
    await initializeI18n();
    await i18n.changeLanguage('en');
    const onNext = jest.fn();
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={onNext} />,
      { i18n },
    );

    expect(screen.getByText('简体中文')).toBeVisible();
    expect(screen.getByText('繁體中文')).toBeVisible();
    await fireEvent.press(screen.getByTestId(`language-option-${language}`));
    await fireEvent.press(screen.getByTestId('language-continue'));

    expect(onNext).toHaveBeenCalledWith(language);
    await waitFor(() => expect(i18n.resolvedLanguage).toBe(language));
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);
    });
  });

  test('#413 검색어로 간체·번체를 영어 이름과 자체 표기로 찾는다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
      { language: 'en' },
    );

    await fireEvent.changeText(screen.getByTestId('language-search-input'), 'chinese');
    expect(screen.getByTestId('language-option-zh-CN')).toBeVisible();
    expect(screen.getByTestId('language-option-zh-TW')).toBeVisible();
    expect(screen.queryByTestId('language-option-ja')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('language-search-input'), '繁體');
    expect(screen.getByTestId('language-option-zh-TW')).toBeVisible();
    expect(screen.queryByTestId('language-option-zh-CN')).toBeNull();
  });
  test('#414 Tiếng Việt를 선택하면 vi로 적용·저장하고 검색으로도 찾는다', async () => {
    resetI18nForTests();
    await initializeI18n();
    await i18n.changeLanguage('en');
    const onNext = jest.fn();
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={onNext} />,
      { i18n },
    );

    await fireEvent.changeText(screen.getByTestId('language-search-input'), 'viet');
    expect(screen.getByText('Tiếng Việt')).toBeVisible();
    expect(screen.queryByTestId('language-option-en')).toBeNull();
    await fireEvent.press(screen.getByTestId('language-option-vi'));
    await fireEvent.press(screen.getByTestId('language-continue'));

    expect(onNext).toHaveBeenCalledWith('vi');
    await waitFor(() => expect(i18n.resolvedLanguage).toBe('vi'));
    await waitFor(async () => {
      expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('vi');
    });
  });
});
