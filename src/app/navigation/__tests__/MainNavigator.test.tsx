import { screen } from '@testing-library/react-native';
import React from 'react';

import { registerPlaceReportResources } from '../../../v2/features/place-report/i18n/placeReportResources';
import { createTestI18n, renderWithProviders } from '../../../v2/shared/testing/testProviders';
import { MapRouteScreen } from '../MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../types';

jest.mock('../../../features/place/screens/MapScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: () => ReactLibrary.createElement(ReactNative.View, { testID: 'current-map-screen' }),
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

describe('현재 지도와 V2 장소 제보 경계', () => {
  test('현재 지도에서 장소 제보 흐름으로 진입한다', async () => {
    const i18n = await createTestI18n();
    registerPlaceReportResources(i18n);
    const { user } = await renderWithProviders(
      <MapRouteScreen navigation={navigation} route={route} />,
      { i18n },
    );

    expect(screen.getByTestId('current-map-screen')).toBeVisible();
    await user.press(screen.getByTestId('current-map-place-report'));

    expect(navigation.navigate).toHaveBeenCalledWith(MAIN_ROUTES.PlaceReport);
  });
});
