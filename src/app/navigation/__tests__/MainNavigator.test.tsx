import { screen } from '@testing-library/react-native';
import React from 'react';

import { createTestI18n, renderWithProviders } from '../../../v2/shared/testing/testProviders';
import { MapRouteScreen } from '../MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../types';

jest.mock('../../../features/place/screens/MapScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => ReactLibrary.createElement(
      ReactNative.View,
      { testID: 'current-map-screen' },
    ),
  };
});

const navigation = {
  navigate: jest.fn(),
  setParams: jest.fn(),
} as unknown as MainScreenProps<'Map'>['navigation'];

const route = {
  key: 'Map-test',
  name: MAIN_ROUTES.Map,
  params: undefined,
} as MainScreenProps<'Map'>['route'];

describe('현재 지도 경계', () => {
  test('MainNavigator의 지도 화면을 렌더링한다', async () => {
    const i18n = await createTestI18n();
    await renderWithProviders(
      <MapRouteScreen navigation={navigation} route={route} />,
      { i18n },
    );

    expect(screen.getByTestId('current-map-screen')).toBeVisible();
  });
});
