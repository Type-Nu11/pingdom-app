import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'styled-components/native';

import { createTestI18n } from '../../../../app/testing/testProviders';
import { darkTheme, lightTheme } from '../../../../shared/theme';
import OnboardingFlow from '../OnboardingFlow';

jest.mock('../../preferences', () => ({
  OnboardingPreferenceFlow: () => null,
}));

describe('OnboardingFlow 시스템 테마 전환', () => {
  test('테마가 바뀌어도 진행 단계와 선택한 국가가 유지된다', async () => {
    const i18n = await createTestI18n('en');
    const tree = (theme: typeof lightTheme) => (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <OnboardingFlow onComplete={jest.fn()} />
        </ThemeProvider>
      </I18nextProvider>
    );
    const view = await render(tree(lightTheme));

    await fireEvent.press(screen.getByTestId('welcome-start'));
    await fireEvent.press(screen.getByTestId('language-continue'));
    await fireEvent.press(screen.getByTestId('country-option-VN'));
    await fireEvent.changeText(screen.getByTestId('country-search-input'), 'Viet');

    await view.rerender(tree(darkTheme));

    expect(screen.getByTestId('country-selection-screen')).toBeVisible();
    expect(screen.getByTestId('country-option-VN')).toBeSelected();
    expect(screen.getByTestId('country-search-input').props.value).toBe('Viet');

    await fireEvent.press(screen.getByTestId('country-continue'));
    await view.rerender(tree(lightTheme));
    expect(screen.getByTestId('birth-year-screen')).toBeVisible();
  });
});
