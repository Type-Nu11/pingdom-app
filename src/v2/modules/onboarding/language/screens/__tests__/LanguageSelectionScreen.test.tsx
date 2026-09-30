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
    expect(screen.getByText('영어')).toBeVisible();
    expect(screen.getByText('한국어')).toBeVisible();
    expect(screen.getByText('日本語')).toBeVisible();
    expect(screen.getByTestId('language-option-en')).toBeSelected();
    expect(screen.getByTestId('language-option-check-en')).toBeVisible();
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

  test('검색어로 번역된 언어 이름을 거른다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
    );

    await fireEvent.changeText(screen.getByTestId('language-search-input'), '한');
    expect(screen.getByTestId('language-option-ko')).toBeVisible();
    expect(screen.queryByTestId('language-option-en')).toBeNull();
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
});
