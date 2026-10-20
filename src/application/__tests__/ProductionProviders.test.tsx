import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components/native';

import { Text } from '../../v2/shared/components';
import { initializeI18n } from '../../v2/shared/i18n';
import { theme } from '../../v2/shared/theme';
import ProductionProviders from '../ProductionProviders';
import { useForegroundWakeWord, type WakeWordAdapter } from '../../v2/modules/voice-assistant';
import { useAppDialog } from '../../v2/shared/components/AppDialogProvider';
import { i18n } from '../../v2/app/i18n';
import { resources } from '../../v2/app/i18n/resources';
import { Pressable } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

const mockUseFonts = jest.fn();
const mockWakeWordAdapter: WakeWordAdapter = {
  available: true,
  requestPermission: async () => 'undetermined',
  createSession: () => { throw new Error('Listening must stay disabled in this test'); },
};

jest.mock('../../v2/modules/voice-assistant/wake-word/useSherpaWakeWordAdapter', () => ({
  useSherpaWakeWordAdapter: () => mockWakeWordAdapter,
}));

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
  beforeEach(async () => {
    await i18n.init({ resources, lng: 'ko', initAsync: false, interpolation: { escapeValue: false } });
    mockUseFonts.mockReturnValue([true, null]);
    mockedInitializeI18n.mockResolvedValue(undefined);
  });

  test('실제 앱 실행 경로에 PingDom 확인창을 제공한다', async () => {
    function DialogProbe() {
      const dialog = useAppDialog();
      return <Pressable accessibilityLabel="open-dialog" onPress={() => dialog.show('앱 디자인 확인창')} />;
    }
    await render(<ProductionProviders><DialogProbe /></ProductionProviders>);
    await fireEvent.press(await screen.findByLabelText('open-dialog'));
    expect(screen.getByTestId('app-dialog')).toBeVisible();
    expect(screen.getByText('앱 디자인 확인창')).toBeVisible();
  });

  test('실제 앱 실행 경로에서 네이티브 호출어 어댑터를 하위 화면에 주입한다', async () => {
    function WakeWordProbe() {
      const wakeWord = useForegroundWakeWord({ enabled: true, focused: true, accountId: 'test', assistantBusy: false }, () => {});
      return <Text>{wakeWord.available ? 'wake-word-ready' : 'wake-word-missing'}</Text>;
    }
    await render(<ProductionProviders><WakeWordProbe /></ProductionProviders>);
    await waitFor(() => expect(screen.getByText('wake-word-ready')).toBeVisible());
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
