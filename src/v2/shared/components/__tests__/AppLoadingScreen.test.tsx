import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../theme';
import AppLoadingScreen from '../AppLoadingScreen';

describe('AppLoadingScreen', () => {
  test.each([
    ['LIGHT', lightColors.background, '#FFFFFF'],
    ['DARK', darkColors.background, '#0F0F11'],
  ] as const)('%s uses the Figma background with the logo only', async (appearancePreference, background, figmaHex) => {
    await renderWithProviders(<AppLoadingScreen />, { appearancePreference });

    expect(background).toBe(figmaHex);
    expect(screen.getByTestId('app-loading-screen')).toHaveStyle({ backgroundColor: figmaHex, flexGrow: 1 });
    expect(screen.getByTestId('app-loading-logo').props).toMatchObject({ height: 111, width: 97 });
  });

  test('lifts the logo so its bottom edge sits on the vertical center', async () => {
    await renderWithProviders(<AppLoadingScreen />);

    expect(screen.getByTestId('app-loading-screen')).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 111,
    });
  });
});
