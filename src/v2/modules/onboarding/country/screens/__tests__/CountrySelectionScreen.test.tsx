import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../../app/testing/testProviders';
import type { OnboardingCountry } from '../../../entry/model/onboardingEntry';
import CountrySelectionScreen from '../CountrySelectionScreen';

describe('CountrySelectionScreen', () => {
  test.each(['US', 'CN', 'JP', 'TH', 'VN', 'KR'] as const)(
    '%s 선택 시 다른 국가로 바꾸지 않고 그대로 전달한다',
    async (code: OnboardingCountry) => {
      const onNext = jest.fn();
      await renderWithProviders(<CountrySelectionScreen onBack={jest.fn()} onNext={onNext} />, {
        language: 'en',
      });

      await fireEvent.press(screen.getByTestId(`country-option-${code}`));
      await fireEvent.press(screen.getByTestId('country-continue'));

      expect(onNext).toHaveBeenCalledWith(code);
    },
  );

  test('모든 국가를 제한이나 안내 없이 선택 가능하게 렌더링한다', async () => {
    await renderWithProviders(<CountrySelectionScreen onBack={jest.fn()} onNext={jest.fn()} />, {
      language: 'en',
    });

    expect(['US', 'CN', 'JP', 'TH', 'VN', 'KR'].map((code) => screen.getByTestId(`country-option-${code}`)))
      .toHaveLength(6);
    expect(screen.getByTestId('country-continue')).toBeEnabled();
  });

  test('검색 결과가 없으면 목록이 비고 다시 지우면 복원된다', async () => {
    await renderWithProviders(<CountrySelectionScreen onBack={jest.fn()} onNext={jest.fn()} />, {
      language: 'en',
    });

    await fireEvent.changeText(screen.getByTestId('country-search-input'), 'zzzz');
    expect(screen.queryByTestId('country-option-US')).toBeNull();
    await fireEvent.changeText(screen.getByTestId('country-search-input'), '');
    expect(screen.getByTestId('country-option-US')).toBeVisible();
  });
});
