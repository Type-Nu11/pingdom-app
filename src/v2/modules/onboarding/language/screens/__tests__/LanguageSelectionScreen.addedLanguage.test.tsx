import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import LanguageSelectionScreen from '../LanguageSelectionScreen';

// Simulates adding a language to the shared i18n list and its own catalog name.
jest.mock('../../../../../shared/i18n', () => {
  const actual = jest.requireActual('../../../../../shared/i18n');
  return {
    ...actual,
    getLanguageEndonym: (language: string) => (
      language === 'zh' ? '中文' : actual.getLanguageEndonym(language)
    ),
    supportedLanguages: [...actual.supportedLanguages, 'zh'],
  };
});

describe('LanguageSelectionScreen with an added shared language', () => {
  test('공통 i18n 목록에 추가된 언어를 화면 수정 없이 렌더링한다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
    );

    expect(['en', 'ko', 'ja', 'zh'].map((code) => screen.getByTestId(`language-option-${code}`)))
      .toHaveLength(4);
    expect(screen.getByText('中文')).toBeVisible();
  });
});
