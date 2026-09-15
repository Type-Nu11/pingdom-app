import { act, render, screen, waitFor } from '@testing-library/react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { useTheme } from 'styled-components/native';

import { createAppearanceStore } from '../appearanceStore';
import type { AppearanceStorage } from '../appearanceStorage';
import {
  AppThemeProvider,
  useAppearance,
  useAppNavigationTheme,
} from '../AppThemeProvider';

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));

const createStorage = (stored: string | null = null): AppearanceStorage => ({
  getItem: jest.fn().mockResolvedValue(stored),
  setItem: jest.fn().mockResolvedValue(undefined),
});

function Probe() {
  const theme = useTheme();
  const appearance = useAppearance();
  const navigationTheme = useAppNavigationTheme();
  const [mountId] = useState(() => 'stable-child-state');
  return (
    <>
      <Text>{`${appearance.preference}:${appearance.resolvedScheme}`}</Text>
      <Text>{theme.colors.background}</Text>
      <Text>{navigationTheme.colors.background}</Text>
      <Text>{mountId}</Text>
    </>
  );
}

describe('AppThemeProvider', () => {
  test('does not render a light frame before stored DARK hydration completes', async () => {
    let release!: (value: string | null) => void;
    const target = createStorage();
    jest.mocked(target.getItem).mockReturnValueOnce(new Promise((resolve) => { release = resolve; }));
    const store = createAppearanceStore(target);
    await render(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride="light">
        <Probe />
      </AppThemeProvider>,
    );
    expect(screen.queryByText('#0F0F11')).not.toBeOnTheScreen();
    expect(screen.queryByText('#FFFFFF')).not.toBeOnTheScreen();
    await act(async () => release('DARK'));
    await waitFor(() => expect(screen.getByText('DARK:dark')).toBeVisible());
    expect(screen.getAllByText('#0F0F11')).toHaveLength(2);
  });

  test('releases the boot gate with SYSTEM when storage never responds', async () => {
    jest.useFakeTimers();
    const target = createStorage();
    jest.mocked(target.getItem).mockReturnValueOnce(new Promise(() => undefined));
    const store = createAppearanceStore(target);
    await render(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride="dark">
        <Probe />
      </AppThemeProvider>,
    );

    expect(screen.queryByText('SYSTEM:dark')).not.toBeOnTheScreen();
    await act(async () => { await jest.advanceTimersByTimeAsync(1_000); });
    expect(screen.getByText('SYSTEM:dark')).toBeVisible();
    jest.useRealTimers();
  });

  test('SYSTEM follows system changes without remounting child state', async () => {
    const store = createAppearanceStore(createStorage('SYSTEM'));
    const view = await render(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride="light">
        <Probe />
      </AppThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText('SYSTEM:light')).toBeVisible());
    await view.rerender(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride="dark">
        <Probe />
      </AppThemeProvider>,
    );
    expect(screen.getByText('SYSTEM:dark')).toBeVisible();
    expect(screen.getByText('stable-child-state')).toBeVisible();
  });

  test.each([
    ['LIGHT', 'dark', 'LIGHT:light'],
    ['DARK', 'light', 'DARK:dark'],
  ] as const)('%s ignores system %s', async (preference, systemScheme, expected) => {
    const store = createAppearanceStore(createStorage(preference));
    await render(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride={systemScheme}>
        <Probe />
      </AppThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText(expected)).toBeVisible());
  });

  test('synchronizes status bar with the resolved dark scheme', async () => {
    const store = createAppearanceStore(createStorage('DARK'));
    const view = await render(
      <AppThemeProvider appearanceStore={store} fontFamily="Test" systemSchemeOverride="light">
        <Probe />
      </AppThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText('DARK:dark')).toBeVisible());
    const statusBarProps = jest.mocked(StatusBar).mock.calls.at(-1)?.[0];
    expect(statusBarProps).toMatchObject({ style: 'light', backgroundColor: '#0F0F11' });
  });
});
