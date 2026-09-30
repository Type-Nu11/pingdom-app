import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import LanguageSelectionScreen from '../LanguageSelectionScreen';

// Simulates adding a language to the shared i18n list only.
jest.mock('../../../../../shared/i18n', () => {
  const actual = jest.requireActual('../../../../../shared/i18n');
  return { ...actual, supportedLanguages: [...actual.supportedLanguages, 'zh'] };
});

describe('LanguageSelectionScreen with an added shared language', () => {
  test('공통 i18n 목록에 추가된 언어를 화면 수정 없이 렌더링한다', async () => {
    await renderWithProviders(
      <LanguageSelectionScreen onBack={jest.fn()} onNext={jest.fn()} />,
    );

    expect(['en', 'ko', 'ja', 'zh'].map((code) => screen.getByTestId(`language-option-${code}`)))
      .toHaveLength(4);
  });
});
