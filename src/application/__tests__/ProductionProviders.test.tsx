import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components/native';

import { Text } from '../../v2/shared/components';
import { initializeI18n } from '../../v2/shared/i18n';
import { theme } from '../../v2/shared/theme';
import ProductionProviders from '../ProductionProviders';

const mockUseFonts = jest.fn();

jest.mock('expo-font', () => ({
  useFonts: (...args: unknown[]) => mockUseFonts(...args),
}));

jest.mock('../../v2/shared/i18n', () => {
  const actual = jest.requireActual('../../v2/shared/i18n');

  return {
    ...actual,
    initializeI18n: jest.fn(),
  };
});

const FontProbe = styled.Text`
  font-family: ${({ theme }) => theme.typography.body.fontFamily};
`;

const mockedInitializeI18n = jest.mocked(initializeI18n);

describe('ProductionProviders font initialization', () => {
  beforeEach(() => {
    mockUseFonts.mockReturnValue([true, null]);
    mockedInitializeI18n.mockResolvedValue(undefined);
  });

  test('폰트가 준비될 때까지 기다린 뒤 Pretendard theme으로 앱을 렌더링한다', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    const view = await render(
      <ProductionProviders>
        <FontProbe>ready</FontProbe>
      </ProductionProviders>,
    );

    expect(screen.queryByText('ready')).not.toBeOnTheScreen();

    await waitFor(() => {
      expect(mockedInitializeI18n).toHaveBeenCalledTimes(1);
    });

    mockUseFonts.mockReturnValue([true, null]);
    await view.rerender(
      <ProductionProviders>
        <FontProbe>ready</FontProbe>
      </ProductionProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('ready')).toHaveStyle({ fontFamily: 'Pretendard' });
    });
  });

  test('폰트 로딩 오류가 나면 blank screen에 머물지 않고 system font로 렌더링한다', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockUseFonts.mockReturnValue([false, new Error('private native stack')]);

    const first = await render(
      <ProductionProviders>
        <FontProbe>fallback</FontProbe>
      </ProductionProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('fallback')).toBeVisible();
    });
    expect(screen.getByText('fallback')).not.toHaveStyle({ fontFamily: 'Pretendard' });
    expect(warn).toHaveBeenCalledWith('[Fonts] Pretendard unavailable; using system font.');

    await first.unmount();
    await render(
      <ProductionProviders>
        <FontProbe>fallback after remount</FontProbe>
      </ProductionProviders>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  test('중첩된 V2 theme 경계에서도 font 오류의 system fallback을 유지한다', async () => {
    mockUseFonts.mockReturnValue([false, new Error('font unavailable')]);

    await render(
      <ProductionProviders>
        <ThemeProvider theme={theme}>
          <Text>nested fallback</Text>
        </ThemeProvider>
      </ProductionProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText('nested fallback')).toBeVisible();
    });
    expect(screen.getByText('nested fallback')).not.toHaveStyle({ fontFamily: 'Pretendard' });
  });

  test('폰트가 준비돼도 i18n 초기화 중에는 앱을 렌더링하지 않는다', async () => {
    mockedInitializeI18n.mockReturnValue(new Promise<void>(() => undefined));

    const view = await render(
      <ProductionProviders>
        <FontProbe>waiting-for-i18n</FontProbe>
      </ProductionProviders>,
    );

    expect(screen.queryByText('waiting-for-i18n')).not.toBeOnTheScreen();
    view.unmount();
  });
});
